import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import portfolioSlice from './slices/portfolioSlice';
import marketSlice from './slices/marketSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    portfolio: portfolioSlice,
    market: marketSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
