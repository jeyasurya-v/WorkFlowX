/**
 * Organization Model
 * 
 * Represents a tenant organization in the multi-tenant architecture.
 * Organizations contain users, pipelines, and integrations.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Organization Schema
 */
const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String, // URL to logo image
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    permissions: {
      manageMembers: {
        type: Boolean,
        default: false
      },
      manageIntegrations: {
        type: Boolean,
        default: false
      },
      managePipelines: {
        type: Boolean,
        default: false
      },
      viewAnalytics: {
        type: Boolean,
        default: true
      }
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date
    }
  }],
  settings: {
    defaultNotifications: {
      slack: {
        enabled: {
          type: Boolean,
          default: false
        },
        webhookUrl: String,
        channel: String
      },
      email: {
        enabled: {
          type: Boolean,
          default: true
        },
        globalRecipients: [String]
      }
    },
    theme: {
      primaryColor: {
        type: String,
        default: '#3f51b5'
      },
      logoUrl: String,
      darkMode: {
        type: Boolean,
        default: false
      }
    },
    analyticsRetentionDays: {
      type: Number,
      default: 90,
      min: 30,
      max: 365
    },
    enableWeeklyReports: {
      type: Boolean,
      default: true
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active'
    },
    trialEndsAt: Date,
    currentPeriodEnds: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    maxUsers: {
      type: Number,
      default: 5
    },
    maxPipelines: {
      type: Number,
      default: 10
    },
    features: {
      advancedAnalytics: {
        type: Boolean,
        default: false
      },
      customBranding: {
        type: Boolean,
        default: false
      },
      prioritySupport: {
        type: Boolean,
        default: false
      },
      ssoIntegration: {
        type: Boolean,
        default: false
      }
    }
  },
  apiKeys: [{
    name: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    expiresAt: Date,
    lastUsed: Date,
    scopes: [String],
    active: {
      type: Boolean,
      default: true
    }
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  stats: {
    totalPipelines: {
      type: Number,
      default: 0
    },
    totalBuilds: {
      type: Number,
      default: 0
    },
    activePipelines: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 100 // percentage
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ 'members.user': 1 });
organizationSchema.index({ 'apiKeys.key': 1 });

/**
 * Find user's organizations
 * @param {ObjectId} userId - User ID to find organizations for
 * @returns {Promise<Array>} Organizations where user is a member or owner
 */
organizationSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  });
};

/**
 * Check if user is a member of organization
 * @param {ObjectId} userId - User ID to check
 * @returns {Boolean} True if user is a member or owner
 */
organizationSchema.methods.hasMember = function(userId) {
  if (this.owner.equals(userId)) return true;
  
  return this.members.some(member => 
    member.user.equals(userId)
  );
};

/**
 * Get user's role in organization
 * @param {ObjectId} userId - User ID to check
 * @returns {String|null} User's role or null if not a member
 */
organizationSchema.methods.getUserRole = function(userId) {
  if (this.owner.equals(userId)) return 'owner';
  
  const member = this.members.find(member => 
    member.user.equals(userId)
  );
  
  return member ? member.role : null;
};

/**
 * Check if user has specific permission
 * @param {ObjectId} userId - User ID to check
 * @param {String} permission - Permission name
 * @returns {Boolean} True if user has permission
 */
organizationSchema.methods.hasPermission = function(userId, permission) {
  if (this.owner.equals(userId)) return true;
  
  const member = this.members.find(member => 
    member.user.equals(userId)
  );
  
  if (!member) return false;
  
  if (member.role === 'admin') return true;
  
  // Check specific permission
  return member.permissions && member.permissions[permission] === true;
};

/**
 * Update organization statistics
 * @returns {Promise<Organization>} Updated organization
 */
organizationSchema.methods.updateStats = async function() {
  const [Pipeline, Build] = await Promise.all([
    mongoose.model('Pipeline'),
    mongoose.model('Build')
  ]);
  
  const [totalPipelines, activePipelines, totalBuilds, successBuilds] = await Promise.all([
    Pipeline.countDocuments({ organization: this._id }),
    Pipeline.countDocuments({ organization: this._id, status: 'active' }),
    Build.countDocuments({ organization: this._id }),
    Build.countDocuments({ organization: this._id, status: 'success' })
  ]);
  
  this.stats = {
    totalPipelines,
    activePipelines,
    totalBuilds,
    successRate: totalBuilds ? (successBuilds / totalBuilds) * 100 : 100,
    lastUpdated: new Date()
  };
  
  return this.save();
};

/**
 * Create Organization model
 */
const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
