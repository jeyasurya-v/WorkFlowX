import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pipelineService from '../../services/pipelineService';
import toast from 'react-hot-toast';

// Get all pipelines for an organization
export const fetchOrganizationPipelines = createAsyncThunk(
  'pipelines/fetchOrganizationPipelines',
  async (organizationId, { rejectWithValue }) => {
    try {
      const pipelines = await pipelineService.getOrganizationPipelines(organizationId);
      return { organizationId, pipelines };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pipelines');
    }
  }
);

// Get pipeline by ID
export const fetchPipelineById = createAsyncThunk(
  'pipelines/fetchPipelineById',
  async (pipelineId, { rejectWithValue }) => {
    try {
      const pipeline = await pipelineService.getPipelineById(pipelineId);
      return pipeline;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pipeline');
    }
  }
);

// Create a new pipeline
export const createPipeline = createAsyncThunk(
  'pipelines/createPipeline',
  async (pipelineData, { rejectWithValue }) => {
    try {
      const newPipeline = await pipelineService.createPipeline(pipelineData);
      toast.success('Pipeline created successfully');
      return newPipeline;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create pipeline');
      return rejectWithValue(error.response?.data?.message || 'Failed to create pipeline');
    }
  }
);

// Update a pipeline
export const updatePipeline = createAsyncThunk(
  'pipelines/updatePipeline',
  async ({ pipelineId, pipelineData }, { rejectWithValue }) => {
    try {
      const updatedPipeline = await pipelineService.updatePipeline(pipelineId, pipelineData);
      toast.success('Pipeline updated successfully');
      return updatedPipeline;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pipeline');
      return rejectWithValue(error.response?.data?.message || 'Failed to update pipeline');
    }
  }
);

// Delete a pipeline
export const deletePipeline = createAsyncThunk(
  'pipelines/deletePipeline',
  async (pipelineId, { rejectWithValue }) => {
    try {
      await pipelineService.deletePipeline(pipelineId);
      toast.success('Pipeline deleted successfully');
      return pipelineId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete pipeline');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete pipeline');
    }
  }
);

// Trigger a pipeline build
export const triggerPipelineBuild = createAsyncThunk(
  'pipelines/triggerBuild',
  async ({ pipelineId, buildData }, { rejectWithValue }) => {
    try {
      const build = await pipelineService.triggerBuild(pipelineId, buildData);
      toast.success('Build triggered successfully');
      return build;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to trigger build');
      return rejectWithValue(error.response?.data?.message || 'Failed to trigger build');
    }
  }
);

const initialState = {
  pipelines: {},
  pipelinesByOrganization: {},
  currentPipeline: null,
  isLoading: false,
  error: null,
};

const pipelineSlice = createSlice({
  name: 'pipelines',
  initialState,
  reducers: {
    resetPipelineError: (state) => {
      state.error = null;
    },
    updatePipelineStatus: (state, action) => {
      const { pipelineId, status, lastBuild } = action.payload;
      
      // Update in pipelines object
      if (state.pipelines[pipelineId]) {
        state.pipelines[pipelineId].status = status;
        if (lastBuild) {
          state.pipelines[pipelineId].lastBuild = lastBuild;
        }
      }
      
      // Update in current pipeline if it matches
      if (state.currentPipeline && state.currentPipeline.id === pipelineId) {
        state.currentPipeline.status = status;
        if (lastBuild) {
          state.currentPipeline.lastBuild = lastBuild;
        }
      }
      
      // Update in pipelinesByOrganization
      Object.keys(state.pipelinesByOrganization).forEach(orgId => {
        const index = state.pipelinesByOrganization[orgId].findIndex(
          p => p.id === pipelineId
        );
        
        if (index !== -1) {
          state.pipelinesByOrganization[orgId][index].status = status;
          if (lastBuild) {
            state.pipelinesByOrganization[orgId][index].lastBuild = lastBuild;
          }
        }
      });
    },
    clearCurrentPipeline: (state) => {
      state.currentPipeline = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch organization pipelines
      .addCase(fetchOrganizationPipelines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationPipelines.fulfilled, (state, action) => {
        state.isLoading = false;
        const { organizationId, pipelines } = action.payload;
        
        // Store pipelines by organization
        state.pipelinesByOrganization[organizationId] = pipelines;
        
        // Also store in pipelines object for quick lookup
        pipelines.forEach(pipeline => {
          state.pipelines[pipeline.id] = pipeline;
        });
      })
      .addCase(fetchOrganizationPipelines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch pipeline by ID
      .addCase(fetchPipelineById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPipelineById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPipeline = action.payload;
        state.pipelines[action.payload.id] = action.payload;
      })
      .addCase(fetchPipelineById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create pipeline
      .addCase(createPipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        const newPipeline = action.payload;
        
        // Add to pipelines object
        state.pipelines[newPipeline.id] = newPipeline;
        
        // Add to organization pipelines if it exists
        if (state.pipelinesByOrganization[newPipeline.organization]) {
          state.pipelinesByOrganization[newPipeline.organization].push(newPipeline);
        }
      })
      .addCase(createPipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update pipeline
      .addCase(updatePipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPipeline = action.payload;
        
        // Update in pipelines object
        state.pipelines[updatedPipeline.id] = updatedPipeline;
        
        // Update current pipeline if it matches
        if (state.currentPipeline && state.currentPipeline.id === updatedPipeline.id) {
          state.currentPipeline = updatedPipeline;
        }
        
        // Update in organization pipelines
        if (state.pipelinesByOrganization[updatedPipeline.organization]) {
          const index = state.pipelinesByOrganization[updatedPipeline.organization].findIndex(
            p => p.id === updatedPipeline.id
          );
          
          if (index !== -1) {
            state.pipelinesByOrganization[updatedPipeline.organization][index] = updatedPipeline;
          }
        }
      })
      .addCase(updatePipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete pipeline
      .addCase(deletePipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        const pipelineId = action.payload;
        
        // Get organization ID before removing from pipelines object
        const organizationId = state.pipelines[pipelineId]?.organization;
        
        // Remove from pipelines object
        delete state.pipelines[pipelineId];
        
        // Clear current pipeline if it matches
        if (state.currentPipeline && state.currentPipeline.id === pipelineId) {
          state.currentPipeline = null;
        }
        
        // Remove from organization pipelines
        if (organizationId && state.pipelinesByOrganization[organizationId]) {
          state.pipelinesByOrganization[organizationId] = state.pipelinesByOrganization[organizationId].filter(
            p => p.id !== pipelineId
          );
        }
      })
      .addCase(deletePipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Trigger build
      .addCase(triggerPipelineBuild.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(triggerPipelineBuild.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(triggerPipelineBuild.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  resetPipelineError, 
  updatePipelineStatus, 
  clearCurrentPipeline 
} = pipelineSlice.actions;

export default pipelineSlice.reducer;
