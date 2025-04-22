const Organization = require('../models/organization.model');
const User = require('../models/user.model');
const { validateOrganizationRole } = require('../services/authorization.service');
const { emitOrganizationEvent } = require('../websockets/events');

/**
 * Create a new organization
 */
exports.createOrganization = async (req, res, next) => {
  try {
    const { name, description, website, logo } = req.body;

    // Create new organization
    const newOrganization = new Organization({
      name,
      description,
      website,
      logo,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: 'admin',
          addedAt: new Date()
        }
      ]
    });

    await newOrganization.save();

    // Add organization to user's organizations
    await User.findByIdAndUpdate(req.user.id, {
      $push: { organizations: newOrganization._id }
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      organization: {
        id: newOrganization._id,
        name: newOrganization.name,
        description: newOrganization.description,
        website: newOrganization.website,
        logo: newOrganization.logo,
        createdAt: newOrganization.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all organizations for the current user
 */
exports.getUserOrganizations = async (req, res, next) => {
  try {
    // Find user with populated organizations
    const user = await User.findById(req.user.id).populate('organizations');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get organizations with member role
    const organizations = await Organization.find({
      'members.user': req.user.id,
      isActive: true
    });

    // Format response with role information
    const formattedOrganizations = organizations.map(org => {
      const member = org.members.find(m => m.user.toString() === req.user.id);
      return {
        id: org._id,
        name: org.name,
        description: org.description,
        website: org.website,
        logo: org.logo,
        role: member ? member.role : 'unknown',
        memberCount: org.members.length,
        createdAt: org.createdAt
      };
    });

    res.status(200).json({
      success: true,
      organizations: formattedOrganizations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization by ID
 */
exports.getOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    const isMember = organization.isMember(req.user.id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this organization'
      });
    }

    // Get user's role in the organization
    const member = organization.members.find(m => m.user.toString() === req.user.id);
    const role = member ? member.role : 'unknown';

    // Format response
    const formattedOrganization = {
      id: organization._id,
      name: organization.name,
      description: organization.description,
      website: organization.website,
      logo: organization.logo,
      owner: organization.owner,
      role,
      memberCount: organization.members.length,
      settings: organization.settings,
      integrations: {
        github: { enabled: organization.integrations.github.enabled },
        gitlab: { enabled: organization.integrations.gitlab.enabled },
        jenkins: { enabled: organization.integrations.jenkins.enabled },
        circleci: { enabled: organization.integrations.circleci.enabled }
      },
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    };

    res.status(200).json({
      success: true,
      organization: formattedOrganization
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update organization
 */
exports.updateOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { name, description, website, logo, settings } = req.body;

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user has permission to update organization
    const hasPermission = await validateOrganizationRole(req.user.id, organization, ['admin', 'maintainer']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this organization'
      });
    }

    // Update fields
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (website !== undefined) organization.website = website;
    if (logo !== undefined) organization.logo = logo;
    
    // Update settings if provided
    if (settings) {
      // Only admins can update certain settings
      const isAdmin = await validateOrganizationRole(req.user.id, organization, ['admin']);
      
      if (isAdmin) {
        organization.settings = { ...organization.settings, ...settings };
      } else {
        // Maintainers can only update certain settings
        const allowedSettings = ['deploymentPolicies'];
        const filteredSettings = {};
        
        allowedSettings.forEach(key => {
          if (settings[key]) {
            filteredSettings[key] = settings[key];
          }
        });
        
        organization.settings = { ...organization.settings, ...filteredSettings };
      }
    }

    await organization.save();

    // Emit organization update event
    emitOrganizationEvent('organization:updated', {
      organizationId: organization._id,
      name: organization.name,
      updatedBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      organization: {
        id: organization._id,
        name: organization.name,
        description: organization.description,
        website: organization.website,
        logo: organization.logo,
        settings: organization.settings,
        updatedAt: organization.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete organization (soft delete)
 */
exports.deleteOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is the owner or admin
    const isAdmin = await validateOrganizationRole(req.user.id, organization, ['admin']);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this organization'
      });
    }

    // Soft delete by setting isActive to false
    organization.isActive = false;
    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization members
 */
exports.getOrganizationMembers = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    // Find organization
    const organization = await Organization.findById(organizationId)
      .populate('members.user', 'firstName lastName email avatar');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    const isMember = organization.isMember(req.user.id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this organization'
      });
    }

    // Format members
    const members = organization.members.map(member => ({
      id: member.user._id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      addedAt: member.addedAt
    }));

    res.status(200).json({
      success: true,
      members
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invite user to organization
 */
exports.inviteUser = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { email, role = 'developer' } = req.body;

    // Validate role
    const validRoles = ['admin', 'maintainer', 'developer', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user has permission to invite
    const hasPermission = await validateOrganizationRole(req.user.id, organization, ['admin', 'maintainer']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to invite users to this organization'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isMember = organization.isMember(user._id);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this organization'
      });
    }

    // Add user to organization
    organization.members.push({
      user: user._id,
      role,
      addedAt: new Date()
    });

    await organization.save();

    // Add organization to user's organizations
    await User.findByIdAndUpdate(user._id, {
      $push: { organizations: organization._id }
    });

    // Emit organization member added event
    emitOrganizationEvent('organization:member_added', {
      organizationId: organization._id,
      userId: user._id,
      role,
      addedBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'User invited successfully',
      member: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role,
        addedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member role
 */
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { organizationId, userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'maintainer', 'developer', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user has permission to update roles
    const hasPermission = await validateOrganizationRole(req.user.id, organization, ['admin']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update member roles'
      });
    }

    // Check if user is a member
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this organization'
      });
    }

    // Update role
    organization.members[memberIndex].role = role;
    await organization.save();

    // Emit organization member updated event
    emitOrganizationEvent('organization:member_updated', {
      organizationId: organization._id,
      userId,
      role,
      updatedBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      member: {
        id: userId,
        role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from organization
 */
exports.removeMember = async (req, res, next) => {
  try {
    const { organizationId, userId } = req.params;

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user has permission to remove members
    const hasPermission = await validateOrganizationRole(req.user.id, organization, ['admin']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove members from this organization'
      });
    }

    // Check if user is a member
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this organization'
      });
    }

    // Check if user is the owner
    if (organization.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the organization owner'
      });
    }

    // Remove member
    organization.members.splice(memberIndex, 1);
    await organization.save();

    // Remove organization from user's organizations
    await User.findByIdAndUpdate(userId, {
      $pull: { organizations: organization._id }
    });

    // Emit organization member removed event
    emitOrganizationEvent('organization:member_removed', {
      organizationId: organization._id,
      userId,
      removedBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave organization
 */
exports.leaveOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === req.user.id
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this organization'
      });
    }

    // Check if user is the owner
    if (organization.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Organization owner cannot leave. Transfer ownership first or delete the organization.'
      });
    }

    // Remove member
    organization.members.splice(memberIndex, 1);
    await organization.save();

    // Remove organization from user's organizations
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { organizations: organization._id }
    });

    // Emit organization member left event
    emitOrganizationEvent('organization:member_left', {
      organizationId: organization._id,
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'You have left the organization successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transfer organization ownership
 */
exports.transferOwnership = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { userId } = req.body;

    // Find organization
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is the owner
    if (organization.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the organization owner can transfer ownership'
      });
    }

    // Check if target user is a member
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Target user is not a member of this organization'
      });
    }

    // Update owner
    organization.owner = userId;

    // Ensure new owner has admin role
    organization.members[memberIndex].role = 'admin';

    await organization.save();

    // Emit organization ownership transferred event
    emitOrganizationEvent('organization:ownership_transferred', {
      organizationId: organization._id,
      previousOwnerId: req.user.id,
      newOwnerId: userId
    });

    res.status(200).json({
      success: true,
      message: 'Organization ownership transferred successfully',
      organization: {
        id: organization._id,
        name: organization.name,
        owner: organization.owner
      }
    });
  } catch (error) {
    next(error);
  }
};
