import React from 'react';

const ActivityItem = ({ title, subtitle, time, icon: Icon }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-pointer">
      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-white truncate">{title}</p>
        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
      <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">{time}</span>
    </div>
  );
};

export default ActivityItem;