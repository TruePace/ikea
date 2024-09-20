import { createSlice } from '@reduxjs/toolkit';
import socket from '@/components/Socket io/SocketClient';

const commentCountSlice = createSlice({
  name: 'commentCount',
  initialState: {},
  reducers: {
    setCommentCount: (state, action) => {
      const { contentId, count } = action.payload;
      state[contentId] = count;
      console.log('Comment state updated:', state);
    },
  },
});



export const { setCommentCount } = commentCountSlice.actions;
export default commentCountSlice.reducer;