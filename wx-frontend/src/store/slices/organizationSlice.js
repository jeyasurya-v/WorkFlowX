import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  organizations: [
    // Mock data for development
    { id: 'org1', name: 'Acme Corp', role: 'admin' },
    { id: 'org2', name: 'Globex Inc', role: 'member' },
    { id: 'org3', name: 'Initech', role: 'viewer' }
  ],
  currentOrganization: { id: 'org1', name: 'Acme Corp', role: 'admin' },
  loading: false,
  error: null,
};

export const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    fetchOrganizationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrganizationsSuccess: (state, action) => {
      state.organizations = action.payload;
      state.loading = false;
      state.error = null;
      
      // If no current organization is set, set the first one
      if (!state.currentOrganization && action.payload.length > 0) {
        state.currentOrganization = action.payload[0];
      }
    },
    fetchOrganizationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    createOrganizationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createOrganizationSuccess: (state, action) => {
      state.organizations.push(action.payload);
      state.currentOrganization = action.payload;
      state.loading = false;
      state.error = null;
    },
    createOrganizationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateOrganizationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOrganizationSuccess: (state, action) => {
      const index = state.organizations.findIndex(org => org.id === action.payload.id);
      if (index !== -1) {
        state.organizations[index] = action.payload;
        
        // Update current organization if it's the one being updated
        if (state.currentOrganization && state.currentOrganization.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
      }
      state.loading = false;
      state.error = null;
    },
    updateOrganizationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteOrganizationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteOrganizationSuccess: (state, action) => {
      state.organizations = state.organizations.filter(org => org.id !== action.payload);
      
      // If the deleted organization is the current one, set a new current organization
      if (state.currentOrganization && state.currentOrganization.id === action.payload) {
        state.currentOrganization = state.organizations.length > 0 ? state.organizations[0] : null;
      }
      
      state.loading = false;
      state.error = null;
    },
    deleteOrganizationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchOrganizationsStart,
  fetchOrganizationsSuccess,
  fetchOrganizationsFailure,
  setCurrentOrganization,
  createOrganizationStart,
  createOrganizationSuccess,
  createOrganizationFailure,
  updateOrganizationStart,
  updateOrganizationSuccess,
  updateOrganizationFailure,
  deleteOrganizationStart,
  deleteOrganizationSuccess,
  deleteOrganizationFailure,
} = organizationSlice.actions;

export default organizationSlice.reducer;
