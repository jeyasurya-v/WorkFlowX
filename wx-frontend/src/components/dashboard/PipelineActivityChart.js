import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import { useSelector } from 'react-redux';

/**
 * Pipeline activity chart component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Pipeline activity chart component
 */
const PipelineActivityChart = ({ data }) => {
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
      const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const totalData = data.map(item => item.total);
      const successData = data.map(item => item.success);
      const failedData = data.map(item => item.failed);
      
      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Total',
              data: totalData,
              backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              borderColor: darkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              borderRadius: 4,
              order: 0
            },
            {
              label: 'Success',
              data: successData,
              backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.2)',
              borderColor: darkMode ? 'rgba(34, 197, 94, 1)' : 'rgba(34, 197, 94, 1)',
              borderWidth: 1,
              borderRadius: 4,
              order: 1
            },
            {
              label: 'Failed',
              data: failedData,
              backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderColor: darkMode ? 'rgba(239, 68, 68, 1)' : 'rgba(239, 68, 68, 1)',
              borderWidth: 1,
              borderRadius: 4,
              order: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: textColor,
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor,
                precision: 0
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

PipelineActivityChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      success: PropTypes.number.isRequired,
      failed: PropTypes.number.isRequired
    })
  ).isRequired
};

export default PipelineActivityChart;
