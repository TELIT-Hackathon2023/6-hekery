// context/ScoreContext.js
import React, { createContext, useState, useContext } from 'react';

export const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
  const [scores, setScores] = useState({});

  const updateScores = (newScores) => {
    setScores(newScores);
  };

  return (
    <ScoreContext.Provider value={{ scores, updateScores }}>
      {children}
    </ScoreContext.Provider>
  );
};
