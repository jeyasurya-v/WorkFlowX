const { Server } = require('socket.io');
let io;

/**
 * Initialize the events module with Socket.io instance
 * @param {Server} socketIo - Socket.io server instance
 */
exports.init = (socketIo) => {
  io = socketIo;
  console.log('WebSocket events module initialized');
};

/**
 * Emit build event to relevant rooms
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitBuildEvent = (event, data) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot emit build event.');
    return;
  }

  const { buildId, pipelineId, organizationId } = data;

  // Emit to build room
  if (buildId) {
    io.to(`build:${buildId}`).emit(event, data);
  }

  // Emit to pipeline room
  if (pipelineId) {
    io.to(`pipeline:${pipelineId}`).emit(event, data);
  }

  // Emit to organization room
  if (organizationId) {
    io.to(`organization:${organizationId}`).emit(event, data);
  }

  // Log event
  console.log(`Emitted ${event} to build, pipeline, and organization rooms`);
};

/**
 * Emit deployment event to relevant rooms
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitDeploymentEvent = (event, data) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot emit deployment event.');
    return;
  }

  const { deploymentId, pipelineId, organizationId } = data;

  // Emit to deployment room
  if (deploymentId) {
    io.to(`deployment:${deploymentId}`).emit(event, data);
  }

  // Emit to pipeline room
  if (pipelineId) {
    io.to(`pipeline:${pipelineId}`).emit(event, data);
  }

  // Emit to organization room
  if (organizationId) {
    io.to(`organization:${organizationId}`).emit(event, data);
  }

  // Log event
  console.log(`Emitted ${event} to deployment, pipeline, and organization rooms`);
};

/**
 * Emit notification event to specific users
 * @param {string} event - Event name
 * @param {Object} data - Event data
 * @param {Array} userIds - Array of user IDs to notify
 */
exports.emitNotificationEvent = (event, data, userIds = []) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot emit notification event.');
    return;
  }

  // Emit to each user's room
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });

  // If organization is specified, emit to organization room
  if (data.organizationId) {
    io.to(`organization:${data.organizationId}`).emit(event, data);
  }

  // Log event
  console.log(`Emitted ${event} to ${userIds.length} users`);
};

/**
 * Emit organization event to all members
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitOrganizationEvent = (event, data) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot emit organization event.');
    return;
  }

  const { organizationId } = data;

  // Emit to organization room
  if (organizationId) {
    io.to(`organization:${organizationId}`).emit(event, data);
  }

  // Log event
  console.log(`Emitted ${event} to organization room`);
};

/**
 * Emit system-wide event to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitSystemEvent = (event, data) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot emit system event.');
    return;
  }

  // Emit to all connected clients
  io.emit(event, data);

  // Log event
  console.log(`Emitted system event ${event} to all clients`);
};
