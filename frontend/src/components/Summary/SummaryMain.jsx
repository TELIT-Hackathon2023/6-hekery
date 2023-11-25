import React, { useContext } from 'react';
import { SummaryContext } from '../../context/SummaryContext';

const SummaryMain = () => {
  const { summary } = useContext(SummaryContext);

  return (
    <div>
      <h2>Summarized Text</h2>
      <p>{summary}</p>
    </div>
  );
};

export default SummaryMain;
