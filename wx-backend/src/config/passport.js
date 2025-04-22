/**
 * Passport Configuration
 * 
 * Sets up authentication strategies for the application using Passport.js
 */

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GitLabStrategy = require('passport-gitlab2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Initialize Passport configuration
 */
module.exports = function() {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // JWT Strategy for API Authentication
  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret
  };

  passport.use(new JwtStrategy(jwtOpts, async (payload, done) => {
    try {
      const user = await User.findById(payload.userId);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      logger.error('JWT authentication error', { error: error.message });
      return done(error, false);
    }
  }));

  // GitHub OAuth Strategy
  if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
    passport.use(new GitHubStrategy({
        clientID: config.oauth.github.clientId,
        clientSecret: config.oauth.github.clientSecret,
        callbackURL: `${config.server.apiUrl}/api/v1/auth/github/callback`,
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.debug('GitHub OAuth profile received', { id: profile.id });
          
          // Check if user already exists
          let user = await User.findOne({ 'oauthProfiles.provider': 'github', 'oauthProfiles.id': profile.id });
          
          if (!user) {
            // Get primary email
            const primaryEmail = profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null;
              
            if (!primaryEmail) {
              return done(new Error('No email found in GitHub profile'));
            }
            
            // Check if user exists with this email
            user = await User.findOne({ email: primaryEmail });
            
            if (user) {
              // Add GitHub profile to existing user
              user.oauthProfiles.push({
                provider: 'github',
                id: profile.id,
                data: profile._json
              });
            } else {
              // Create new user
              user = new User({
                email: primaryEmail,
                firstName: profile.displayName.split(' ')[0] || '',
                lastName: profile.displayName.split(' ').slice(1).join(' ') || '',
                role: 'developer',
                isEmailVerified: true,
                oauthProfiles: [{
                  provider: 'github',
                  id: profile.id,
                  data: profile._json
                }]
              });
            }
            
            await user.save();
            logger.info('New user created from GitHub OAuth', { userId: user._id });
          }
          
          return done(null, user);
        } catch (error) {
          logger.error('GitHub OAuth error', { error: error.message, stack: error.stack });
          return done(error);
        }
      }
    ));
  } else {
    logger.warn('GitHub OAuth is not configured properly');
  }

  // GitLab OAuth Strategy
  if (config.oauth.gitlab.clientId && config.oauth.gitlab.clientSecret) {
    passport.use(new GitLabStrategy({
        clientID: config.oauth.gitlab.clientId,
        clientSecret: config.oauth.gitlab.clientSecret,
        callbackURL: `${config.server.apiUrl}/api/v1/auth/gitlab/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.debug('GitLab OAuth profile received', { id: profile.id });
          
          // Check if user already exists
          let user = await User.findOne({ 'oauthProfiles.provider': 'gitlab', 'oauthProfiles.id': profile.id });
          
          if (!user) {
            // Get email
            const email = profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : profile.email;
              
            if (!email) {
              return done(new Error('No email found in GitLab profile'));
            }
            
            // Check if user exists with this email
            user = await User.findOne({ email });
            
            if (user) {
              // Add GitLab profile to existing user
              user.oauthProfiles.push({
                provider: 'gitlab',
                id: profile.id,
                data: profile._json
              });
            } else {
              // Create new user
              user = new User({
                email,
                firstName: profile.displayName.split(' ')[0] || '',
                lastName: profile.displayName.split(' ').slice(1).join(' ') || '',
                role: 'developer',
                isEmailVerified: true,
                oauthProfiles: [{
                  provider: 'gitlab',
                  id: profile.id,
                  data: profile._json
                }]
              });
            }
            
            await user.save();
            logger.info('New user created from GitLab OAuth', { userId: user._id });
          }
          
          return done(null, user);
        } catch (error) {
          logger.error('GitLab OAuth error', { error: error.message, stack: error.stack });
          return done(error);
        }
      }
    ));
  } else {
    logger.warn('GitLab OAuth is not configured properly');
  }
}; 