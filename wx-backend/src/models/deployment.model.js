const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  pipeline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: true
  },
  build: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build',
    required: true
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production', 'testing', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'success', 'failure', 'canceled', 'rollback'],
    default: 'pending'
  },
  startedAt: {
    type: Date
  },
  finishedAt: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  },
  version: {
    type: String
  },
  url: {
    type: String
  },
  commit: {
    sha: String,
    message: String,
    author: {
      name: String,
      email: String
    },
    url: String
  },
  approvals: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  requiredApprovals: {
    type: Number,
    default: 1
  },
  steps: [{
    name: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'success', 'failure', 'canceled'],
      default: 'pending'
    },
    startedAt: Date,
    finishedAt: Date,
    duration: Number, // in seconds
    logs: String
  }],
  rollbackTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deployment'
  },
  isRollback: {
    type: Boolean,
    default: false
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledFor: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  config: {
    autoRollback: {
      type: Boolean,
      default: false
    },
    timeout: {
      type: Number,
      default: 1800 // 30 minutes in seconds
    },
    strategy: {
      type: String,
      enum: ['blue_green', 'canary', 'rolling', 'recreate', 'custom'],
      default: 'rolling'
    },
    customConfig: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
deploymentSchema.index({ pipeline: 1 });
deploymentSchema.index({ build: 1 });
deploymentSchema.index({ environment: 1 });
deploymentSchema.index({ status: 1 });
deploymentSchema.index({ startedAt: -1 });
deploymentSchema.index({ 'approvals.user': 1 });
deploymentSchema.index({ isScheduled: 1, scheduledFor: 1 });

// Virtual for deployment duration
deploymentSchema.virtual('calculatedDuration').get(function() {
  if (this.startedAt && this.finishedAt) {
    return Math.floor((this.finishedAt - this.startedAt) / 1000);
  }
  return 0;
});

// Pre-save hook to calculate duration
deploymentSchema.pre('save', function(next) {
  if (this.startedAt && this.finishedAt) {
    this.duration = Math.floor((this.finishedAt - this.startedAt) / 1000);
  }
  next();
});

// Method to check if deployment is approved
deploymentSchema.methods.checkApprovalStatus = function() {
  const approvedCount = this.approvals.filter(approval => approval.status === 'approved').length;
  this.isApproved = approvedCount >= this.requiredApprovals;
  return this.isApproved;
};

// Method to add approval
deploymentSchema.methods.addApproval = function(userId, status, comment = '') {
  const existingApprovalIndex = this.approvals.findIndex(
    approval => approval.user.toString() === userId.toString()
  );

  if (existingApprovalIndex !== -1) {
    // Update existing approval
    this.approvals[existingApprovalIndex].status = status;
    this.approvals[existingApprovalIndex].comment = comment;
    this.approvals[existingApprovalIndex].timestamp = new Date();
  } else {
    // Add new approval
    this.approvals.push({
      user: userId,
      status,
      comment,
      timestamp: new Date()
    });
  }

  // Update approval status
  this.checkApprovalStatus();
  
  return this.save();
};

const Deployment = mongoose.model('Deployment', deploymentSchema);

module.exports = Deployment;
