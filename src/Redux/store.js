import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import likeDislikeReducer from './Slices/LikeDislikeSlice';
import viewedContentReducer from './Slices/ViewContentSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['viewedContent', 'likeDislike'], // Persist only these reducers
};

const rootReducer = combineReducers({
  viewedContent: viewedContentReducer,
  likeDislike: likeDislikeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);