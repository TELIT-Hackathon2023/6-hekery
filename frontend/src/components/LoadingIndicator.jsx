// components/LoadingIndicator.jsx
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="fixed right-0 top-0 h-full w-3/4 bg-white bg-opacity-75 flex justify-center items-center">
      <div className="loader">Loading...</div>
    </div>
  );
};

export default LoadingIndicator;
