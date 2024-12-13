//  Code for the redux store and persistor
import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./eventReducer";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Importing storage from redux-persist
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, eventReducer);

// Configuring redux store
export const store = configureStore({
  reducer: {
    events: persistedReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
  },
});

// Persistor for redux store
export const persistor = persistStore(store);

// Exporting store and persistor
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
