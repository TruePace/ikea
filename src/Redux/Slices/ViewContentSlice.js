import { createSlice } from '@reduxjs/toolkit';

const viewedContentSlice = createSlice({
    name: 'viewedContent',
    initialState: [],
    reducers: {
      markAsViewed: (state, action) => {
        if (!state.includes(action.payload)) {
          return [...state, action.payload];
        }
        return state;
      },
      resetViewed: (state) => {
        return [];
      },
      resetViewedForNewContent: (state, action) => {
        const newContentIds = action.payload;

        // Filter out content that has already been viewed
        const unviewedNewContentIds = newContentIds.filter(id => !state.includes(id));
      
        // Return state without previously viewed content
        return state.filter(id => !newContentIds.includes(id)).concat(unviewedNewContentIds);
      },
    },
  });
  
  export const { markAsViewed, resetViewed, resetViewedForNewContent } = viewedContentSlice.actions;
  
  export const selectUnviewedCount = (state, currentJustInContent) => {
    return currentJustInContent.filter(content => !state.viewedContent.includes(content._id)).length;
  };
  
  export default viewedContentSlice.reducer;
  
//   first working with chatgpt 