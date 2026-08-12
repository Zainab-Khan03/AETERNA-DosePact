// server/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AETERNA DosePact API',
      version: '1.0.0',
      description: `
        AETERNA DosePact - Medication Adherence Hub API
        Secure photo-verified medication tracking with AI-powered interactions.
      `,
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'AETERNA DosePact Support',
        email: 'support@dosepact.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
      {
        url: 'https://api.dosepact.com/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_123456' },
            email: { type: 'string', format: 'email', example: 'patient@example.com' },
            firstName: { type: 'string', example: 'Eleanor' },
            lastName: { type: 'string', example: 'Vance' },
            dateOfBirth: { type: 'string', format: 'date', example: '1988-04-12' },
            phoneNumber: { type: 'string', example: '+15553928811' },
            isEmailVerified: { type: 'boolean', example: true },
            preferences: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'America/New_York' },
                notificationEnabled: { type: 'boolean', example: true },
              },
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Dr. Arthur Vance' },
                phoneNumber: { type: 'string', example: '+15559981244' },
                relationship: { type: 'string', example: 'Primary Care Physician' },
              },
            },
            stomachConditions: {
              type: 'array',
              items: { type: 'string' },
              example: ['Acid Reflux / GERD', 'Sensitive Gastric Mucosa'],
            },
            physicianName: { type: 'string', example: 'Dr. Marcus Vance, M.D.' },
            physicianPhone: { type: 'string', example: '+15559981244' },
            onboardingCompleted: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Medication: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'med-101' },
            name: { type: 'string', example: 'Ibuprofen' },
            dosage: { type: 'string', example: '400mg' },
            category: { 
              type: 'string', 
              enum: ['prescription', 'over-the-counter', 'supplement'],
              example: 'prescription',
            },
            instructions: { type: 'string', example: 'Take with food or milk' },
            foodRequirement: {
              type: 'string',
              enum: ['with_food', 'empty_stomach', 'no_restriction'],
              example: 'with_food',
            },
            giRisk: {
              type: 'string',
              enum: ['low', 'moderate', 'high'],
              example: 'high',
            },
            stockCount: { type: 'number', example: 15 },
            sideEffects: {
              type: 'array',
              items: { type: 'string' },
              example: ['Stomach irritation', 'Heartburn'],
            },
          },
        },
        ScheduleSlot: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'sched-1' },
            time: { type: 'string', example: '08:00' },
            label: { type: 'string', example: 'Morning Dose' },
            medicationIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['med-1', 'med-4'],
            },
            recurringDays: {
              type: 'array',
              items: { type: 'number' },
              description: '0=Sunday, 1=Monday, ..., 6=Saturday',
              example: [0, 1, 2, 3, 4, 5, 6],
            },
            isEnabled: { type: 'boolean', example: true },
            notes: { type: 'string', example: 'Take with breakfast' },
          },
        },
        DoseLog: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'log-101' },
            scheduleId: { type: 'string', example: 'sched-1' },
            scheduleLabel: { type: 'string', example: 'Morning Dose' },
            scheduledTime: { type: 'string', example: '08:00' },
            date: { type: 'string', format: 'date', example: '2026-08-11' },
            medicationsTaken: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  medicationId: { type: 'string' },
                  name: { type: 'string' },
                  dosage: { type: 'string' },
                },
              },
            },
            takenAt: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['taken', 'missed', 'snoozed', 'pending'],
              example: 'taken',
            },
            photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
            photoVerified: { type: 'boolean', example: true },
            verificationDetails: {
              type: 'object',
              properties: {
                pillsDetected: { type: 'boolean' },
                handDetected: { type: 'boolean' },
                confidence: { type: 'number' },
                notes: { type: 'string' },
              },
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        sessionAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'User', description: 'User management' },
      { name: 'Medications', description: 'Medication management' },
      { name: 'Schedules', description: 'Schedule management' },
      { name: 'Alarms', description: 'Alarm and notification settings' },
      { name: 'Analytics', description: 'Adherence analytics' },
      { name: 'AI', description: 'AI-powered features' },
    ],
  },
  apis: ['./server/routes/*.ts', './server/models/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AETERNA DosePact API Documentation',
  }));

  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('[Swagger] API documentation available at /api-docs');
};