// components/CustomLoadingIndicator.jsx
import React from 'react';
import { HashLoader} from 'react-spinners';

const CustomLoadingIndicator = ({ loadingState }) => {
  const getLoaderColor = () => {
    switch (loadingState) {
      case 'analyzing':
        return 'pink';
      case 'scoring':
        return '#e20274';
      case 'dashboard':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <div className="fixed inset-0 right-0 z-30   flex justify-center items-center">
      <div className="flex flex-col items-center">
        <HashLoader color={getLoaderColor()} size={150} />
        <p className="text-[#e20274] font-bold text-xl p-4 mt-4">
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
