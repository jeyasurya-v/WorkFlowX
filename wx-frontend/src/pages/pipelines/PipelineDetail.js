import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlay, FaCog, FaHistory, FaChartBar, FaCode, FaEllipsisH } from 'react-icons/fa';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PipelineStatusBadge from '../../components/pipelines/PipelineStatusBadge';
import BuildHistoryTable from '../../components/builds/BuildHistoryTable';
import PipelineStats from '../../components/pipelines/PipelineStats';

const PipelineDetail = () => {
  const { pipelineId } = useParams();
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [activeTab, setActiveTab] = useState('builds');

  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchPipelineData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setPipeline({
            id: pipelineId,
            name: 'Frontend CI',
            provider: 'github',
            repository: 'acme/frontend',
            status: 'success',
            lastRun: new Date(Date.now() - 3600000),
            successRate: 92,
            avgDuration: 245,
            branch: 'main',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            totalBuilds: 120,
            description: 'Frontend continuous integration pipeline',
            webhookUrl: 'https://api.pipelineradar.com/webhooks/abc123',
            config: {
              buildCommand: 'npm run build',
              testCommand: 'npm run test',
              artifacts: ['dist/**/*'],
              environmentVariables: ['NODE_ENV', 'API_URL']
            }
          });
          
          setBuilds([
            {
              id: 'build1',
              pipelineId,
              status: 'success',
              branch: 'main',
              commit: 'a1b2c3d',
              commitMessage: 'Fix responsive layout issues',
              startedAt: new Date(Date.now() - 3600000),
              finishedAt: new Date(Date.now() - 3600000 + 245000),
              duration: 245,
              triggeredBy: 'John Doe'
            },
            {
              id: 'build2',
              pipelineId,
              status: 'failed',
              branch: 'feature/auth',
              commit: 'e4f5g6h',
              commitMessage: 'Add OAuth integration',
              startedAt: new Date(Date.now() - 7200000),
              finishedAt: new Date(Date.now() - 7200000 + 312000),
              duration: 312,
              triggeredBy: 'Jane Smith'
            },
            {
              id: 'build3',
              pipelineId,
              status: 'success',
              branch: 'main',
              commit: 'i7j8k9l',
              commitMessage: 'Update dependencies',
              startedAt: new Date(Date.now() - 10800000),
              finishedAt: new Date(Date.now() - 10800000 + 198000),
              duration: 198,
              triggeredBy: 'CI Scheduler'
            },
            {
              id: 'build4',
              pipelineId,
              status: 'success',
              branch: 'main',
              commit: 'm1n2o3p',
              commitMessage: 'Improve performance',
              startedAt: new Date(Date.now() - 14400000),
              finishedAt: new Date(Date.now() - 14400000 + 230000),
              duration: 230,
              triggeredBy: 'John Doe'
            },
            {
              id: 'build5',
              pipelineId,
              status: 'canceled',
              branch: 'feature/new-ui',
              commit: 'q4r5s6t',
              commitMessage: 'Implement new UI components',
              startedAt: new Date(Date.now() - 18000000),
              finishedAt: new Date(Date.now() - 18000000 + 120000),
              duration: 120,
              triggeredBy: 'Jane Smith'
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, [pipelineId]);

  const handleTriggerBuild = () => {
    // This would be replaced with actual API call
    console.log('Triggering build for pipeline:', pipelineId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!pipeline) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Pipeline not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The pipeline you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/pipelines">
          <Button>
            Back to Pipelines
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mr-3">
              {pipeline.name}
            </h1>
            <PipelineStatusBadge status={pipeline.status} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {pipeline.repository} • {pipeline.branch}
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button
            icon={<FaPlay />}
            onClick={handleTriggerBuild}
          >
            Run Pipeline
          </Button>
          <Link to={`/pipelines/${pipelineId}/settings`}>
            <Button
              variant="secondary"
              icon={<FaCog />}
            >
              Settings
            </Button>
          </Link>
          <button className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
            <FaEllipsisH />
          </button>
        </div>
      </div>

      {/* Pipeline stats cards */}
      <PipelineStats pipeline={pipeline} />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'builds'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('builds')}
          >
            <FaHistory className="inline-block mr-2" />
            Build History
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar className="inline-block mr-2" />
            Analytics
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'config'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('config')}
          >
            <FaCode className="inline-block mr-2" />
            Configuration
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'builds' && (
          <BuildHistoryTable builds={builds} />
        )}
        
        {activeTab === 'analytics' && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pipeline Analytics</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Analytics charts and metrics will be displayed here.
            </p>
          </div>
        )}
        
        {activeTab === 'config' && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pipeline Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-500 dark:text-gray-400">{pipeline.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Webhook URL</h3>
                <div className="flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={pipeline.webhookUrl}
                    className="form-input bg-gray-50 dark:bg-gray-700"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="ml-2"
                    onClick={() => navigator.clipboard.writeText(pipeline.webhookUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Build Command</h3>
                <code className="block p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                  {pipeline.config.buildCommand}
                </code>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Command</h3>
                <code className="block p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                  {pipeline.config.testCommand}
                </code>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Artifacts</h3>
                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                  {pipeline.config.artifacts.map((artifact, index) => (
                    <li key={index}>{artifact}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Environment Variables</h3>
                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                  {pipeline.config.environmentVariables.map((variable, index) => (
                    <li key={index}>{variable}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineDetail;
