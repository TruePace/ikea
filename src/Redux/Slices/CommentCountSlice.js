import { createSlice } from '@reduxjs/toolkit';


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