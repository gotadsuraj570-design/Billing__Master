import React from 'react';

const StatsCard = ({ title, value, icon: IconComponent, color = 'indigo' }) => {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50/50',
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      border: 'hover:border-indigo-200'
    },
    blue: {
      bg: 'bg-blue-50/50',
      iconBg: 'bg-blue-500/10 text-blue-600',
      border: 'hover:border-blue-200'
    },
    green: {
      bg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      border: 'hover:border-emerald-200'
    },
    orange: {
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-500/10 text-amber-600',
      border: 'hover:border-amber-200'
    },
    red: {
      bg: 'bg-rose-50/50',
      iconBg: 'bg-rose-500/10 text-rose-600',
      border: 'hover:border-rose-200'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className={`flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:scale-101 ${scheme.border}`}>
      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${scheme.iconBg}`}>
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>
    </div>
  );
};

export default StatsCard;
