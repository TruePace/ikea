// SubscriptionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState: {},
  reducers: {
    setSubscription: (state, action) => {
      const { userId, channelId, isSubscribed } = action.payload;
      if (!state[userId]) state[userId] = {};
      state[userId][channelId] = isSubscribed;
    },
  },
});

export const { setSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;