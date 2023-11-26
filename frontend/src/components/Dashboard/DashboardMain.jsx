import React, { useState, useEffect, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ScoreContext } from '../../context/ScoreContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardMain = () => {
  const { scores } = useContext(ScoreContext);
  const [chartData, setChartData] = useState({ datasets: [] });

  useEffect(() => {
    const scoreAchieved = Object.values(scores).map(score => score !== "N/A" && score !== "Not Applicable" ? parseFloat(score)  : 0);
    const scoreMissing = scoreAchieved.map(score => 10 - score);

    const data = {
      labels: Object.keys(scores),
      datasets: [
        {
          label: 'Score Achieved',
          data: scoreAchieved,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Score Missing',
          data: scoreMissing,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };
    setChartData(data);
  }, [scores]);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'RFP Section Scoring Analysis'
      }
    }
  };

  return (
    <div data-aos="fade-up" className="dashboard-main-container w-[90%] mt-10 m-auto -z-5 relative p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl text-center font-bold mb-4">Dashboard</h2>
      <div className="text-gray-700 text-sm leading-relaxed">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default DashboardMain;
