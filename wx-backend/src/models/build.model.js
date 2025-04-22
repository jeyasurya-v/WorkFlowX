/**
 * Build Model
 * 
 * Represents a single build/job execution from any CI/CD provider.
 * Stores detailed information about the execution, results, and artifacts.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Build Schema
 */
const buildSchema = new Schema({
  pipeline: {
    type: Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: true,
    index: true
  },
  integration: {
    type: Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
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
    // ID of this build in the external system
  },
  externalUrl: {
    type: String,
    // URL to view this build in the external system
  },
  number: {
    type: Number,
    required: true
    // Build number in sequence for this pipeline
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'running', 'pending', 'canceled', 'skipped'],
    default: 'pending'
  },
  startedAt: {
    type: Date
  },
  finishedAt: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  trigger: {
    type: {
      type: String,
      enum: ['push', 'pull_request', 'schedule', 'api', 'manual', 'webhook', 'other'],
      default: 'other'
    },
    actor: {
      name: String,
      id: String,
      email: String,
      avatarUrl: String
    }
  },
  git: {
    branch: {
      type: String
    },
    commit: {
      sha: String,
      message: String,
      url: String,
      author: {
        name: String,
        email: String,
        date: Date
      },
      committer: {
        name: String,
        email: String,
        date: Date
      }
    },
    pullRequest: {
      id: String,
      number: Number,
      title: String,
      url: String
    }
  },
  stages: [{
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'running', 'pending', 'canceled', 'skipped'],
      default: 'pending'
    },
    startedAt: Date,
    finishedAt: Date,
    duration: Number // in seconds
  }],
  jobs: [{
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'running', 'pending', 'canceled', 'skipped'],
      default: 'pending'
    },
    stage: String,
    startedAt: Date,
    finishedAt: Date,
    duration: Number, // in seconds
    runner: String,
    agent: String,
    artifacts: [{
      name: String,
      url: String,
      size: Number, // in bytes
      type: String
    }],
    logs: {
      url: String,
      truncated: Boolean,
      content: String // Optional, may store limited log content directly
    }
  }],
  artifacts: [{
    name: String,
    url: String,
    path: String,
    size: Number, // in bytes
    type: String
  }],
  environment: {
    name: String,
    url: String,
    status: {
      type: String,
      enum: ['success', 'failure', 'in_progress', 'canceled'],
      default: 'in_progress'
    },
    deployedVersion: String
  },
  metrics: {
    testResults: {
      total: Number,
      passed: Number,
      failed: Number,
      skipped: Number,
      passRate: Number, // percentage
      coverage: Number // percentage
    },
    performanceScores: {
      cpu: Number,
      memory: Number,
      duration: Number,
      custom: Schema.Types.Mixed
    }
  },
  error: {
    message: String,
    stackTrace: String,
    phase: String // where in the pipeline the error occurred
  },
  retries: {
    count: {
      type: Number,
      default: 0
    },
    max: Number,
    originalBuildId: {
      type: Schema.Types.ObjectId,
      ref: 'Build'
    }
  },
  tags: [String],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
    // Store any additional provider-specific metadata
  }
}, {
  timestamps: true
});

// Indexes for performance
buildSchema.index({ pipeline: 1, number: -1 });
buildSchema.index({ organization: 1, startedAt: -1 });
buildSchema.index({ externalId: 1, integration: 1 }, { unique: true });
buildSchema.index({ status: 1, organization: 1 });
buildSchema.index({ 'git.branch': 1, pipeline: 1 });
buildSchema.index({ 'git.commit.sha': 1 });
buildSchema.index({ startedAt: -1 });

/**
 * Calculate duration when a build finishes
 */
buildSchema.pre('save', function(next) {
  // Calculate duration if build just finished
  if (this.isModified('finishedAt') && this.finishedAt && this.startedAt) {
    this.duration = Math.round((this.finishedAt - this.startedAt) / 1000);
  }
  next();
});

/**
 * Update pipeline stats after saving a build
 */
buildSchema.post('save', async function() {
  try {
    // Only update stats if status has changed and is final (not running or pending)
    if (this.isModified('status') && 
        !['running', 'pending'].includes(this.status)) {
      const Pipeline = mongoose.model('Pipeline');
      const pipeline = await Pipeline.findById(this.pipeline);
      
      if (pipeline) {
        await pipeline.updateBuildStats(this.status, this.duration);
      }
    }
  } catch (error) {
    console.error('Error updating pipeline stats:', error);
  }
});

/**
 * Create Build model
 */
const Build = mongoose.model('Build', buildSchema);

module.exports = Build;
