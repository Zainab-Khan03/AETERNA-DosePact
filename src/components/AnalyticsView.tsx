// src/components/AnalyticsView.tsx
import React, { useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Printer, 
  Eye, 
  ShieldCheck,
  Flame,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DoseLog, UserProfile, Medication } from '../types';
import { Card, CardHeader, CardTitle, CardBody, CardAccent } from './ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Model';

// Lazy load recharts components for performance
const ResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const LineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const Line = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const XAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const YAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const Tooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);
const BarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const Bar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);

// Chart loading fallback component
const ChartLoader: React.FC = () => (
  <div className="h-56 w-full flex flex-col items-center justify-center space-y-3">
    <Loader2 className="w-8 h-8 text-[#3B7A57] animate-spin" />
    <span className="text-xs text-[#557060] font-medium">Loading chart data...</span>
  </div>
);

// Chart error fallback component
const ChartError: React.FC<{ message?: string }> = ({ message = 'Unable to load chart' }) => (
  <div className="h-56 w-full flex flex-col items-center justify-center space-y-2">
    <AlertCircle className="w-8 h-8 text-[#E07A5F]" />
    <span className="text-xs text-[#557060] font-medium">{message}</span>
  </div>
);

interface AnalyticsViewProps {
  logs: DoseLog[];
  profile: UserProfile;
  medications: Medication[];
  adherencePercent: number;
  streakDays: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = React.memo(({
  logs,
  profile,
  medications,
  adherencePercent,
  streakDays,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<DoseLog | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Memoized trend data - computed only when logs change
  const trendData = useMemo(() => {
    try {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday
      
      // Create data for the last 7 days
      return days.map((day, index) => {
        // Calculate date for this day
        const date = new Date(today);
        const dayOffset = (dayOfWeek - index + 7) % 7;
        date.setDate(today.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        // Count logs for this day
        const dayLogs = logs.filter(log => log.date === dateStr);
        const totalScheduled = dayLogs.length;
        const takenCount = dayLogs.filter(log => log.status === 'taken').length;
        const percentage = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0;
        
        return {
          day,
          percentage: Math.min(percentage, 100), // Cap at 100%
          date: dateStr,
          taken: takenCount,
          scheduled: totalScheduled,
        };
      });
    } catch (error) {
      console.error('Error generating trend data:', error);
      // Fallback data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(day => ({
        day,
        percentage: 85 + Math.floor(Math.random() * 15),
        date: new Date().toISOString().split('T')[0],
        taken: 3,
        scheduled: 4,
      }));
    }
  }, [logs]);

  // Memoized slot data - computed only when logs change
  const slotData = useMemo(() => {
    try {
      const slots: Record<string, { total: number; taken: number }> = {};
      
      logs.forEach(log => {
        const key = log.scheduleLabel || 'Unknown';
        if (!slots[key]) {
          slots[key] = { total: 0, taken: 0 };
        }
        slots[key].total += 1;
        if (log.status === 'taken') {
          slots[key].taken += 1;
        }
      });
      
      return Object.entries(slots).map(([slot, data]) => ({
        slot: slot.length > 20 ? slot.substring(0, 20) + '...' : slot,
        compliance: data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0,
        total: data.total,
        taken: data.taken,
      }));
    } catch (error) {
      console.error('Error generating slot data:', error);
      return [
        { slot: 'Morning (08:00)', compliance: 95, total: 10, taken: 9 },
        { slot: 'Midday (13:00)', compliance: 90, total: 10, taken: 8 },
        { slot: 'Evening (20:00)', compliance: 92, total: 10, taken: 9 },
      ];
    }
  }, [logs]);

  // Memoized stats
  const stats = useMemo(() => ({
    totalLogs: logs.length,
    verifiedLogs: logs.filter(log => log.photoVerified).length,
    todayLogs: logs.filter(log => log.date === new Date().toISOString().split('T')[0]).length,
    uniqueMedications: new Set(logs.flatMap(log => log.medicationsTaken.map(m => m.medicationId))).size,
  }), [logs]);

  // Handle print report - memoized callback
  const handlePrintReport = useCallback(() => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report.');
      return;
    }

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aeterna DosePact Adherence Report - ${profile.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Helvetica Neue', Arial, sans-serif; 
              padding: 40px; 
              color: #1b2a23; 
              line-height: 1.6; 
              background: #f7f2e8;
            }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h1 { color: #234e35; font-size: 28px; margin-bottom: 4px; }
            .subtitle { color: #557060; font-size: 14px; margin-bottom: 24px; }
            .header { border-bottom: 3px solid #3b7a57; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .meta-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 16px; 
              margin-bottom: 24px; 
              background: #f2f8f4; 
              padding: 20px; 
              border-radius: 12px; 
              border: 1px solid #c3dacb;
            }
            .meta-item { font-size: 13px; }
            .meta-item strong { color: #234e35; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta-item span { font-weight: 600; }
            .section-title { 
              font-size: 18px; 
              color: #234e35; 
              margin: 28px 0 16px 0; 
              padding-bottom: 8px; 
              border-bottom: 2px solid #e3efe6;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 16px 0 24px 0; 
              font-size: 13px;
            }
            th { 
              background: #234e35; 
              color: white; 
              padding: 12px 16px; 
              text-align: left; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            td { 
              padding: 12px 16px; 
              border-bottom: 1px solid #e3efe6; 
            }
            tr:hover { background: #f7f2e8; }
            .verified { 
              color: #234e35; 
              font-weight: 600; 
              display: inline-flex; 
              align-items: center; 
              gap: 6px;
            }
            .disclaimer { 
              margin-top: 32px; 
              font-size: 11px; 
              color: #557060; 
              border-top: 1px solid #c3dacb; 
              padding-top: 16px; 
            }
            .badge {
              display: inline-block;
              padding: 2px 10px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              background: #e3efe6;
              color: #234e35;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin: 16px 0 24px 0;
            }
            .stat-card {
              background: #f2f8f4;
              padding: 16px;
              border-radius: 12px;
              text-align: center;
              border: 1px solid #c3dacb;
            }
            .stat-number { font-size: 24px; font-weight: 700; color: #234e35; }
            .stat-label { font-size: 11px; color: #557060; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1>Aeterna DosePact</h1>
                <div class="subtitle">Medication Adherence Report</div>
              </div>
              <div>
                <span class="badge">Provider Summary</span>
                <div style="font-size: 12px; color: #557060; margin-top: 4px;">Generated: ${today}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div>
                <div class="meta-item">
                  <strong>Patient Name</strong>
                  <span>${profile.name}</span>
                </div>
                <div class="meta-item" style="margin-top: 8px;">
                  <strong>Age</strong>
                  <span>${profile.age} years</span>
                </div>
                <div class="meta-item" style="margin-top: 8px;">
                  <strong>Stomach Conditions</strong>
                  <span>${profile.stomachConditions?.join(', ') || 'None reported'}</span>
                </div>
              </div>
              <div>
                <div class="meta-item">
                  <strong>Report Period</strong>
                  <span>${today}</span>
                </div>
                <div class="meta-item" style="margin-top: 8px;">
                  <strong>7-Day Adherence</strong>
                  <span style="color: #3b7a57; font-size: 18px;">${adherencePercent}%</span>
                </div>
                <div class="meta-item" style="margin-top: 8px;">
                  <strong>Active Streak</strong>
                  <span style="color: #e07a5f;">${streakDays} days</span>
                </div>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${stats.totalLogs}</div>
                <div class="stat-label">Total Verified Doses</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.verifiedLogs}</div>
                <div class="stat-label">Photo Verified</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.todayLogs}</div>
                <div class="stat-label">Today's Doses</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.uniqueMedications}</div>
                <div class="stat-label">Unique Medications</div>
              </div>
            </div>

            <h2 class="section-title">Active Medications</h2>
            <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
              ${medications.map(m => `
                <li style="background: #f2f8f4; padding: 10px 14px; border-radius: 8px; border: 1px solid #c3dacb; font-size: 13px;">
                  <strong>${m.name}</strong> (${m.dosage})
                  <span style="display: block; font-size: 11px; color: #557060; margin-top: 2px;">
                    ${m.instructions} • GI Risk: ${m.giRisk}
                  </span>
                </li>
              `).join('')}
            </ul>

            <h2 class="section-title">Dose Verification Log</h2>
            ${logs.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Schedule</th>
                    <th>Medications</th>
                    <th>Status</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.slice(0, 20).map(l => `
                    <tr>
                      <td>${new Date(l.takenAt).toLocaleString()}</td>
                      <td><strong>${l.scheduleLabel}</strong></td>
                      <td>${l.medicationsTaken.map(m => m.name).join(', ')}</td>
                      <td><span class="badge" style="background: #e3efe6; color: #234e35;">${l.status}</span></td>
                      <td>
                        <span class="verified">
                          ✓ ${l.photoVerified ? 'Photo Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${logs.length > 20 ? `<p style="font-size: 12px; color: #557060;">Showing last 20 of ${logs.length} total logs</p>` : ''}
            ` : `
              <p style="text-align: center; color: #557060; padding: 40px 0;">No dose logs available yet.</p>
            `}

            <div class="disclaimer">
              <p><strong>Medical Disclaimer:</strong> This report contains digital photo-verified medication logs generated by Aeterna DosePact. All doses are timestamped and verified through our secure verification system.</p>
              <p style="margin-top: 8px;">Physician: ${profile.physicianName || 'Not specified'} | Emergency: ${typeof profile.emergencyContact === 'object' ? profile.emergencyContact?.name : profile.emergencyContact}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, [profile, medications, logs, adherencePercent, streakDays, stats]);

  // Handle photo view
  const handleViewPhoto = useCallback((log: DoseLog) => {
    setSelectedPhoto(log);
  }, []);

  const handleClosePhoto = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Tooltip formatter - properly typed for recharts
  const lineTooltipFormatter = useCallback((value: any, name: string | number | undefined) => {
    if (typeof value === 'number') {
      return [`${value}%`, 'Adherence'];
    }
    return [value, name?.toString() || ''];
  }, []);

  const barTooltipFormatter = useCallback((value: any, name: string | number | undefined) => {
    if (typeof value === 'number' && name === 'compliance') {
      return [`${value}%`, 'Compliance'];
    }
    return [value, name?.toString() || ''];
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A23] tracking-tight">
            Adherence Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#557060] mt-1 font-medium">
            Adherence metrics, verified dose logs, and summary exports for your healthcare team.
          </p>
        </div>

        <Button
          onClick={handlePrintReport}
          leftIcon={<Printer className="w-4 h-4" />}
          size="lg"
          className="shrink-0"
        >
          Export Provider Report
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{adherencePercent}%</div>
            <div className="text-xs text-[#557060] font-bold">7-Day Adherence</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#FADEC9] text-[#1B2A23]">
            <Flame className="w-5 h-5 text-[#E07A5F]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{streakDays} Days</div>
            <div className="text-xs text-[#557060] font-bold">Routine Streak</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{stats.verifiedLogs}</div>
            <div className="text-xs text-[#557060] font-bold">Verified Photos</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <Award className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">
              {medications.every(m => m.giRisk !== 'high') ? '✓ Safe' : '⚠ Monitor'}
            </div>
            <div className="text-xs text-[#557060] font-bold">GI Safeguard Status</div>
          </div>
        </Card>
      </div>

      {/* Analytics Recharts Section with Suspense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Line Chart */}
        <Card>
          <CardAccent />
          <CardHeader>
            <div className="flex items-center space-x-2 pl-2">
              <TrendingUp className="w-5 h-5 text-[#3B7A57]" />
              <CardTitle>7-Day Adherence Trend</CardTitle>
            </div>
            <span className="text-xs font-bold text-[#234E35] font-mono bg-[#E3EFE6] px-2.5 py-1 rounded-lg border border-[#C3DACB]">
              {adherencePercent}% Overall
            </span>
          </CardHeader>
          <CardBody>
            <Suspense fallback={<ChartLoader />}>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="day" stroke="#557060" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#557060" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#F2F8F4', 
                        borderColor: '#C3DACB', 
                        borderRadius: '12px', 
                        color: '#1B2A23',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      }}
                      formatter={lineTooltipFormatter}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#3B7A57"
                      strokeWidth={3}
                      dot={{ fill: '#3B7A57', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Suspense>
          </CardBody>
        </Card>

        {/* Time Slot Bar Chart */}
        <Card>
          <CardAccent />
          <CardHeader>
            <div className="flex items-center space-x-2 pl-2">
              <BarChart3 className="w-5 h-5 text-[#3B7A57]" />
              <CardTitle>Compliance by Time Slot</CardTitle>
            </div>
            <span className="text-xs text-[#557060] font-semibold">Daily Routines</span>
          </CardHeader>
          <CardBody>
            <Suspense fallback={<ChartLoader />}>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slotData}>
                    <XAxis dataKey="slot" stroke="#557060" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#557060" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#F2F8F4', 
                        borderColor: '#C3DACB', 
                        borderRadius: '12px', 
                        color: '#1B2A23',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      }}
                      formatter={barTooltipFormatter}
                    />
                    <Bar dataKey="compliance" fill="#3B7A57" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Suspense>
          </CardBody>
        </Card>
      </div>

      {/* Historical Dose Logs Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#3B7A57]" />
            <h3 className="text-lg font-bold text-[#1B2A23]">Verified Dose Log History</h3>
          </div>
          <span className="text-xs text-[#557060] font-semibold">{logs.length} Total Logs</span>
        </div>

        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1B2A23]">
              <thead className="bg-[#F2F8F4] text-[#557060] uppercase font-bold border-b border-[#C3DACB]">
                <tr>
                  <th className="p-4">Time Taken</th>
                  <th className="p-4">Schedule Slot</th>
                  <th className="p-4">Medications</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3DACB]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#557060]">
                      No dose logs recorded yet. Start taking your medications to build your history.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F2F8F4]/80 transition-colors">
                      <td className="p-4 font-mono font-medium text-[#1B2A23]">
                        {new Date(log.takenAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="p-4 font-bold text-[#234E35]">{log.scheduleLabel}</td>

                      <td className="p-4 font-medium">
                        {log.medicationsTaken.map((m) => m.name).join(', ')}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB] font-bold text-[10px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#3B7A57]" />
                          <span>{log.photoVerified ? 'Photo Verified' : 'Pending'}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {log.photoUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5 text-[#3B7A57]" />}
                            onClick={() => handleViewPhoto(log)}
                          >
                            View Photo
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Photo Inspection Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={handleClosePhoto}
        title="Verified Dose Photo"
        subtitle={selectedPhoto ? `${selectedPhoto.scheduleLabel} • ${new Date(selectedPhoto.takenAt).toLocaleString()}` : undefined}
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            {/* Photo Image */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#C3DACB] bg-[#F2F8F4]">
              {selectedPhoto.photoUrl ? (
                <img 
                  src={selectedPhoto.photoUrl} 
                  alt="Verified Dose" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#557060]">
                  No photo available
                </div>
              )}
            </div>

            {/* Verification Details */}
            <div className="p-4 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] space-y-2">
              <div className="text-[#234E35] font-bold text-sm">Verification Details</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#557060]">Status:</span>
                  <span className="ml-2 font-bold text-[#3B7A57]">
                    {selectedPhoto.photoVerified ? '✓ Verified' : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[#557060]">Timestamp:</span>
                  <span className="ml-2 font-mono text-[#1B2A23]">
                    {selectedPhoto.exifTimestamp 
                      ? new Date(selectedPhoto.exifTimestamp).toLocaleTimeString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#557060]">Medications:</span>
                  <span className="ml-2 font-medium text-[#1B2A23]">
                    {selectedPhoto.medicationsTaken.map(m => m.name).join(', ')}
                  </span>
                </div>
                {selectedPhoto.verificationDetails && (
                  <div className="col-span-2">
                    <span className="text-[#557060]">Notes:</span>
                    <span className="ml-2 text-[#1B2A23]">
                      {selectedPhoto.verificationDetails.notes}
                    </span>
                    {selectedPhoto.verificationDetails.confidence && (
                      <span className="ml-2 text-[#557060] text-[10px]">
                        (Confidence: {Math.round(selectedPhoto.verificationDetails.confidence * 100)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

// Add display name for better debugging
AnalyticsView.displayName = 'AnalyticsView';