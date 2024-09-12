import socket from '@/components/Socket io/SocketClient';
import { createSlice } from '@reduxjs/toolkit';

const likesSlice = createSlice({
  name: 'likes',
  initialState: {},
  reducers: {
    setLikes: (state, action) => {
      const { videoId, likes } = action.payload;
      state[videoId] = likes;
    },
  },
});

export const { setLikes } = likesSlice.actions;


// Thunk to handle real-time updates
export const initializeLikesListener = () => (dispatch) => {
  socket.on('videoUpdated', (data) => {
    dispatch(setLikes({ videoId: data.videoId, likes: data.likesCount }));
  });
};

export default likesSlice.reducer;