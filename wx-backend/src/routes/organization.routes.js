const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const { authenticateJWT, authorizeRoles, belongsToOrganization } = require('../middleware/auth.middleware');
const { validateOrganization } = require('../middleware/validation.middleware');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Create a new organization
router.post('/', validateOrganization, organizationController.createOrganization);

// Get all organizations for the current user
router.get('/me', organizationController.getUserOrganizations);

// Get organization by ID
router.get('/:organizationId', belongsToOrganization, organizationController.getOrganization);

// Update organization
router.put('/:organizationId', belongsToOrganization, organizationController.updateOrganization);

// Delete organization (soft delete)
router.delete('/:organizationId', belongsToOrganization, organizationController.deleteOrganization);

// Get organization members
router.get('/:organizationId/members', belongsToOrganization, organizationController.getOrganizationMembers);

// Invite user to organization
router.post('/:organizationId/members', belongsToOrganization, organizationController.inviteUser);

// Update member role
router.put('/:organizationId/members/:userId', belongsToOrganization, organizationController.updateMemberRole);

// Remove member from organization
router.delete('/:organizationId/members/:userId', belongsToOrganization, organizationController.removeMember);

// Leave organization
router.post('/:organizationId/leave', belongsToOrganization, organizationController.leaveOrganization);

// Transfer organization ownership
router.post('/:organizationId/transfer-ownership', belongsToOrganization, organizationController.transferOwnership);

module.exports = router;
