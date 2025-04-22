import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

/**
 * Custom hook for using socket connections
 * @param {Object} options - Hook options
 * @param {boolean} options.autoConnect - Whether to connect automatically
 * @returns {Object} - Socket state and methods
 */
const useSocket = ({ autoConnect = true } = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  /**
   * Connect to socket
   */
  const connect = useCallback(async () => {
    if (!token) {
      setError(new Error('Authentication token is required to connect'));
      return;
    }

    try {
      setError(null);
      await socketService.initialize(token);
      setIsConnected(true);
    } catch (err) {
      setError(err);
      setIsConnected(false);
    }
  }, [token]);

  /**
   * Disconnect from socket
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  /**
   * Subscribe to pipeline updates
   * @param {string} pipelineId - Pipeline ID
   */
  const subscribeToPipeline = useCallback((pipelineId) => {
    if (!isConnected) {
      console.warn('Socket not connected. Attempting to connect before subscribing.');
      connect().then(() => {
        socketService.subscribeToPipeline(pipelineId);
      });
      return;
    }
    
    socketService.subscribeToPipeline(pipelineId);
  }, [isConnected, connect]);

  /**
   * Unsubscribe from pipeline updates
   * @param {string} pipelineId - Pipeline ID
   */
  const unsubscribeFromPipeline = useCallback((pipelineId) => {
    if (isConnected) {
      socketService.unsubscribeFromPipeline(pipelineId);
    }
  }, [isConnected]);

  /**
   * Subscribe to build updates
   * @param {string} buildId - Build ID
   */
  const subscribeToBuild = useCallback((buildId) => {
    if (!isConnected) {
      console.warn('Socket not connected. Attempting to connect before subscribing.');
      connect().then(() => {
        socketService.subscribeToBuild(buildId);
      });
      return;
    }
    
    socketService.subscribeToBuild(buildId);
  }, [isConnected, connect]);

  /**
   * Unsubscribe from build updates
   * @param {string} buildId - Build ID
   */
  const unsubscribeFromBuild = useCallback((buildId) => {
    if (isConnected) {
      socketService.unsubscribeFromBuild(buildId);
    }
  }, [isConnected]);

  /**
   * Subscribe to organization updates
   * @param {string} organizationId - Organization ID
   */
  const subscribeToOrganization = useCallback((organizationId) => {
    if (!isConnected) {
      console.warn('Socket not connected. Attempting to connect before subscribing.');
      connect().then(() => {
        socketService.subscribeToOrganization(organizationId);
      });
      return;
    }
    
    socketService.subscribeToOrganization(organizationId);
  }, [isConnected, connect]);

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    subscribeToPipeline,
    unsubscribeFromPipeline,
    subscribeToBuild,
    unsubscribeFromBuild,
    subscribeToOrganization
  };
};

export default useSocket;
