const Notification = require('../models/notification.model');
const Organization = require('../models/organization.model');
const User = require('../models/user.model');
const { emitNotificationEvent } = require('../websockets/events');
const { Queue } = require('bullmq');
const Redis = require('ioredis');
const config = require('../config');

// Redis client for pub/sub notifications
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined
});

// Initialize notification queue
const notificationQueue = new Queue('notifications', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Object} - Created notification
 */
exports.createNotification = async (notificationData) => {
  try {
    const {
      title,
      message,
      type,
      severity = 'info',
      organization,
      pipeline,
      build,
      deployment,
      recipients = [],
      channels = ['in-app'],
      data = {},
      isGlobal = false,
      expiresAt
    } = notificationData;

    // Find users to notify if recipients not explicitly provided
    let userRecipients = [];
    
    if (recipients.length === 0 && organization) {
      // Get organization members
      const org = await Organization.findById(organization).populate('members.user');
      
      if (org) {
        userRecipients = org.members.map(member => ({
          user: member.user._id,
          read: false
        }));
      }
    } else {
      // Use provided recipients
      userRecipients = recipients.map(userId => ({
        user: userId,
        read: false
      }));
    }

    // Create notification
    const notification = new Notification({
      title,
      message,
      type,
      severity,
      organization,
      pipeline,
      build,
      deployment,
      recipients: userRecipients,
      channels: channels.map(type => ({ type, status: 'pending' })),
      data,
      isGlobal,
      expiresAt
    });

    await notification.save();

    // Emit real-time notification
    const userIds = userRecipients.map(recipient => recipient.user.toString());
    emitNotificationEvent('notification:new', {
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        severity: notification.severity,
        createdAt: notification.createdAt,
        data: notification.data
      },
      organizationId: organization
    }, userIds);

    // Queue notification delivery for each channel
    channels.forEach(channel => {
      if (channel !== 'in-app') {
        notificationQueue.add(`send-${channel}`, {
          notificationId: notification._id,
          channel,
          userIds
        });
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read for a user
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 * @returns {Object} - Updated notification
 */
exports.markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    // Find recipient
    const recipientIndex = notification.recipients.findIndex(
      recipient => recipient.user.toString() === userId
    );
    
    if (recipientIndex === -1) {
      throw new Error('User is not a recipient of this notification');
    }
    
    // Mark as read
    notification.recipients[recipientIndex].read = true;
    notification.recipients[recipientIndex].readAt = new Date();
    
    await notification.save();
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} - Notifications
 */
exports.getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      read,
      type,
      severity,
      limit = 20,
      page = 1,
      sort = 'createdAt',
      order = 'desc'
    } = options;
    
    // Build query
    const query = {
      'recipients.user': userId
    };
    
    // Add read filter if provided
    if (read !== undefined) {
      query['recipients.read'] = read;
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    // Add severity filter if provided
    if (severity) {
      query.severity = severity;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('organization', 'name logo')
      .populate('pipeline', 'name')
      .lean();
    
    // Add read status for each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const recipient = notification.recipients.find(
        r => r.user.toString() === userId
      );
      
      return {
        ...notification,
        read: recipient ? recipient.read : false,
        readAt: recipient ? recipient.readAt : null,
        recipients: undefined // Remove recipients array for privacy
      };
    });
    
    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    
    return {
      notifications: notificationsWithReadStatus,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Send email notification
 * @param {string} notificationId - Notification ID
 * @param {Array} userIds - User IDs to notify
 * @returns {Object} - Result
 */
exports.sendEmailNotification = async (notificationId, userIds) => {
  try {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    // Get users with email notification enabled
    const users = await User.find({
      _id: { $in: userIds },
      'notificationSettings.email': true,
      [`notificationSettings.events.${getEventType(notification.type)}`]: true
    });
    
    if (users.length === 0) {
      // No users to notify
      return { success: true, message: 'No users with email notifications enabled' };
    }
    
    // TODO: Implement email sending logic
    // This would typically use a library like nodemailer
    
    // Update notification status
    const channelIndex = notification.channels.findIndex(c => c.type === 'email');
    if (channelIndex !== -1) {
      notification.channels[channelIndex].status = 'sent';
      notification.channels[channelIndex].sentAt = new Date();
      await notification.save();
    }
    
    return { success: true, message: 'Email notifications sent' };
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

/**
 * Send Slack notification
 * @param {string} notificationId - Notification ID
 * @param {Array} userIds - User IDs to notify
 * @returns {Object} - Result
 */
exports.sendSlackNotification = async (notificationId, userIds) => {
  try {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    // Get users with Slack notification enabled
    const users = await User.find({
      _id: { $in: userIds },
      'notificationSettings.slack': true,
      [`notificationSettings.events.${getEventType(notification.type)}`]: true
    });
    
    if (users.length === 0) {
      // No users to notify
      return { success: true, message: 'No users with Slack notifications enabled' };
    }
    
    // TODO: Implement Slack sending logic
    // This would typically use the Slack API
    
    // Update notification status
    const channelIndex = notification.channels.findIndex(c => c.type === 'slack');
    if (channelIndex !== -1) {
      notification.channels[channelIndex].status = 'sent';
      notification.channels[channelIndex].sentAt = new Date();
      await notification.save();
    }
    
    return { success: true, message: 'Slack notifications sent' };
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    throw error;
  }
};

/**
 * Send SMS notification
 * @param {string} notificationId - Notification ID
 * @param {Array} userIds - User IDs to notify
 * @returns {Object} - Result
 */
exports.sendSmsNotification = async (notificationId, userIds) => {
  try {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    // Get users with SMS notification enabled
    const users = await User.find({
      _id: { $in: userIds },
      'notificationSettings.sms': true,
      [`notificationSettings.events.${getEventType(notification.type)}`]: true
    });
    
    if (users.length === 0) {
      // No users to notify
      return { success: true, message: 'No users with SMS notifications enabled' };
    }
    
    // TODO: Implement SMS sending logic
    // This would typically use a service like Twilio
    
    // Update notification status
    const channelIndex = notification.channels.findIndex(c => c.type === 'sms');
    if (channelIndex !== -1) {
      notification.channels[channelIndex].status = 'sent';
      notification.channels[channelIndex].sentAt = new Date();
      await notification.save();
    }
    
    return { success: true, message: 'SMS notifications sent' };
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    throw error;
  }
};

/**
 * Map notification type to event type
 * @param {string} notificationType - Notification type
 * @returns {string} - Event type
 */
const getEventType = (notificationType) => {
  switch (notificationType) {
    case 'build':
      return 'buildFailure'; // Default to failure, will be overridden if needed
    case 'deployment':
      return 'deploymentSuccess'; // Default to success, will be overridden if needed
    default:
      return 'buildFailure'; // Default
  }
};
