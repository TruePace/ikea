import { createSlice } from '@reduxjs/toolkit';

const contentInteractionsSlice = createSlice({
  name: 'contentInteractions',
  initialState: {},
  reducers: {
    setContentInteractions: (state, action) => {
      const { contentId, userId, likeCount, dislikeCount, shareCount, screenshotCount, viewCount, userInteractions } = action.payload;
      
      if (!state[contentId]) {
        // Initialize new content with proper fallbacks
        state[contentId] = { 
          likeCount: likeCount ?? 0, 
          dislikeCount: dislikeCount ?? 0, 
          shareCount: shareCount ?? 0, 
          screenshotCount: screenshotCount ?? 0, 
          viewCount: viewCount ?? 0, 
          userInteractions: {} 
        };
      } else {
        // Update existing content, but only update defined values
        state[contentId] = { 
          ...state[contentId],
          // Only update if the value is defined (not undefined)
          ...(likeCount !== undefined && { likeCount }),
          ...(dislikeCount !== undefined && { dislikeCount }),
          ...(shareCount !== undefined && { shareCount }),
          ...(screenshotCount !== undefined && { screenshotCount }),
          ...(viewCount !== undefined && { viewCount })
        };
      }
      
      // Handle user interactions separately
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