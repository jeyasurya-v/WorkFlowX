import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { getAuthToken } from '../../utils/tokenUtils';

// Initialize socket connection
export const initializeSocket = createAsyncThunk(
  'socket/initialize',
  async (_, { dispatch, getState }) => {
    const { socket } = getState().socket;
    
    // Close existing socket if it exists
    if (socket) {
      socket.disconnect();
    }
    
    // Get auth token
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token available');
    }
    
    // Create new socket connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected');
      dispatch(setConnected(true));
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      dispatch(setConnected(false));
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      dispatch(setError(error.message));
    });
    
    // Return the socket instance
    return newSocket;
  }
);

// Subscribe to rooms
export const subscribeToRooms = createAsyncThunk(
  'socket/subscribeToRooms',
  async (rooms, { getState }) => {
    const { socket } = getState().socket;
    
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }
    
    socket.emit('subscribe', rooms);
    return rooms;
  }
);

// Unsubscribe from rooms
export const unsubscribeFromRooms = createAsyncThunk(
  'socket/unsubscribeFromRooms',
  async (rooms, { getState }) => {
    const { socket } = getState().socket;
    
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }
    
    socket.emit('unsubscribe', rooms);
    return rooms;
  }
);

// Close socket connection
export const closeSocket = createAsyncThunk(
  'socket/close',
  async (_, { getState }) => {
    const { socket } = getState().socket;
    
    if (socket) {
      socket.disconnect();
    }
    
    return null;
  }
);

const initialState = {
  socket: null,
  isConnected: false,
  isLoading: false,
  error: null,
  subscribedRooms: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize socket
      .addCase(initializeSocket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeSocket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.socket = action.payload;
      })
      .addCase(initializeSocket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Subscribe to rooms
      .addCase(subscribeToRooms.fulfilled, (state, action) => {
        // Add new rooms without duplicates
        const newRooms = action.payload.filter(
          room => !state.subscribedRooms.includes(room)
        );
        state.subscribedRooms = [...state.subscribedRooms, ...newRooms];
      })
      
      // Unsubscribe from rooms
      .addCase(unsubscribeFromRooms.fulfilled, (state, action) => {
        // Remove unsubscribed rooms
        state.subscribedRooms = state.subscribedRooms.filter(
          room => !action.payload.includes(room)
        );
      })
      
      // Close socket
      .addCase(closeSocket.fulfilled, (state) => {
        state.socket = null;
        state.isConnected = false;
        state.subscribedRooms = [];
      });
  },
});

export const { setConnected, setError, setSocket } = socketSlice.actions;

export default socketSlice.reducer;
