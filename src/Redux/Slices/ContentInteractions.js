import { createSlice } from '@reduxjs/toolkit';

const contentInteractionsSlice = createSlice({
  name: 'contentInteractions',
  initialState: {},
  reducers: {
    setContentInteractions: (state, action) => {
      const { contentId, userId, likeCount, dislikeCount, shareCount, screenshotCount, viewCount, userInteractions } = action.payload;
      if (!state[contentId]) {
        state[contentId] = { 
          likeCount, 
          dislikeCount, 
          shareCount, 
          screenshotCount, 
          viewCount, 
          userInteractions: {} 
        };
      } else {
        state[contentId] = { 
          ...state[contentId], 
          likeCount, 
          dislikeCount, 
          shareCount, 
          screenshotCount, 
          viewCount 
        };
      }
      if (userInteractions) {
        state[contentId].userInteractions = {
          ...state[contentId].userInteractions,
          ...userInteractions
        };
      }
    },
  },
});

export const { setContentInteractions } = contentInteractionsSlice.actions;
export default contentInteractionsSlice.reducer;