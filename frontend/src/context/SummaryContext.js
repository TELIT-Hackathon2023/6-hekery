// context/SummaryContext.js

import React, { createContext, useState } from 'react';

export const SummaryContext = createContext();

export const SummaryProvider = ({ children }) => {
  const [summary, setSummary] = useState('');

  const updateSummary = (newSummary) => {
    setSummary(newSummary);
  };

  return (
    <SummaryContext.Provider value={{ summary, updateSummary }}>
      {children}
    </SummaryContext.Provider>
  );
};
