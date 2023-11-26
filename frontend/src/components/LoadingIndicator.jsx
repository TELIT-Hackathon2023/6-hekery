// components/CustomLoadingIndicator.jsx
import React from 'react';
import { HashLoader} from 'react-spinners';

const CustomLoadingIndicator = ({ loadingState }) => {
  const getLoaderColor = () => {
    switch (loadingState) {
      case 'analyzing':
        return 'red';
      case 'scoring':
        return '#e20274';
      case 'dashboard':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <div className="fixed inset-x-[56%]  inset-y-[30%] flex justify-between m-auto items-end">
      <div className="flex flex-col  w-max items-center">
        <HashLoader color={getLoaderColor()} size={150} />
        <p className=" w-max text-black font-bold text-xl p-4 mt-4">
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
