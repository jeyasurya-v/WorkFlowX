const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { verifyToken } = require('../utils/jwt.utils');
const config = require('../config');

/**
 * Initialize WebSocket server
 * @param {Object} io - Socket.io server instance
 */
module.exports = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token is required'));
      }
      
      // Verify token
      const decoded = verifyToken(token, config.jwt.secret);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Token expired'));
      }
      
      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Invalid token'));
      }
      
      next(error);
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join user's room
    socket.join(`user:${socket.user.id}`);
    
    // Handle room subscriptions
    socket.on('subscribe', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach(room => {
          // Validate room format
          if (isValidRoomFormat(room)) {
            socket.join(room);
            console.log(`User ${socket.user.id} subscribed to ${room}`);
          }
        });
      }
    });
    
    // Handle room unsubscriptions
    socket.on('unsubscribe', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach(room => {
          socket.leave(room);
          console.log(`User ${socket.user.id} unsubscribed from ${room}`);
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  // Validate room format to prevent security issues
  function isValidRoomFormat(room) {
    // Room should be in format: type:id
    // Examples: organization:123, pipeline:456, build:789
    const validPrefixes = ['organization', 'pipeline', 'build', 'deployment', 'user'];
    const parts = room.split(':');
    
    if (parts.length !== 2) return false;
    
    const [prefix, id] = parts;
    
    return validPrefixes.includes(prefix) && /^[a-f\d]{24}$/i.test(id);
  }

  // Return io instance for use in other modules
  return io;
};
