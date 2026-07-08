import React from 'react';

const StatsCard = ({ title, value, icon: Icon, change, changeType, color }) => {
  const isUp = changeType === 'up';

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`stat-card-icon ${color}`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-3">
          <span
            className={`text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}
          >
            {isUp ? '↑' : '↓'} {change}
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;