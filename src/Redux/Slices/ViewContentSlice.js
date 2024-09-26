import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import debounce from 'lodash/debounce';

const initialState = {
  viewedIds: [],
  unviewedCount: 0,
  justInContent: [], // This is now at the top level of the state
};

const updateUnviewedCountDebounced = debounce((dispatch, getState) => {
  const state = getState();
  const unviewedCount = selectUnviewedCount(state);
  dispatch(setUnviewedCount(unviewedCount));
}, 300);

export const updateUnviewedCount = createAsyncThunk(
  'viewedContent/updateUnviewedCount',
  async (_, { dispatch, getState }) => {
    updateUnviewedCountDebounced(dispatch, getState);
  }
);

const viewedContentSlice = createSlice({
  name: 'viewedContent',
  initialState,
  reducers: {
    markAsViewed: (state, action) => {
      if (!state.viewedIds.includes(action.payload)) {
        state.viewedIds.push(action.payload);
      }
      state.unviewedCount = selectUnviewedCount({ viewedContent: state });
    },
    resetViewed: (state) => {
      state.viewedIds = [];
      state.unviewedCount = state.justInContent.length;
    },
    setJustInContent: (state, action) => {
      state.justInContent = action.payload;
      state.unviewedCount = selectUnviewedCount({ viewedContent: state });
    },
    setUnviewedCount: (state, action) => {
      state.unviewedCount = action.payload;
    },
  },
});

export const { markAsViewed, resetViewed, setJustInContent, setUnviewedCount } = viewedContentSlice.actions;

export const selectUnviewedCount = (state) => {
  const justInContent = state.viewedContent.justInContent;
  const viewedIds = state.viewedContent.viewedIds;
  return justInContent.filter(content => !viewedIds.includes(content._id)).length;
};

export default viewedContentSlice.reducer;