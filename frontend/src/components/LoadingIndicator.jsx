// components/CustomLoadingIndicator.jsx
import React from 'react';
import { RingLoader } from 'react-spinners';

const CustomLoadingIndicator = ({ loadingState }) => {
  const getLoaderColor = () => {
    switch (loadingState) {
      case 'analyzing':
        return 'blue';
      case 'scoring':
        return 'green';
      case 'dashboard':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <div className="fixed inset-0 w-1/4 right-0 bg-opacity-50 bg-black flex justify-center items-center">
      <div className="flex flex-col items-center">
        <RingLoader color={getLoaderColor()} size={150} />
        <p className="text-white mt-4">
          {loadingState === 'analyzing' && 'Analyzing PDF...'}
          {loadingState === 'scoring' && 'Calculating Scores...'}
          {loadingState === 'dashboard' && 'Building Dashboard...'}
          {!loadingState && 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default CustomLoadingIndicator;
