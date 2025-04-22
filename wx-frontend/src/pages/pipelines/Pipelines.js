import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlus, FaFilter, FaSearch, FaSort, FaEllipsisH, FaChevronDown } from 'react-icons/fa';
import PipelineStatusBadge from '../../components/pipelines/PipelineStatusBadge';

const Pipelines = () => {
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastRun');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const { currentOrganization } = useSelector((state) => state.organizations);

  useEffect(() => {
    // This would be replaced with actual API call
    const fetchPipelines = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setPipelines([
            {
              id: 'pipeline1',
              name: 'Frontend CI',
              provider: 'github',
              repository: 'acme/frontend',
              status: 'success',
              lastRun: new Date(Date.now() - 3600000),
              successRate: 92,
              avgDuration: 245,
              branch: 'main'
            },
            {
              id: 'pipeline2',
              name: 'Backend CI',
              provider: 'gitlab',
              repository: 'acme/backend',
              status: 'failed',
              lastRun: new Date(Date.now() - 7200000),
              successRate: 85,
              avgDuration: 312,
              branch: 'main'
            },
            {
              id: 'pipeline3',
              name: 'Integration Tests',
              provider: 'jenkins',
              repository: 'acme/integration-tests',
              status: 'running',
              lastRun: new Date(Date.now() - 1800000),
              successRate: 76,
              avgDuration: 540,
              branch: 'develop'
            },
            {
              id: 'pipeline4',
              name: 'Deployment',
              provider: 'circleci',
              repository: 'acme/deployment',
              status: 'pending',
              lastRun: new Date(Date.now() - 900000),
              successRate: 88,
              avgDuration: 180,
              branch: 'main'
            },
            {
              id: 'pipeline5',
              name: 'E2E Tests',
              provider: 'github',
              repository: 'acme/e2e-tests',
              status: 'canceled',
              lastRun: new Date(Date.now() - 10800000),
              successRate: 72,
              avgDuration: 420,
              branch: 'feature/new-tests'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching pipelines:', error);
        setLoading(false);
      }
    };

    fetchPipelines();
  }, []);

  // Filter and sort pipelines
  const filteredPipelines = pipelines
    .filter(pipeline => {
      // Filter by search term
      const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pipeline.repository.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || pipeline.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastRun':
          comparison = new Date(a.lastRun) - new Date(b.lastRun);
          break;
        case 'successRate':
          comparison = a.successRate - b.successRate;
          break;
        case 'avgDuration':
          comparison = a.avgDuration - b.avgDuration;
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'github':
        return '🐙';
      case 'gitlab':
        return '🦊';
      case 'jenkins':
        return '☕';
      case 'circleci':
        return '⚪';
      default:
        return '🔄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {currentOrganization ? `${currentOrganization.name} Pipelines` : 'Pipelines'}
        </h1>
        <Link to="/pipelines/new" className="apple-btn apple-btn-primary hover-lift">
          <FaPlus className="mr-2 -ml-1 h-4 w-4" />
          New Pipeline
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-[var(--color-gray-400)]" />
          </div>
          <input
            type="text"
            className="apple-input pl-10"
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="relative">
            <select
              className="apple-input pl-10 pr-10 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="h-4 w-4 text-[var(--color-gray-400)]" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaChevronDown className="h-4 w-4 text-[var(--color-gray-400)]" />
            </div>
          </div>
          <div className="relative">
            <select
              className="apple-input pl-10 pr-10 appearance-none"
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDirection(direction);
              }}
            >
              <option value="lastRun-desc">Latest Runs</option>
              <option value="lastRun-asc">Oldest Runs</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="successRate-desc">Success Rate (High-Low)</option>
              <option value="successRate-asc">Success Rate (Low-High)</option>
              <option value="avgDuration-asc">Duration (Short-Long)</option>
              <option value="avgDuration-desc">Duration (Long-Short)</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSort className="h-4 w-4 text-[var(--color-gray-400)]" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaChevronDown className="h-4 w-4 text-[var(--color-gray-400)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipelines table */}
      {filteredPipelines.length > 0 ? (
        <div className="apple-card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="apple-table min-w-full">
              <thead>
                <tr>
                  <th className="apple-table-th cursor-pointer" onClick={() => handleSort('name')}>
                    Pipeline {sortBy === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="apple-table-th">Status</th>
                  <th className="apple-table-th cursor-pointer" onClick={() => handleSort('lastRun')}>
                    Last Run {sortBy === 'lastRun' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="apple-table-th cursor-pointer" onClick={() => handleSort('successRate')}>
                    Success Rate {sortBy === 'successRate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="apple-table-th cursor-pointer" onClick={() => handleSort('avgDuration')}>
                    Avg. Duration {sortBy === 'avgDuration' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="apple-table-th">Branch</th>
                  <th className="apple-table-th"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-gray-200)]">
                {filteredPipelines.map((pipeline) => (
                  <tr key={pipeline.id} className="hover:bg-[var(--color-gray-100)] transition-colors duration-150">
                    <td className="apple-table-td whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-2xl">
                          {getProviderIcon(pipeline.provider)}
                        </div>
                        <div className="ml-4">
                          <Link to={`/pipelines/${pipeline.id}`} className="text-sm font-medium text-[var(--color-black)] hover:text-[var(--color-blue)]">
                            {pipeline.name}
                          </Link>
                          <div className="text-sm text-[var(--color-gray-600)]">
                            {pipeline.repository}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="apple-table-td whitespace-nowrap">
                      <PipelineStatusBadge status={pipeline.status} />
                    </td>
                    <td className="apple-table-td whitespace-nowrap text-sm text-[var(--color-gray-600)]">
                      {formatTime(pipeline.lastRun)}
                    </td>
                    <td className="apple-table-td whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-[var(--color-gray-200)] rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full`}
                            style={{
                              width: `${pipeline.successRate}%`,
                              backgroundColor: pipeline.successRate > 80 ? 'var(--color-green)' : 
                                               pipeline.successRate > 60 ? 'var(--color-yellow)' : 
                                               'var(--color-red)'
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-[var(--color-gray-600)]">
                          {pipeline.successRate}%
                        </span>
                      </div>
                    </td>
                    <td className="apple-table-td whitespace-nowrap text-sm text-[var(--color-gray-600)]">
                      {formatDuration(pipeline.avgDuration)}
                    </td>
                    <td className="apple-table-td whitespace-nowrap text-sm text-[var(--color-gray-600)]">
                      {pipeline.branch}
                    </td>
                    <td className="apple-table-td whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[var(--color-gray-500)] hover:text-[var(--color-black)] p-1 hover-lift">
                        <FaEllipsisH />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="apple-card bg-white p-8 text-center">
          <p className="text-[var(--color-gray-600)]">
            {searchTerm || filterStatus !== 'all' 
              ? 'No pipelines match your search criteria.' 
              : 'No pipelines found. Create your first pipeline to get started.'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <div className="mt-6">
              <Link to="/pipelines/new" className="apple-btn apple-btn-secondary hover-lift">
                <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                New Pipeline
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pipelines;
