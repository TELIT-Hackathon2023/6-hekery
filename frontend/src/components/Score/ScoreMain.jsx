import React, {useContext } from 'react';
import axios from 'axios';
import { ScoreContext } from '../../context/ScoreContext';


const ScoreMain = () => {
  
  const { scores } = useContext(ScoreContext);


  const calculateFinalScore = () => {
    const scoreValues = Object.values(scores).filter(score => score !== "0" && score !== "Not Applicable");
    const totalScore = scoreValues.reduce((acc, score) => acc + parseInt(score), 0);
    return (totalScore / scoreValues.length).toFixed(1);
  };

  return (
    <div data-aos="fade-up" className="score-main-container w-[90%] mt-10 m-auto -z-5 relative p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl text-center font-bold mb-4">Scoring Values</h2>
      <div className="text-gray-700 text-sm leading-relaxed space-y-2">
        {Object.entries(scores).map(([section, score]) => (
          <div key={section} className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">{section}</span>
            <span className={`font-bold ${score !== "0" && score !== "Not Applicable" && parseFloat(score) >= 7 ? 'text-green-500' : parseFloat(score) >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
              {score !== "0" && score !== "Not Applicable" ? `${(parseInt(score))}` : score}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center py-3 border-t border-b border-[#e20274] mt-4">
          <span className="font-bold text-lg">Final Score</span>
          <span className="font-bold text-lg text-[#e20274]">{calculateFinalScore()}/10</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreMain;
