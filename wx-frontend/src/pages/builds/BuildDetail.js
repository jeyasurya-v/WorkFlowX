import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaRedo, FaStop, FaDownload, FaCode, FaTerminal, FaList, FaComment } from 'react-icons/fa';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BuildStatusBadge from '../../components/builds/BuildStatusBadge';
import Alert from '../../components/common/Alert';

const BuildDetail = () => {
  const { buildId } = useParams();
  const [loading, setLoading] = useState(true);
  const [build, setBuild] = useState(null);
  const [activeTab, setActiveTab] = useState('logs');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchBuildData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setBuild({
            id: buildId,
            pipelineId: 'pipeline1',
            pipelineName: 'Frontend CI',
            status: 'success',
            branch: 'main',
            commit: 'a1b2c3d',
            commitMessage: 'Fix responsive layout issues',
            startedAt: new Date(Date.now() - 3600000),
            finishedAt: new Date(Date.now() - 3600000 + 245000),
            duration: 245,
            triggeredBy: 'John Doe',
            logs: `
Starting build #123 for pipeline Frontend CI
Cloning repository...
Repository cloned successfully
Installing dependencies...
npm install
> 1500 packages installed in 45s
Running tests...
> npm run test
✓ All tests passed (125 tests, 350 assertions)
Building project...
> npm run build
✓ Build completed successfully
Artifacts generated in ./dist directory
Build successful! 🎉
            `,
            steps: [
              { name: 'Clone repository', status: 'success', duration: 5 },
              { name: 'Install dependencies', status: 'success', duration: 45 },
              { name: 'Run tests', status: 'success', duration: 120 },
              { name: 'Build project', status: 'success', duration: 75 }
            ]
          });
          
          setComments([
            {
              id: 'comment1',
              author: 'John Doe',
              authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
              content: 'Great job! All tests are passing now.',
              createdAt: new Date(Date.now() - 1800000)
            },
            {
              id: 'comment2',
              author: 'Jane Smith',
              authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
              content: 'The performance improvements look good. Let\'s merge this to main.',
              createdAt: new Date(Date.now() - 900000)
            }
          ]);
          
          setArtifacts([
            { id: 'artifact1', name: 'build.zip', size: '2.4 MB', type: 'application/zip' },
            { id: 'artifact2', name: 'coverage-report.html', size: '156 KB', type: 'text/html' },
            { id: 'artifact3', name: 'test-results.xml', size: '45 KB', type: 'application/xml' }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching build data:', error);
        setError('Failed to load build data. Please try again.');
        setLoading(false);
      }
    };

    fetchBuildData();
  }, [buildId]);

  const handleRetryBuild = () => {
    // This would be replaced with actual API call
    console.log('Retrying build:', buildId);
  };

  const handleCancelBuild = () => {
    // This would be replaced with actual API call
    console.log('Canceling build:', buildId);
  };

  const handleDownloadArtifact = (artifactId) => {
    // This would be replaced with actual API call
    console.log('Downloading artifact:', artifactId);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    
    // This would be replaced with actual API call
    setTimeout(() => {
      const comment = {
        id: `comment${comments.length + 1}`,
        author: 'Current User',
        authorAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: newComment,
        createdAt: new Date()
      };
      
      setComments([...comments, comment]);
      setNewComment('');
      setCommentLoading(false);
    }, 500);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!build) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Build not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The build you're looking for doesn't exist or you don't have access to it.</p>
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
      {/* Build header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mr-3">
              Build #{buildId.slice(-3)}
            </h1>
            <BuildStatusBadge status={build.status} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            <Link to={`/pipelines/${build.pipelineId}`} className="text-primary-600 dark:text-primary-400 hover:underline">
              {build.pipelineName}
            </Link>
            {' • '}
            {build.branch}
            {' • '}
            <span title={build.commitMessage}>{build.commit.substring(0, 7)}</span>
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          {build.status === 'running' ? (
            <Button
              variant="danger"
              icon={<FaStop />}
              onClick={handleCancelBuild}
            >
              Cancel Build
            </Button>
          ) : (
            <Button
              icon={<FaRedo />}
              onClick={handleRetryBuild}
            >
              Retry Build
            </Button>
          )}
        </div>
      </div>

      {/* Build info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Triggered By</h3>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{build.triggeredBy}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Started At</h3>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{formatTime(build.startedAt)}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</h3>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDuration(build.duration)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('logs')}
          >
            <FaTerminal className="inline-block mr-2" />
            Logs
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('steps')}
          >
            <FaList className="inline-block mr-2" />
            Steps
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'artifacts'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('artifacts')}
          >
            <FaDownload className="inline-block mr-2" />
            Artifacts
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            <FaComment className="inline-block mr-2" />
            Comments
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'logs' && (
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Build Logs</h2>
              <Button
                variant="secondary"
                size="sm"
                icon={<FaDownload />}
                onClick={() => console.log('Download logs')}
              >
                Download
              </Button>
            </div>
            <div className="p-0">
              <pre className="terminal h-96 overflow-auto p-4 m-0 text-sm">{build.logs}</pre>
            </div>
          </div>
        )}
        
        {activeTab === 'steps' && (
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Build Steps</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {build.steps.map((step, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <BuildStatusBadge status={step.status} size="sm" />
                    <span className="ml-3 text-gray-900 dark:text-white">{step.name}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{formatDuration(step.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'artifacts' && (
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Build Artifacts</h2>
            </div>
            {artifacts.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{artifact.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{artifact.size}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<FaDownload />}
                      onClick={() => handleDownloadArtifact(artifact.id)}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No artifacts found for this build.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="mb-2">
                  <textarea
                    className="form-input"
                    placeholder="Add a comment..."
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={commentLoading}
                    disabled={commentLoading || !newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </form>
              
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={comment.authorAvatar}
                          alt={comment.author}
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          <p>{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildDetail;
