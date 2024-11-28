import { createSlice } from '@reduxjs/toolkit';
import socket from '@/components/Socket io/SocketClient';

const viewsSlice = createSlice({
  name: 'views',
  initialState: {},
  reducers: {
    setViews: (state, action) => {
      const { videoId, viewCount, avgWatchTime, engagementScore, viralScore } = action.payload;
      state[videoId] = { viewCount, avgWatchTime, engagementScore, viralScore };
      // console.log('View state updated:', state);
    },
  },
});

export const { setViews } = viewsSlice.actions;


export default viewsSlice.reducer;