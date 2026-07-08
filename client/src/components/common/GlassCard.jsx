import React from 'react';

const GlassCard = ({ children, className = '', hover = false }) => {
  return (
    <div className={`glass-card rounded-2xl ${hover ? 'glass-card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;