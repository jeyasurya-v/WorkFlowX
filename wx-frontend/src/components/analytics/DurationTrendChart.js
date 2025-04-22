import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import { useSelector } from 'react-redux';

/**
 * Duration trend chart component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Duration trend chart component
 */
const DurationTrendChart = ({ data, title }) => {
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
      
      const durations = data.map(item => {
        // Convert duration from seconds to minutes for better readability
        return Math.round(item.duration / 60 * 100) / 100;
      });
      
      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Duration (minutes)',
              data: durations,
              backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              borderColor: darkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: darkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
              pointRadius: 3,
              pointHoverRadius: 5
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
              intersect: false,
              callbacks: {
                label: function(context) {
                  const minutes = Math.floor(context.raw);
                  const seconds = Math.round((context.raw - minutes) * 60);
                  return `Duration: ${minutes}m ${seconds}s`;
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
                callback: function(value) {
                  const minutes = Math.floor(value);
                  const seconds = Math.round((value - minutes) * 60);
                  return `${minutes}m ${seconds > 0 ? seconds + 's' : ''}`;
                }
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
  }, [data, darkMode, title]);

  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

DurationTrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      duration: PropTypes.number.isRequired
    })
  ).isRequired,
  title: PropTypes.string
};

export default DurationTrendChart;
