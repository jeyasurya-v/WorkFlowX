/**
 * User Model
 * 
 * Represents a user account with authentication details,
 * profile information, and preferences.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: function() {
      // Password is required unless using OAuth
      return !this.oauthProfiles || this.oauthProfiles.length === 0;
    },
    minlength: 8,
    select: false // Don't return password by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'developer', 'viewer'],
    default: 'developer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  defaultOrganization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  },
  oauthProfiles: [{
    provider: {
      type: String,
      enum: ['github', 'gitlab', 'google', 'bitbucket'],
      required: true
    },
    id: {
      type: String,
      required: true
    },
    username: String,
    profileUrl: String,
    accessToken: {
      type: String,
      select: false
    },
    refreshToken: {
      type: String,
      select: false
    },
    tokenExpiry: Date,
    data: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }],
  mfa: {
    enabled: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['app', 'sms'],
      default: 'app'
    },
    secret: {
      type: String,
      select: false
    },
    backupCodes: {
      type: [String],
      select: false
    },
    verifiedAt: Date
  },
  lastLogin: {
    date: Date,
    ip: String,
    userAgent: String
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: Date,
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        enabled: {
          type: Boolean,
          default: true
        },
        digest: {
          type: String,
          enum: ['immediate', 'daily', 'weekly', 'none'],
          default: 'immediate'
        }
      },
      push: {
        enabled: {
          type: Boolean,
          default: true
        },
        events: {
          buildSuccess: {
            type: Boolean,
            default: false
          },
          buildFailure: {
            type: Boolean,
            default: true
          },
          mentionedInComment: {
            type: Boolean,
            default: true
          }
        }
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    }
  },
  apiKeys: [{
    name: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true,
      select: false
    },
    expiresAt: Date,
    lastUsed: Date,
    permissions: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Compound indexes for security and performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'oauthProfiles.provider': 1, 'oauthProfiles.id': 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ 'apiKeys.key': 1 });

/**
 * Get user's full name
 */
userSchema.virtual('fullName').get(function() {
  if (this.displayName) return this.displayName;
  
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Generate initial avatar URL from initials
 */
userSchema.virtual('initialsAvatar').get(function() {
  const initials = `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  const color = generateColorFromString(this.email);
  const encodedName = encodeURIComponent(initials);
  
  return `https://ui-avatars.com/api/?name=${encodedName}&color=ffffff&background=${color.substring(1)}&size=256`;
});

/**
 * Generate a color from a string
 * @param {string} str - String to generate color from
 * @returns {string} - Hex color code
 */
function generateColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    const component = ('00' + value.toString(16)).slice(-2);
    color += component;
  }
  
  return color;
}

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password using our new salt
    const hash = await bcrypt.hash(this.password, salt);

    // Override the cleartext password with the hashed one
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password with the stored hash
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by OAuth profile
 * @param {string} provider - OAuth provider
 * @param {string} id - Provider-specific ID
 * @returns {Promise<User>} - Matching user or null
 */
userSchema.statics.findByOAuthProfile = function(provider, id) {
  return this.findOne({
    'oauthProfiles.provider': provider,
    'oauthProfiles.id': id
  });
};

/**
 * Find user by API key
 * @param {string} key - API key
 * @returns {Promise<User>} - Matching user or null
 */
userSchema.statics.findByApiKey = function(key) {
  return this.findOne({
    'apiKeys.key': key,
    'apiKeys.active': true,
    'apiKeys.expiresAt': { $gt: new Date() }
  }).select('+apiKeys.key');
};

/**
 * Create User model
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
