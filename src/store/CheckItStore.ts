import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import languageReducer from "../slices/languageSlice";
import userReducer from "../slices/userSlice";
import adminPanelReducer from "../slices/adminPanelSlice";
import usersReducer from "../slices/usersSlice";
// Create the root reducer independently to obtain the RootState type
const rootReducer = combineReducers({
  language: languageReducer,
  user: userReducer,
  users: usersReducer,
  adminPanel: adminPanelReducer,
});

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
