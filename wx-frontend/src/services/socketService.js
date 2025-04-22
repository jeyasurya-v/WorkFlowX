import io from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../features/notifications/notificationsSlice';
import { updateBuildStatus } from '../features/builds/buildsSlice';
import { updatePipelineStatus } from '../features/pipelines/pipelinesSlice';

/**
 * Socket service for real-time updates
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // Start with 2 seconds
  }

  /**
   * Initialize socket connection
   * @param {string} token - Authentication token
   * @returns {Promise<void>} - Promise that resolves when socket is connected
   */
  initialize(token) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        resolve();
        return;
      }

      // Get API URL from environment
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      // Initialize socket with auth token
      this.socket = io(apiUrl, {
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000, // Max 10 seconds between reconnection attempts
        timeout: 10000
      });

      // Set up event listeners
      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 2000;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to socket server after multiple attempts'));
        }
        
        // Exponential backoff for reconnection
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
      });

      // Set up event handlers for real-time updates
      this.setupEventHandlers();
    });
  }

  /**
   * Set up event handlers for real-time updates
   */
  setupEventHandlers() {
    // Notification events
    this.socket.on('notification', (notification) => {
      store.dispatch(addNotification(notification));
    });

    // Build status updates
    this.socket.on('build_update', (buildData) => {
      store.dispatch(updateBuildStatus(buildData));
      
      // Create notification for build status changes
      if (buildData.status === 'success' || buildData.status === 'failed') {
        const notificationType = buildData.status === 'success' ? 'success' : 'error';
        const notificationTitle = buildData.status === 'success' ? 'Build Succeeded' : 'Build Failed';
        
        store.dispatch(addNotification({
          id: `build-${buildData.id}-${Date.now()}`,
          type: notificationType,
          category: 'build',
          title: notificationTitle,
          message: `${buildData.pipelineName} - ${buildData.branch} (${buildData.commit.substring(0, 7)})`,
          timestamp: new Date().toISOString(),
          read: false,
          link: buildData.id
        }));
      }
    });

    // Pipeline status updates
    this.socket.on('pipeline_update', (pipelineData) => {
      store.dispatch(updatePipelineStatus(pipelineData));
    });

    // System events
    this.socket.on('system_event', (eventData) => {
      // Handle system events like maintenance notifications
      if (eventData.type === 'maintenance') {
        store.dispatch(addNotification({
          id: `system-${Date.now()}`,
          type: 'warning',
          category: 'system',
          title: 'Scheduled Maintenance',
          message: eventData.message,
          timestamp: new Date().toISOString(),
          read: false
        }));
      }
    });
  }

  /**
   * Subscribe to specific pipeline updates
   * @param {string} pipelineId - Pipeline ID
   */
  subscribeToPipeline(pipelineId) {
    if (!this.isConnected) {
      console.warn('Socket not connected. Cannot subscribe to pipeline.');
      return;
    }

    this.socket.emit('subscribe', { type: 'pipeline', id: pipelineId });
  }

  /**
   * Unsubscribe from specific pipeline updates
   * @param {string} pipelineId - Pipeline ID
   */
  unsubscribeFromPipeline(pipelineId) {
    if (!this.isConnected) {
      console.warn('Socket not connected. Cannot unsubscribe from pipeline.');
      return;
    }

    this.socket.emit('unsubscribe', { type: 'pipeline', id: pipelineId });
  }

  /**
   * Subscribe to specific build updates
   * @param {string} buildId - Build ID
   */
  subscribeToBuild(buildId) {
    if (!this.isConnected) {
      console.warn('Socket not connected. Cannot subscribe to build.');
      return;
    }

    this.socket.emit('subscribe', { type: 'build', id: buildId });
  }

  /**
   * Unsubscribe from specific build updates
   * @param {string} buildId - Build ID
   */
  unsubscribeFromBuild(buildId) {
    if (!this.isConnected) {
      console.warn('Socket not connected. Cannot unsubscribe from build.');
      return;
    }

    this.socket.emit('unsubscribe', { type: 'build', id: buildId });
  }

  /**
   * Subscribe to organization updates
   * @param {string} organizationId - Organization ID
   */
  subscribeToOrganization(organizationId) {
    if (!this.isConnected) {
      console.warn('Socket not connected. Cannot subscribe to organization.');
      return;
    }

    this.socket.emit('subscribe', { type: 'organization', id: organizationId });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
