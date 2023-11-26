import React, { useContext } from 'react';
import { SummaryContext } from '../../context/SummaryContext';
import LoadingIndicator from '../LoadingIndicator'; // Import your loading indicator component

const SummaryMain = () => {
  const { summary, isLoading } = useContext(SummaryContext);

  const formattedSummary = summary.split('. ').map((sentence, index) => (
    <p key={index} className="mb-2">{sentence.trim()}.</p>
  ));

  return (
    <div data-aos="fade-up" className="summary-main-container  w-[90%] mt-10 m-auto -z-5 relative p-4 bg-white rounded-lg shadow-md">
      {isLoading && <LoadingIndicator className='z-40' />} {/* Show loading indicator when isLoading is true */}
      {!isLoading && (
        <>
          <h2 className="text-2xl text-center m-auto font-bold mb-4">Summarized Text</h2>
          <div className="text-gray-700 text-sm leading-relaxed space-y-2">
            {formattedSummary}
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryMain;
