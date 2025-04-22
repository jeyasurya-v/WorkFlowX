import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import { useSelector } from 'react-redux';

/**
 * Failure reason chart component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Failure reason chart component
 */
const FailureReasonChart = ({ data, title }) => {
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
      
      // Extract data for chart
      const labels = data.map(item => item.reason);
      const counts = data.map(item => item.count);
      
      // Generate colors for each segment
      const backgroundColors = [
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(245, 158, 11, 0.8)',  // Amber
        'rgba(249, 115, 22, 0.8)',  // Orange
        'rgba(236, 72, 153, 0.8)',  // Pink
        'rgba(139, 92, 246, 0.8)',  // Purple
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(16, 185, 129, 0.8)',  // Green
        'rgba(107, 114, 128, 0.8)'  // Gray (for "Other")
      ];
      
      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: backgroundColors.slice(0, data.length),
              borderColor: darkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textColor,
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            },
            title: {
              display: !!title,
              text: title || '',
              color: textColor,
              font: {
                size: 16
              },
              padding: {
                top: 10,
                bottom: 20
              }
            }
          },
          cutout: '60%'
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, darkMode, title]);

  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

FailureReasonChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      reason: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired
    })
  ).isRequired,
  title: PropTypes.string
};

export default FailureReasonChart;
