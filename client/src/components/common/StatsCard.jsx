import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'from-primary/20 to-secondary/20' }) => {
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
    </div>
  );
};

export default StatsCard;