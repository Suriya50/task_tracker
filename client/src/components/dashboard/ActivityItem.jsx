import React from 'react';

const ActivityItem = ({ title, subtitle, time, icon: Icon }) => {
  return (
    <div className="activity-item">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
    </div>
  );
};

export default ActivityItem;