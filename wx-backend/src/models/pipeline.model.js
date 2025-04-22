/**
 * Pipeline Model
 * 
 * Represents a CI/CD pipeline from any provider. This is the central model
 * that unifies pipeline data from different CI/CD systems.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Pipeline Schema
 */
const pipelineSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  integration: {
    type: Schema.Types.ObjectId,
    ref: 'Integration',
    required: true,
    index: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  externalId: {
    type: String,
    required: true,
    // ID of the pipeline in the external system
    // GitHub: workflow_id
    // GitLab: pipeline_id
    // Jenkins: job_name
  },
  repositoryUrl: {
    type: String,
    required: false
  },
  branchPattern: {
    type: String,
    default: '.*' // Regex pattern for branches this pipeline applies to
  },
  config: {
    type: Object,
    default: {}
    // Store provider-specific configuration that doesn't fit elsewhere
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  lastBuildStatus: {
    type: String,
    enum: ['success', 'failure', 'running', 'canceled', 'pending', 'unknown'],
    default: 'unknown'
  },
  lastBuildAt: {
    type: Date,
    default: null
  },
  lastSuccessfulBuildAt: {
    type: Date,
    default: null
  },
  totalBuilds: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageDuration: {
    type: Number, // in seconds
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  environments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: String,
    current_version: String,
    last_deployed_at: Date
  }],
  notifications: {
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
        default: false
      },
      recipients: [String]
    },
    webhooks: [{
      url: String,
      events: [String], // 'success', 'failure', 'started'
      headers: Object,
      active: Boolean
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance
pipelineSchema.index({ organization: 1, name: 1 });
pipelineSchema.index({ integration: 1, externalId: 1 }, { unique: true });
pipelineSchema.index({ lastBuildAt: -1 });
pipelineSchema.index({ lastBuildStatus: 1, organization: 1 });
pipelineSchema.index({ tags: 1 });

/**
 * Find pipelines by tag
 * @param {String} tag - The tag to search for
 * @param {ObjectId} organizationId - The organization ID
 * @returns {Promise<Array>} Array of matching pipelines
 */
pipelineSchema.statics.findByTag = function(tag, organizationId) {
  return this.find({
    tags: tag,
    organization: organizationId,
    status: { $ne: 'archived' }
  });
};

/**
 * Update build statistics after a new build
 * @param {String} buildStatus - The status of the new build
 * @param {Number} buildDuration - The duration of the build in seconds
 * @returns {Promise<Pipeline>} The updated pipeline
 */
pipelineSchema.methods.updateBuildStats = async function(buildStatus, buildDuration) {
  // Increment total builds
  this.totalBuilds += 1;
  
  // Update last build information
  this.lastBuildStatus = buildStatus;
  this.lastBuildAt = new Date();
  
  // If successful, update last successful build
  if (buildStatus === 'success') {
    this.lastSuccessfulBuildAt = new Date();
  }
  
  // Recalculate success rate
  const successfulBuildsCount = await mongoose.model('Build').countDocuments({
    pipeline: this._id,
    status: 'success'
  });
  
  this.successRate = (successfulBuildsCount / this.totalBuilds) * 100;
  
  // Update average duration
  if (buildDuration > 0) {
    if (this.averageDuration === 0) {
      this.averageDuration = buildDuration;
    } else {
      // Weighted average favoring recent builds
      this.averageDuration = (this.averageDuration * 0.7) + (buildDuration * 0.3);
    }
  }
  
  return this.save();
};

/**
 * Create Pipeline model
 */
const Pipeline = mongoose.model('Pipeline', pipelineSchema);

module.exports = Pipeline;
