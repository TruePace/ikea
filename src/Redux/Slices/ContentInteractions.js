import { createSlice } from '@reduxjs/toolkit';

const contentInteractionsSlice = createSlice({
  name: 'contentInteractions',
  initialState: {},
  reducers: {
    setContentInteractions: (state, action) => {
      const { contentId, likeCount, dislikeCount, shareCount, screenshotCount, viewCount, activeButton } = action.payload;
      state[contentId] = { likeCount, dislikeCount, shareCount, screenshotCount, viewCount, activeButton };
    },
  },
});

export const { setContentInteractions } = contentInteractionsSlice.actions;
export default contentInteractionsSlice.reducer;