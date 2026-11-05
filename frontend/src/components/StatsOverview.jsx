import React from 'react';
import { Users, AlertTriangle, Droplets, HeartPulse } from 'lucide-react';

export default function StatsOverview({ stats, loading }) {
  const total = stats?.total_patients || 0;
  const criticalAndHigh = (stats?.risk_breakdown?.Critical || 0) + (stats?.risk_breakdown?.High || 0);
  const avgGlucose = stats?.averages?.glucose || 0;
  const avgCholesterol = stats?.averages?.cholesterol || 0;

  const cards = [
    {
      title: 'Total Patients Registered',
      value: loading ? '...' : total,
      subtitle: `${stats?.risk_breakdown?.Low || 0} Low, ${stats?.risk_breakdown?.Moderate || 0} Moderate`,
      icon: Users,
      color: 'blue',
      badge: total > 0 ? 'Active Records' : 'Empty Database',
      badgeColor: total > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600',
    },
    {
      title: 'High / Critical Disease Risk',
      value: loading ? '...' : criticalAndHigh,
      subtitle: `${stats?.risk_breakdown?.Critical || 0} Critical, ${stats?.risk_breakdown?.High || 0} High`,
      icon: AlertTriangle,
      color: 'rose',
      badge: criticalAndHigh > 0 ? 'Requires Action' : 'Optimal',
      badgeColor: criticalAndHigh > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Average Fasting Glucose',
      value: loading ? '...' : `${avgGlucose} mg/dL`,
      subtitle: 'Clinical Target: 70 - 99 mg/dL',
      icon: Droplets,
      color: avgGlucose > 125 ? 'rose' : avgGlucose > 99 ? 'amber' : 'emerald',
      badge: avgGlucose === 0 ? 'No Data' : avgGlucose <= 99 ? 'Normal' : avgGlucose <= 125 ? 'Prediabetes Range' : 'Hyperglycemia Range',
      badgeColor: avgGlucose <= 99 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Average Total Cholesterol',
      value: loading ? '...' : `${avgCholesterol} mg/dL`,
      subtitle: 'Clinical Target: < 200 mg/dL',
      icon: HeartPulse,
      color: avgCholesterol >= 240 ? 'rose' : avgCholesterol >= 200 ? 'amber' : 'emerald',
      badge: avgCholesterol === 0 ? 'No Data' : avgCholesterol < 200 ? 'Desirable' : avgCholesterol < 240 ? 'Borderline High' : 'High Cholesterol',
      badgeColor: avgCholesterol < 200 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
    },
  ];

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${colorStyles[card.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500 font-medium">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
