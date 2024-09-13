// import SecondSocketHandler from '@/components/Socket io/SecondSocketHandler';
import { createSlice } from '@reduxjs/toolkit';

import socket from '@/components/Socket io/SocketClient';

const viewsSlice = createSlice({
  name: 'views',
  initialState: {},
  reducers: {
    setViews: (state, action) => {
      const { contentId, views } = action.payload;
      state[contentId] = views;
    },
  },
});

export const { setViews } = viewsSlice.actions;

export const initializeViewsListener = () => (dispatch) => {
  socket.on('contentUpdated', (data) => {
    dispatch(setViews({ contentId: data.contentId, views: data.viewsCount }));
  });
};

export default viewsSlice.reducer;