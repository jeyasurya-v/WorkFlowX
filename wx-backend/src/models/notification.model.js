const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['build', 'deployment', 'system', 'user'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  pipeline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline'
  },
  build: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build'
  },
  deployment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deployment'
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  channels: [{
    type: {
      type: String,
      enum: ['email', 'slack', 'sms', 'webhook', 'in-app'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    error: String
  }],
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: {
    type: Date
  },
  isGlobal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
notificationSchema.index({ 'recipients.user': 1, 'recipients.read': 1 });
notificationSchema.index({ organization: 1 });
notificationSchema.index({ pipeline: 1 });
notificationSchema.index({ build: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, severity: 1 });

// Add TTL index for automatic expiration
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
