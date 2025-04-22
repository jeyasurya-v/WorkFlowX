import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BuildStatusCard from '../components/dashboard/BuildStatusCard';
import PipelineHealthCard from '../components/dashboard/PipelineHealthCard';
import RecentBuildsCard from '../components/dashboard/RecentBuildsCard';
import PipelineActivityChart from '../components/dashboard/PipelineActivityChart';
import SuccessRateChart from '../components/dashboard/SuccessRateChart';
import AnimatedLoadingSpinner from '../components/common/AnimatedLoadingSpinner';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { currentOrganization } = useSelector((state) => state.organizations);

  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setDashboardData({
            buildStatus: {
              total: 120,
              success: 85,
              failed: 25,
              running: 5,
              pending: 3,
              canceled: 2
            },
            pipelineHealth: {
              healthy: 8,
              warning: 2,
              critical: 1,
              inactive: 1
            },
            recentBuilds: [
              { id: 'build1', pipelineId: 'pipeline1', pipelineName: 'Frontend CI', status: 'success', branch: 'main', commit: 'a1b2c3d', startedAt: new Date(Date.now() - 3600000), duration: 245 },
              { id: 'build2', pipelineId: 'pipeline2', pipelineName: 'Backend CI', status: 'failed', branch: 'feature/auth', commit: 'e4f5g6h', startedAt: new Date(Date.now() - 7200000), duration: 312 },
              { id: 'build3', pipelineId: 'pipeline3', pipelineName: 'Integration Tests', status: 'running', branch: 'develop', commit: 'i7j8k9l', startedAt: new Date(Date.now() - 1800000), duration: null },
              { id: 'build4', pipelineId: 'pipeline1', pipelineName: 'Frontend CI', status: 'success', branch: 'fix/ui-bug', commit: 'm1n2o3p', startedAt: new Date(Date.now() - 10800000), duration: 198 },
              { id: 'build5', pipelineId: 'pipeline4', pipelineName: 'Deployment', status: 'pending', branch: 'main', commit: 'q4r5s6t', startedAt: new Date(Date.now() - 900000), duration: null }
            ],
            activityData: [
              { date: '2025-04-14', total: 10, success: 7, failed: 3 },
              { date: '2025-04-15', total: 12, success: 9, failed: 3 },
              { date: '2025-04-16', total: 15, success: 11, failed: 4 },
              { date: '2025-04-17', total: 10, success: 8, failed: 2 },
              { date: '2025-04-18', total: 18, success: 12, failed: 6 },
              { date: '2025-04-19', total: 14, success: 10, failed: 4 },
              { date: '2025-04-20', total: 8, success: 6, failed: 2 }
            ],
            successRateData: [
              { pipeline: 'Frontend CI', rate: 92 },
              { pipeline: 'Backend CI', rate: 85 },
              { pipeline: 'Integration Tests', rate: 76 },
              { pipeline: 'Deployment', rate: 88 },
              { pipeline: 'E2E Tests', rate: 72 }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {currentOrganization ? `${currentOrganization.name} Dashboard` : 'Dashboard'}
        </h1>
        <Link 
          to="/pipelines" 
          className="apple-btn apple-btn-primary hover-lift"
        >
          View All Pipelines
        </Link>
      </motion.div>

      {/* Status Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
        <div className="apple-card bg-white p-6 rounded-lg">
          <BuildStatusCard data={dashboardData.buildStatus} />
        </div>
        <div className="apple-card bg-white p-6 rounded-lg">
          <PipelineHealthCard data={dashboardData.pipelineHealth} />
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={itemVariants}>
        <div className="apple-card bg-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pipeline Activity</h2>
          <PipelineActivityChart data={dashboardData.activityData} />
        </div>
        <div className="apple-card bg-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Success Rate</h2>
          <SuccessRateChart data={dashboardData.successRateData} />
        </div>
      </motion.div>

      {/* Recent Builds */}
      <motion.div 
        className="apple-card bg-white p-6 rounded-lg" 
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Builds</h2>
        <RecentBuildsCard builds={dashboardData.recentBuilds} />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
