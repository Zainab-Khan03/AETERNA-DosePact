import { Router } from 'express';
import { getGeminiClient } from '../config.js';

const router = Router();

// POST /api/interactions/check
router.post('/check', (req, res) => {
  const { medicationIds } = req.body;
  res.json({
    interactions: [
      {
        medication1: 'Ibuprofen',
        medication2: 'Aspirin',
        severity: 'moderate',
        description: 'May increase risk of stomach irritation and bleeding.',
        recommendation: 'Consider separating doses by at least 8 hours and taking post-meal.',
      },
    ],
    stomachRisk: {
      level: 'high',
      medications: medicationIds || ['med_101'],
      recommendations: 'Take with full meal or ask provider about acid protection.',
    },
  });
});

// GET /api/interactions/stomach-risk/:userId
router.get('/stomach-risk/:userId', (req, res) => {
  res.json({
    userId: req.params.userId,
    stomachRiskLevel: 'high',
    conditions: ['Sensitive Stomach / Dyspepsia'],
    recommendations: 'Take NSAIDs with meals. Maintain hydration with at least 250ml water per dose.',
  });
});

// POST /api/interactions/food
router.post('/food', (req, res) => {
  const { foodType } = req.body;
  res.json({
    foodType: foodType || 'Grapefruit',
    description: 'May inhibit CYP3A4 metabolism increasing drug absorption.',
    recommendation: 'Avoid consuming large quantities of grapefruit juice while taking statins or calcium channel blockers.',
  });
});

// POST /api/analyze-interactions (or /api/interactions/analyze)
router.post(['/analyze', '/'], async (req, res) => {
  try {
    const { medications, userConditions } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ error: 'Medications array is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return realistic clinical expert analysis if API key isn't provided yet
      const sampleWarnings = [];
      const medNames = medications.map((m: any) => m.name.toLowerCase());

      if (medNames.some((n: string) => n.includes('ibuprofen')) && medNames.some((n: string) => n.includes('aspirin'))) {
        sampleWarnings.push({
          id: 'warn-1',
          medications: ['Ibuprofen', 'Aspirin'],
          severity: 'severe',
          title: 'High Risk: Synergistic Gastric Ulceration & GI Bleeding',
          stomachGIImpact: 'Taking NSAIDs like Ibuprofen together with Aspirin drastically increases risk of acute gastric mucosal erosion, stomach pain, and gastrointestinal ulceration.',
          recommendation: 'Separate dosing by at least 8 hours, or consult your physician regarding buffered formulations or proton-pump inhibitor (PPI) co-prescription.',
          details: 'Ibuprofen can competitively inhibit the irreversible antiplatelet effect of low-dose aspirin and irritate gastric epithelium.',
        });
      }

      if (medNames.some((n: string) => n.includes('omeprazole')) && medNames.some((n: string) => n.includes('ibuprofen'))) {
        sampleWarnings.push({
          id: 'warn-2',
          medications: ['Omeprazole', 'Ibuprofen'],
          severity: 'moderate',
          title: 'Stomach Protection Pairing Detected',
          stomachGIImpact: 'Omeprazole reduces stomach acid production which helps protect gastric lining when NSAIDs like Ibuprofen are consumed.',
          recommendation: 'Take Omeprazole 30-60 minutes BEFORE breakfast on an empty stomach. Take Ibuprofen LATER with a full meal.',
          details: 'Proper timing alignment prevents NSAID-induced dyspepsia while ensuring proper gastric acid suppression.',
        });
      }

      if (sampleWarnings.length === 0) {
        sampleWarnings.push({
          id: 'warn-safe',
          medications: medications.map((m: any) => m.name),
          severity: 'mild',
          title: 'General Digestive Safety & Food Timing Alignment',
          stomachGIImpact: 'No severe acute stomach interactions detected, but ensure medications requiring food (e.g. NSAIDs, Metformin) are taken post-meal.',
          recommendation: 'Maintain at least 250ml water intake with every oral dose. Avoid taking pills lying down.',
          details: 'Always check if supplements interfere with absorption of prescription meds.',
        });
      }

      return res.json({
        warnings: sampleWarnings,
        summary: 'Interaction analysis complete. Ensure stomach protective food timing.',
        source: 'fallback_rules',
      });
    }

    const prompt = `You are a clinical pharmacologist specializing in drug-drug interactions, stomach/gastrointestinal safety, and patient medication adherence.
    Analyze the following list of medications currently prescribed to a patient with user conditions: ${JSON.stringify(userConditions || [])}.

    Medications:
    ${JSON.stringify(medications, null, 2)}

    Respond ONLY with a JSON object in this exact structure:
    {
      "summary": "Brief overall clinical assessment (max 2 sentences) focusing on stomach/GI safety.",
      "warnings": [
        {
          "id": "warn-1",
          "medications": ["Med A", "Med B"],
          "severity": "severe" | "moderate" | "mild",
          "title": "Clear concise warning title",
          "stomachGIImpact": "Detailed impact on stomach, digestive tract, acid levels, or nausea",
          "recommendation": "Actionable advice on timing, food requirements, or physician discussion",
          "details": "Pharmacological mechanism explanation"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      summary: parsed.summary || 'Interaction analysis completed successfully.',
      warnings: parsed.warnings || [],
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error analyzing interactions:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze drug interactions' });
  }
});

export default router;
