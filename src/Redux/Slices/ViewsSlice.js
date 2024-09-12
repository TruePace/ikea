import { createSlice } from '@reduxjs/toolkit';
import socket from '@/components/Socket io/SocketClient';

const viewsSlice = createSlice({
  name: 'views',
  initialState: {},
  reducers: {
    setViews: (state, action) => {
      const { videoId, views } = action.payload;
      state[videoId] = views;
    },
  },
});

export const { setViews } = viewsSlice.actions;

// Thunk to handle real-time updates
export const initializeViewsListener = () => (dispatch) => {
  socket.on('videoUpdated', (data) => {
    dispatch(setViews({ videoId: data.videoId, views: data.viewsCount }));
  });
};

export default viewsSlice.reducer;