/**
 * Integration Model
 * 
 * Represents a CI/CD integration with various providers like GitHub Actions,
 * GitLab CI, Jenkins, CircleCI, etc.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Integration Schema
 */
const integrationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['github', 'gitlab', 'jenkins', 'circleci', 'travisci', 'azure-devops', 'aws-codepipeline', 'bitbucket', 'custom'],
    index: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiToken: {
    type: String,
    required: false, // Some integrations might use other auth methods
    select: false // Don't return the token in queries by default
  },
  webhookSecret: {
    type: String,
    required: false,
    select: false
  },
  webhookUrl: {
    type: String,
    required: false
  },
  config: {
    type: Object,
    default: {},
    required: true,
    // Store provider-specific configuration
    // GitHub: { owner, repo, installation_id }
    // GitLab: { project_id, group_id }
    // Jenkins: { server_url, job_name }
    // etc.
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
  },
  lastSyncedAt: {
    type: Date,
    default: null
  },
  settings: {
    enableNotifications: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: Number, // in minutes
      default: 15,
      min: 5,
      max: 1440 // 24 hours
    },
    notifyOn: {
      success: {
        type: Boolean,
        default: false
      },
      failure: {
        type: Boolean,
        default: true
      },
      started: {
        type: Boolean,
        default: true
      }
    }
  },
  error: {
    message: String,
    code: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Indexes for query performance
integrationSchema.index({ organization: 1, provider: 1 });
integrationSchema.index({ name: 1, organization: 1 }, { unique: true });
integrationSchema.index({ createdAt: -1 });

// Add method to validate credentials
integrationSchema.methods.validateCredentials = async function() {
  // Implementation will depend on the provider
  // This would call the appropriate service to check if the credentials are valid
  return true;
};

/**
 * Create Integration model
 */
const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration; 