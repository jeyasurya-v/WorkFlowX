import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSync } from 'react-icons/fa';
import IntegrationCard from '../../components/integrations/IntegrationCard';
import IntegrationSetupForm from '../../components/integrations/IntegrationSetupForm';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Integrations page component
 * @returns {JSX.Element} - Integrations page component
 */
const Integrations = () => {
  const dispatch = useDispatch();
  const { integrations, isLoading, error } = useSelector((state) => state.integrations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [modalMode, setModalMode] = useState('connect'); // 'connect', 'edit', 'configure'
  
  // Available integration providers
  const providers = [
    { id: 'github', name: 'GitHub' },
    { id: 'gitlab', name: 'GitLab' },
    { id: 'jenkins', name: 'Jenkins' },
    { id: 'circleci', name: 'CircleCI' },
    { id: 'custom', name: 'Custom' }
  ];
  
  useEffect(() => {
    // Load integrations on component mount
    // dispatch(fetchIntegrations());
  }, [dispatch]);
  
  const handleAddIntegration = () => {
    setModalMode('connect');
    setSelectedProvider(null);
    setSelectedIntegration(null);
    setIsModalOpen(true);
  };
  
  const handleSelectProvider = (providerId) => {
    setSelectedProvider(providerId);
  };
  
  const handleConnect = (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      setSelectedProvider(integration.provider);
      setSelectedIntegration(integration);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };
  
  const handleDisconnect = (integrationId) => {
    // Implement disconnect logic
    // dispatch(disconnectIntegration(integrationId));
    console.log('Disconnect integration:', integrationId);
  };
  
  const handleConfigure = (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      setSelectedIntegration(integration);
      setModalMode('configure');
      setIsModalOpen(true);
    }
  };
  
  const handleRefresh = () => {
    // Refresh integrations
    // dispatch(fetchIntegrations());
  };
  
  const handleSubmitIntegration = (formData) => {
    if (modalMode === 'edit' && selectedIntegration) {
      // Update existing integration
      // dispatch(updateIntegration({ ...formData, id: selectedIntegration.id }));
      console.log('Update integration:', { ...formData, id: selectedIntegration.id });
    } else {
      // Create new integration
      // dispatch(createIntegration({ ...formData, provider: selectedProvider }));
      console.log('Create integration:', { ...formData, provider: selectedProvider });
    }
    setIsModalOpen(false);
  };
  
  const renderProviderSelection = () => (
    <div className="p-5">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Select Integration Provider
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleSelectProvider(provider.id)}
            className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {provider.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderModalContent = () => {
    if (modalMode === 'connect' && !selectedProvider) {
      return renderProviderSelection();
    }
    
    if ((modalMode === 'connect' && selectedProvider) || modalMode === 'edit') {
      return (
        <IntegrationSetupForm
          provider={selectedProvider || selectedIntegration?.provider}
          initialValues={modalMode === 'edit' ? selectedIntegration : {}}
          onSubmit={handleSubmitIntegration}
          onCancel={() => {
            if (modalMode === 'connect' && selectedProvider) {
              setSelectedProvider(null);
            } else {
              setIsModalOpen(false);
            }
          }}
          isSubmitting={false}
        />
      );
    }
    
    if (modalMode === 'configure' && selectedIntegration) {
      return (
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Configure {selectedIntegration.name}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Configuration options for this integration will be displayed here.
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaSync className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleAddIntegration}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            Add Integration
          </button>
        </div>
      </div>
      
      {error && (
        <Alert 
          type="error" 
          title="Error loading integrations" 
          message={error} 
          className="mb-4"
        />
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : integrations && integrations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigure={handleConfigure}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No integrations found. Connect your CI/CD providers to start monitoring your pipelines.
          </p>
          <button
            onClick={handleAddIntegration}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            Add Integration
          </button>
        </div>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'connect' 
            ? 'Add Integration' 
            : modalMode === 'edit' 
              ? 'Edit Integration' 
              : 'Configure Integration'
        }
        size="lg"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Integrations;
