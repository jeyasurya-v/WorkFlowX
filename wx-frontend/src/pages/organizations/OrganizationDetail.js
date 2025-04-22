import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlus, FaCog, FaUserPlus, FaChartBar, FaUsers, FaStream } from 'react-icons/fa';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const OrganizationDetail = () => {
  const { organizationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [activeTab, setActiveTab] = useState('pipelines');
  const [error, setError] = useState('');

  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchOrganizationData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setOrganization({
            id: organizationId,
            name: 'Acme Corp',
            role: 'admin',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            description: 'Leading provider of digital solutions',
            website: 'https://acme.example.com',
            stats: {
              totalPipelines: 8,
              totalBuilds: 256,
              successRate: 87,
              activePipelines: 6
            }
          });
          
          setMembers([
            {
              id: 'user1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              role: 'admin',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
              joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'user2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              role: 'member',
              avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
              joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'user3',
              name: 'Bob Johnson',
              email: 'bob.johnson@example.com',
              role: 'viewer',
              avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
              joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          ]);
          
          setPipelines([
            {
              id: 'pipeline1',
              name: 'Frontend CI',
              provider: 'github',
              status: 'success',
              lastRun: new Date(Date.now() - 3600000),
              successRate: 92
            },
            {
              id: 'pipeline2',
              name: 'Backend CI',
              provider: 'gitlab',
              status: 'failed',
              lastRun: new Date(Date.now() - 7200000),
              successRate: 85
            },
            {
              id: 'pipeline3',
              name: 'Integration Tests',
              provider: 'jenkins',
              status: 'running',
              lastRun: new Date(Date.now() - 1800000),
              successRate: 76
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching organization data:', error);
        setError('Failed to load organization data. Please try again.');
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organizationId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'member':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'viewer':
        return 'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'failed':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      case 'running':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Organization not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The organization you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/organizations">
          <Button>
            Back to Organizations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mr-3">
              {organization.name}
            </h1>
            <span className={`badge ${getRoleBadgeClass(organization.role)}`}>
              {organization.role.charAt(0).toUpperCase() + organization.role.slice(1)}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Created on {formatDate(organization.createdAt)}
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          {organization.role === 'admin' && (
            <>
              <Link to={`/organizations/${organizationId}/settings`}>
                <Button
                  variant="secondary"
                  icon={<FaCog />}
                >
                  Settings
                </Button>
              </Link>
              <Link to={`/organizations/${organizationId}/invite`}>
                <Button
                  icon={<FaUserPlus />}
                >
                  Invite Members
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Organization stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pipelines</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{organization.stats.totalPipelines}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Builds</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{organization.stats.totalBuilds}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Success Rate</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{organization.stats.successRate}%</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Pipelines</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{organization.stats.activePipelines}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pipelines'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('pipelines')}
          >
            <FaStream className="inline-block mr-2" />
            Pipelines
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <FaUsers className="inline-block mr-2" />
            Members
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
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'pipelines' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pipelines</h2>
              <Link to="/pipelines/new">
                <Button
                  size="sm"
                  icon={<FaPlus />}
                >
                  New Pipeline
                </Button>
              </Link>
            </div>
            
            {pipelines.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Pipeline
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Run
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {pipelines.map((pipeline) => (
                        <tr key={pipeline.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/pipelines/${pipeline.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                              {pipeline.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${getStatusBadgeClass(pipeline.status)}`}>
                              {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(pipeline.lastRun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    pipeline.successRate > 80 ? 'bg-success-500' : 
                                    pipeline.successRate > 60 ? 'bg-warning-500' : 
                                    'bg-danger-500'
                                  }`}
                                  style={{ width: `${pipeline.successRate}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {pipeline.successRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No pipelines found in this organization.
                </p>
                <div className="mt-4">
                  <Link to="/pipelines/new">
                    <Button icon={<FaPlus />}>
                      New Pipeline
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Members</h2>
              {organization.role === 'admin' && (
                <Link to={`/organizations/${organizationId}/invite`}>
                  <Button
                    size="sm"
                    icon={<FaUserPlus />}
                  >
                    Invite Members
                  </Button>
                </Link>
              )}
            </div>
            
            {members.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Member
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        {organization.role === 'admin' && (
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={member.avatar}
                                  alt={member.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(member.joinedAt)}
                          </td>
                          {organization.role === 'admin' && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No members found in this organization.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Organization Analytics</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Analytics charts and metrics will be displayed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetail;
