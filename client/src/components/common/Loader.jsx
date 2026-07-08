import React from 'react';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className={`${sizes[size]} rounded-full border-t-2 border-b-2 border-primary animate-spin`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-10">
      <div className={`${sizes[size]} rounded-full border-t-2 border-b-2 border-primary animate-spin`} />
    </div>
  );
};

export default Loader;