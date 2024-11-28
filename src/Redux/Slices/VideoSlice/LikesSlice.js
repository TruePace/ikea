import { createSlice } from '@reduxjs/toolkit';
import socket from '@/components/Socket io/SocketClient';

const likesSlice = createSlice({
  name: 'likes',
  initialState: {},
  reducers: {
    setLikes: (state, action) => {
      const { videoId, likeCount, engagementScore, viralScore, isLiked } = action.payload;
      state[videoId] = { likeCount, engagementScore, viralScore, isLiked };
      // console.log('Like state updated:', state);
    },
  },
});

export const { setLikes } = likesSlice.actions;

export default likesSlice.reducer;