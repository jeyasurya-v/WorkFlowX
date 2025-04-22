import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import { useSelector } from 'react-redux';

/**
 * Success rate chart component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Success rate chart component
 */
const SuccessRateChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { darkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Set colors based on theme
      const textColor = darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      
      // Extract data for chart
      const labels = data.map(item => item.pipeline);
      const rates = data.map(item => item.rate);
      
      // Generate colors based on success rate
      const backgroundColors = rates.map(rate => {
        if (rate >= 90) return 'rgba(34, 197, 94, 0.7)'; // Success
        if (rate >= 75) return 'rgba(234, 179, 8, 0.7)';  // Warning
        return 'rgba(239, 68, 68, 0.7)';                 // Danger
      });
      
      const borderColors = rates.map(rate => {
        if (rate >= 90) return 'rgba(34, 197, 94, 1)'; // Success
        if (rate >= 75) return 'rgba(234, 179, 8, 1)';  // Warning
        return 'rgba(239, 68, 68, 1)';                 // Danger
      });
      
      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Success Rate (%)',
              data: rates,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          indexAxis: 'y', // This makes it a horizontal bar chart
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Success Rate: ${context.raw}%`;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor,
                callback: function(value) {
                  return value + '%';
                }
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: textColor
              }
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, darkMode]);

  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

SuccessRateChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      pipeline: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired
    })
  ).isRequired
};

export default SuccessRateChart;
