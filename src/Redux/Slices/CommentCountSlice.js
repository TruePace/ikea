import { createSlice } from '@reduxjs/toolkit';
import socket from '@/components/Socket io/SocketClient';

const commentCountSlice = createSlice({
  name: 'commentCount',
  initialState: {},
  reducers: {
    setCommentCount: (state, action) => {
      const { contentId, count } = action.payload;
      state[contentId] = count;
    },
  },
});

// Thunk to handle real-time updates
export const initializeCommentCountListener = () => (dispatch) => {
  socket.on('videoUpdated', (data) => {
    dispatch(setCommentCount({ contentId: data.videoId, count: data.commentCount }));
  });
};

export const { setCommentCount } = commentCountSlice.actions;
export default commentCountSlice.reducer;