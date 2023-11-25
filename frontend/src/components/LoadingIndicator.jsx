// LoadingIndicator.jsx
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex justify-center items-center">
      <div className="loader">Loading...</div> {/* Replace with your loading animation */}
    </div>
  );
};

export default LoadingIndicator;
