// SummaryMain.jsx
import React, { useContext } from 'react';
import { SummaryContext } from '../../context/SummaryContext';
import LoadingIndicator from '../LoadingIndicator'; // Import your loading indicator component

const SummaryMain = () => {
  const { summary, isLoading } = useContext(SummaryContext);

  return (
    <div className="summary-main-container relative">
      {isLoading && <LoadingIndicator />} {/* Show loading indicator when isLoading is true */}
      {!isLoading && ( // Only show content when not loading
        <>
          <h2 className="text-xl font-bold">Summarized Text</h2>
          <p className="mt-4">{summary}</p>
        </>
      )}
    </div>
  );
};

export default SummaryMain;
