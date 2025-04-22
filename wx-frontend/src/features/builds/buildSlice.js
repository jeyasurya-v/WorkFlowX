import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import buildService from '../../services/buildService';
import toast from 'react-hot-toast';

// Get builds for a pipeline
export const fetchPipelineBuilds = createAsyncThunk(
  'builds/fetchPipelineBuilds',
  async ({ pipelineId, params }, { rejectWithValue }) => {
    try {
      const builds = await buildService.getPipelineBuilds(pipelineId, params);
      return { pipelineId, builds: builds.builds, pagination: builds.pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch builds');
    }
  }
);

// Get build by ID
export const fetchBuildById = createAsyncThunk(
  'builds/fetchBuildById',
  async (buildId, { rejectWithValue }) => {
    try {
      const build = await buildService.getBuildById(buildId);
      return build;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch build');
    }
  }
);

// Get build logs
export const fetchBuildLogs = createAsyncThunk(
  'builds/fetchBuildLogs',
  async (buildId, { rejectWithValue }) => {
    try {
      const logs = await buildService.getBuildLogs(buildId);
      return { buildId, logs };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch build logs');
    }
  }
);

// Retry a build
export const retryBuild = createAsyncThunk(
  'builds/retryBuild',
  async (buildId, { rejectWithValue }) => {
    try {
      const build = await buildService.retryBuild(buildId);
      toast.success('Build retry triggered successfully');
      return build;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry build');
      return rejectWithValue(error.response?.data?.message || 'Failed to retry build');
    }
  }
);

// Cancel a build
export const cancelBuild = createAsyncThunk(
  'builds/cancelBuild',
  async (buildId, { rejectWithValue }) => {
    try {
      const result = await buildService.cancelBuild(buildId);
      toast.success('Build canceled successfully');
      return result;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel build');
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel build');
    }
  }
);

// Add comment to a build
export const addBuildComment = createAsyncThunk(
  'builds/addBuildComment',
  async ({ buildId, message }, { rejectWithValue }) => {
    try {
      const result = await buildService.addBuildComment(buildId, message);
      return { buildId, comments: result.comments };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const initialState = {
  builds: {},
  buildsByPipeline: {},
  currentBuild: null,
  buildLogs: {},
  isLoading: false,
  error: null,
  pagination: {},
};

const buildSlice = createSlice({
  name: 'builds',
  initialState,
  reducers: {
    resetBuildError: (state) => {
      state.error = null;
    },
    updateBuildStatus: (state, action) => {
      const { buildId, status, finishedAt, duration } = action.payload;
      
      // Update in builds object
      if (state.builds[buildId]) {
        state.builds[buildId].status = status;
        if (finishedAt) state.builds[buildId].finishedAt = finishedAt;
        if (duration) state.builds[buildId].duration = duration;
      }
      
      // Update in current build if it matches
      if (state.currentBuild && state.currentBuild.id === buildId) {
        state.currentBuild.status = status;
        if (finishedAt) state.currentBuild.finishedAt = finishedAt;
        if (duration) state.currentBuild.duration = duration;
      }
      
      // Update in buildsByPipeline
      Object.keys(state.buildsByPipeline).forEach(pipelineId => {
        const index = state.buildsByPipeline[pipelineId].findIndex(
          b => b.id === buildId
        );
        
        if (index !== -1) {
          state.buildsByPipeline[pipelineId][index].status = status;
          if (finishedAt) state.buildsByPipeline[pipelineId][index].finishedAt = finishedAt;
          if (duration) state.buildsByPipeline[pipelineId][index].duration = duration;
        }
      });
    },
    updateBuildStage: (state, action) => {
      const { buildId, stageIndex, status, finishedAt, duration } = action.payload;
      
      // Update in current build if it matches
      if (state.currentBuild && state.currentBuild.id === buildId && state.currentBuild.stages[stageIndex]) {
        state.currentBuild.stages[stageIndex].status = status;
        if (finishedAt) state.currentBuild.stages[stageIndex].finishedAt = finishedAt;
        if (duration) state.currentBuild.stages[stageIndex].duration = duration;
      }
      
      // Update in builds object
      if (state.builds[buildId] && state.builds[buildId].stages && state.builds[buildId].stages[stageIndex]) {
        state.builds[buildId].stages[stageIndex].status = status;
        if (finishedAt) state.builds[buildId].stages[stageIndex].finishedAt = finishedAt;
        if (duration) state.builds[buildId].stages[stageIndex].duration = duration;
      }
    },
    addBuildLogLine: (state, action) => {
      const { buildId, line } = action.payload;
      
      if (!state.buildLogs[buildId]) {
        state.buildLogs[buildId] = '';
      }
      
      state.buildLogs[buildId] += line + '\n';
    },
    clearCurrentBuild: (state) => {
      state.currentBuild = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pipeline builds
      .addCase(fetchPipelineBuilds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPipelineBuilds.fulfilled, (state, action) => {
        state.isLoading = false;
        const { pipelineId, builds, pagination } = action.payload;
        
        // Store builds by pipeline
        state.buildsByPipeline[pipelineId] = builds;
        
        // Also store in builds object for quick lookup
        builds.forEach(build => {
          state.builds[build.id] = build;
        });
        
        // Store pagination
        state.pagination[pipelineId] = pagination;
      })
      .addCase(fetchPipelineBuilds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch build by ID
      .addCase(fetchBuildById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBuild = action.payload;
        state.builds[action.payload.id] = action.payload;
      })
      .addCase(fetchBuildById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch build logs
      .addCase(fetchBuildLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        const { buildId, logs } = action.payload;
        state.buildLogs[buildId] = logs;
      })
      .addCase(fetchBuildLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Retry build
      .addCase(retryBuild.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retryBuild.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(retryBuild.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel build
      .addCase(cancelBuild.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBuild.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, status } = action.payload.build;
        
        // Update build status
        if (state.builds[id]) {
          state.builds[id].status = status;
        }
        
        if (state.currentBuild && state.currentBuild.id === id) {
          state.currentBuild.status = status;
        }
      })
      .addCase(cancelBuild.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add build comment
      .addCase(addBuildComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBuildComment.fulfilled, (state, action) => {
        state.isLoading = false;
        const { buildId, comments } = action.payload;
        
        if (state.builds[buildId]) {
          state.builds[buildId].comments = comments;
        }
        
        if (state.currentBuild && state.currentBuild.id === buildId) {
          state.currentBuild.comments = comments;
        }
      })
      .addCase(addBuildComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetBuildError,
  updateBuildStatus,
  updateBuildStage,
  addBuildLogLine,
  clearCurrentBuild
} = buildSlice.actions;

export default buildSlice.reducer;
