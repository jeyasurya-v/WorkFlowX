import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaFilter, FaDownload } from 'react-icons/fa';
import PipelineActivityChart from '../../components/dashboard/PipelineActivityChart';
import SuccessRateChart from '../../components/dashboard/SuccessRateChart';
import DurationTrendChart from '../../components/analytics/DurationTrendChart';
import FailureReasonChart from '../../components/analytics/FailureReasonChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

/**
 * Analytics page component
 * @returns {JSX.Element} - Analytics page component
 */
const Analytics = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState('last7days');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for demonstration
  const [analyticsData, setAnalyticsData] = useState({
    pipelineActivity: [],
    successRates: [],
    durationTrend: [],
    failureReasons: []
  });
  
  const { organizations } = useSelector((state) => state.organizations);
  
  useEffect(() => {
    // Simulate API call to fetch analytics data
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockPipelineActivity = [
          { date: '2025-04-13', total: 24, success: 18, failed: 6 },
          { date: '2025-04-14', total: 32, success: 28, failed: 4 },
          { date: '2025-04-15', total: 28, success: 22, failed: 6 },
          { date: '2025-04-16', total: 36, success: 30, failed: 6 },
          { date: '2025-04-17', total: 42, success: 38, failed: 4 },
          { date: '2025-04-18', total: 38, success: 32, failed: 6 },
          { date: '2025-04-19', total: 30, success: 25, failed: 5 },
          { date: '2025-04-20', total: 22, success: 20, failed: 2 }
        ];
        
        const mockSuccessRates = [
          { pipeline: 'Frontend CI', rate: 95 },
          { pipeline: 'Backend API Tests', rate: 88 },
          { pipeline: 'Integration Tests', rate: 76 },
          { pipeline: 'Database Migrations', rate: 92 },
          { pipeline: 'Security Scans', rate: 98 },
          { pipeline: 'Performance Tests', rate: 72 },
          { pipeline: 'Mobile App Build', rate: 84 }
        ];
        
        const mockDurationTrend = [
          { date: '2025-04-13', duration: 320 },
          { date: '2025-04-14', duration: 290 },
          { date: '2025-04-15', duration: 310 },
          { date: '2025-04-16', duration: 340 },
          { date: '2025-04-17', duration: 280 },
          { date: '2025-04-18', duration: 260 },
          { date: '2025-04-19', duration: 270 },
          { date: '2025-04-20', duration: 250 }
        ];
        
        const mockFailureReasons = [
          { reason: 'Test Failures', count: 42 },
          { reason: 'Build Errors', count: 28 },
          { reason: 'Dependency Issues', count: 16 },
          { reason: 'Environment Problems', count: 12 },
          { reason: 'Timeout', count: 8 },
          { reason: 'Other', count: 6 }
        ];
        
        setAnalyticsData({
          pipelineActivity: mockPipelineActivity,
          successRates: mockSuccessRates,
          durationTrend: mockDurationTrend,
          failureReasons: mockFailureReasons
        });
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load analytics data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange, selectedOrganization]);
  
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };
  
  const handleOrganizationChange = (e) => {
    setSelectedOrganization(e.target.value);
  };
  
  const handleExportData = () => {
    // Implement export functionality
    console.log('Export analytics data');
  };
  
  const renderDateRangeOptions = () => (
    <select
      value={dateRange}
      onChange={handleDateRangeChange}
      className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    >
      <option value="last7days">Last 7 Days</option>
      <option value="last14days">Last 14 Days</option>
      <option value="last30days">Last 30 Days</option>
      <option value="last90days">Last 90 Days</option>
      <option value="custom">Custom Range</option>
    </select>
  );
  
  const renderOrganizationOptions = () => (
    <select
      value={selectedOrganization}
      onChange={handleOrganizationChange}
      className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    >
      <option value="all">All Organizations</option>
      {organizations && organizations.map(org => (
        <option key={org.id} value={org.id}>{org.name}</option>
      ))}
    </select>
  );
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Analytics</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-gray-500 dark:text-gray-400" />
            {renderDateRangeOptions()}
          </div>
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-500 dark:text-gray-400" />
            {renderOrganizationOptions()}
          </div>
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {error && (
        <Alert 
          type="error" 
          title="Error" 
          message={error} 
          className="mb-4"
        />
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pipeline Activity */}
          <div className="card p-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pipeline Activity</h2>
            <PipelineActivityChart data={analyticsData.pipelineActivity} />
          </div>
          
          {/* Success Rate and Failure Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pipeline Success Rates</h2>
              <SuccessRateChart data={analyticsData.successRates} />
            </div>
            <div className="card p-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Failure Reasons</h2>
              <FailureReasonChart data={analyticsData.failureReasons} />
            </div>
          </div>
          
          {/* Duration Trend */}
          <div className="card p-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Build Duration Trend</h2>
            <DurationTrendChart data={analyticsData.durationTrend} />
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Builds</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">252</p>
              <p className="mt-1 text-sm text-success-600 dark:text-success-400">↑ 12% from last period</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Success Rate</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">86.4%</p>
              <p className="mt-1 text-sm text-success-600 dark:text-success-400">↑ 3.2% from last period</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Duration</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">4m 52s</p>
              <p className="mt-1 text-sm text-success-600 dark:text-success-400">↓ 18s from last period</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Pipelines</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">18</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Across 5 projects</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
