import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import languageReducer from "../slices/languageSlice";
import userReducer from "../slices/userSlice";
import adminPanelReducer from "../slices/adminPanelSlice";
import changeReducer from "../slices/changeSlice";
import eventReducer from "../slices/eventSlice";
import labelCacheReducer from "../slices/labelCacheSlice";
import publicationsReducer from "../slices/publicationsSlice";
import { apiSlice } from "../api/apiSlice";
// Create the root reducer independently to obtain the RootState type
const rootReducer = combineReducers({
  language: languageReducer,
  user: userReducer,
  adminPanel: adminPanelReducer,
  change: changeReducer,
  event: eventReducer,
  labelCache: labelCacheReducer,
  publications: publicationsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
