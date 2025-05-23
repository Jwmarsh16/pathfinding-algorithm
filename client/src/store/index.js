// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import pathfinderReducer from './pathfinderSlice'

export const store = configureStore({
  reducer: {
    pathfinder: pathfinderReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    }),
  // ⚠️ completely disable Redux DevTools
  devTools: false
})
