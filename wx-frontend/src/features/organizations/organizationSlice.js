import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import organizationService from '../../services/organizationService';
import toast from 'react-hot-toast';

// Get user organizations
export const fetchUserOrganizations = createAsyncThunk(
  'organizations/fetchUserOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const organizations = await organizationService.getUserOrganizations();
      return organizations;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizations');
    }
  }
);

// Get organization by ID
export const fetchOrganizationById = createAsyncThunk(
  'organizations/fetchOrganizationById',
  async (organizationId, { rejectWithValue }) => {
    try {
      const organization = await organizationService.getOrganizationById(organizationId);
      return organization;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization');
    }
  }
);

// Create a new organization
export const createOrganization = createAsyncThunk(
  'organizations/createOrganization',
  async (organizationData, { rejectWithValue }) => {
    try {
      const newOrganization = await organizationService.createOrganization(organizationData);
      toast.success('Organization created successfully');
      return newOrganization;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
      return rejectWithValue(error.response?.data?.message || 'Failed to create organization');
    }
  }
);

// Update an organization
export const updateOrganization = createAsyncThunk(
  'organizations/updateOrganization',
  async ({ organizationId, organizationData }, { rejectWithValue }) => {
    try {
      const updatedOrganization = await organizationService.updateOrganization(organizationId, organizationData);
      toast.success('Organization updated successfully');
      return updatedOrganization;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
      return rejectWithValue(error.response?.data?.message || 'Failed to update organization');
    }
  }
);

// Delete an organization
export const deleteOrganization = createAsyncThunk(
  'organizations/deleteOrganization',
  async (organizationId, { rejectWithValue }) => {
    try {
      await organizationService.deleteOrganization(organizationId);
      toast.success('Organization deleted successfully');
      return organizationId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete organization');
    }
  }
);

// Get organization members
export const fetchOrganizationMembers = createAsyncThunk(
  'organizations/fetchOrganizationMembers',
  async (organizationId, { rejectWithValue }) => {
    try {
      const members = await organizationService.getOrganizationMembers(organizationId);
      return { organizationId, members };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization members');
    }
  }
);

// Invite user to organization
export const inviteUserToOrganization = createAsyncThunk(
  'organizations/inviteUserToOrganization',
  async ({ organizationId, email, role }, { rejectWithValue }) => {
    try {
      const member = await organizationService.inviteUser(organizationId, { email, role });
      toast.success(`User invited to organization successfully`);
      return { organizationId, member };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite user');
      return rejectWithValue(error.response?.data?.message || 'Failed to invite user');
    }
  }
);

// Update member role
export const updateMemberRole = createAsyncThunk(
  'organizations/updateMemberRole',
  async ({ organizationId, userId, role }, { rejectWithValue }) => {
    try {
      const result = await organizationService.updateMemberRole(organizationId, userId, { role });
      toast.success('Member role updated successfully');
      return { organizationId, userId, role };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member role');
      return rejectWithValue(error.response?.data?.message || 'Failed to update member role');
    }
  }
);

// Remove member from organization
export const removeMember = createAsyncThunk(
  'organizations/removeMember',
  async ({ organizationId, userId }, { rejectWithValue }) => {
    try {
      await organizationService.removeMember(organizationId, userId);
      toast.success('Member removed successfully');
      return { organizationId, userId };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

// Leave organization
export const leaveOrganization = createAsyncThunk(
  'organizations/leaveOrganization',
  async (organizationId, { rejectWithValue }) => {
    try {
      await organizationService.leaveOrganization(organizationId);
      toast.success('You have left the organization');
      return organizationId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave organization');
      return rejectWithValue(error.response?.data?.message || 'Failed to leave organization');
    }
  }
);

const initialState = {
  organizations: {},
  userOrganizations: [],
  currentOrganization: null,
  members: {},
  isLoading: false,
  error: null,
};

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    resetOrganizationError: (state) => {
      state.error = null;
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    updateOrganizationMember: (state, action) => {
      const { organizationId, userId, updates } = action.payload;
      
      if (state.members[organizationId]) {
        const memberIndex = state.members[organizationId].findIndex(
          member => member.id === userId
        );
        
        if (memberIndex !== -1) {
          state.members[organizationId][memberIndex] = {
            ...state.members[organizationId][memberIndex],
            ...updates
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user organizations
      .addCase(fetchUserOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userOrganizations = action.payload;
        
        // Also store in organizations object for quick lookup
        action.payload.forEach(org => {
          state.organizations[org.id] = org;
        });
      })
      .addCase(fetchUserOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch organization by ID
      .addCase(fetchOrganizationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganization = action.payload;
        state.organizations[action.payload.id] = action.payload;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const newOrganization = action.payload;
        
        // Add to organizations object
        state.organizations[newOrganization.id] = newOrganization;
        
        // Add to user organizations
        state.userOrganizations.push(newOrganization);
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update organization
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrganization = action.payload;
        
        // Update in organizations object
        state.organizations[updatedOrganization.id] = {
          ...state.organizations[updatedOrganization.id],
          ...updatedOrganization
        };
        
        // Update current organization if it matches
        if (state.currentOrganization && state.currentOrganization.id === updatedOrganization.id) {
          state.currentOrganization = {
            ...state.currentOrganization,
            ...updatedOrganization
          };
        }
        
        // Update in user organizations
        const index = state.userOrganizations.findIndex(org => org.id === updatedOrganization.id);
        if (index !== -1) {
          state.userOrganizations[index] = {
            ...state.userOrganizations[index],
            ...updatedOrganization
          };
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete organization
      .addCase(deleteOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const organizationId = action.payload;
        
        // Remove from organizations object
        delete state.organizations[organizationId];
        
        // Remove from user organizations
        state.userOrganizations = state.userOrganizations.filter(org => org.id !== organizationId);
        
        // Clear current organization if it matches
        if (state.currentOrganization && state.currentOrganization.id === organizationId) {
          state.currentOrganization = null;
        }
        
        // Remove members
        delete state.members[organizationId];
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch organization members
      .addCase(fetchOrganizationMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        const { organizationId, members } = action.payload;
        state.members[organizationId] = members;
      })
      .addCase(fetchOrganizationMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Invite user to organization
      .addCase(inviteUserToOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteUserToOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const { organizationId, member } = action.payload;
        
        if (state.members[organizationId]) {
          state.members[organizationId].push(member);
        } else {
          state.members[organizationId] = [member];
        }
      })
      .addCase(inviteUserToOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update member role
      .addCase(updateMemberRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const { organizationId, userId, role } = action.payload;
        
        if (state.members[organizationId]) {
          const memberIndex = state.members[organizationId].findIndex(
            member => member.id === userId
          );
          
          if (memberIndex !== -1) {
            state.members[organizationId][memberIndex].role = role;
          }
        }
      })
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove member
      .addCase(removeMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const { organizationId, userId } = action.payload;
        
        if (state.members[organizationId]) {
          state.members[organizationId] = state.members[organizationId].filter(
            member => member.id !== userId
          );
        }
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Leave organization
      .addCase(leaveOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        const organizationId = action.payload;
        
        // Remove from organizations object
        delete state.organizations[organizationId];
        
        // Remove from user organizations
        state.userOrganizations = state.userOrganizations.filter(org => org.id !== organizationId);
        
        // Clear current organization if it matches
        if (state.currentOrganization && state.currentOrganization.id === organizationId) {
          state.currentOrganization = null;
        }
      })
      .addCase(leaveOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetOrganizationError,
  clearCurrentOrganization,
  updateOrganizationMember
} = organizationSlice.actions;

export default organizationSlice.reducer;
