const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateRegister } = require('../middleware/validation.middleware');
const { authenticateJWT } = require('../middleware/auth.middleware');
const passport = require('passport');

// Register a new user
router.post('/register', validateRegister, authController.register);

// Login with email and password
router.post('/login', validateLogin, authController.login);

// Refresh access token using refresh token
router.post('/refresh-token', authController.refreshToken);

// Logout user
router.post('/logout', authController.logout);

// OAuth routes
router.get('/github', authController.githubAuth);
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/auth/login?error=github_auth_failed');
    req.user = user;
    return authController.githubCallback(req, res, next);
  })(req, res, next);
});

router.get('/gitlab', authController.gitlabAuth);
router.get('/gitlab/callback', (req, res, next) => {
  passport.authenticate('gitlab', { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/auth/login?error=gitlab_auth_failed');
    req.user = user;
    return authController.gitlabCallback(req, res, next);
  })(req, res, next);
});

// Get current user profile
router.get('/me', authenticateJWT, authController.getCurrentUser);

// Test route for CORS
router.get('/test-cors', (req, res) => {
  console.log('CORS test route accessed', { 
    headers: req.headers,
    origin: req.headers.origin
  });
  
  return res.status(200).json({ 
    success: true, 
    message: 'CORS is working correctly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
