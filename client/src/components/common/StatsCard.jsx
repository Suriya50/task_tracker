import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'from-primary/20 to-secondary/20' }) => {
  return (
    <div className="stat-card p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium truncate">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mt-0.5 sm:mt-1 truncate">{value}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${color}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;