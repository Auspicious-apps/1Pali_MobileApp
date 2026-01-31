import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import BadgesReducer from "./slices/BadgesSlice";
import CollectBadgesReducer from "./slices/CollectBadgesSlice";
import userReducer from "./slices/UserSlice";
import StripePlansReducer from "./slices/StripePlans";

export const store = configureStore({
  reducer: {
    collectBadges: CollectBadgesReducer,
    user: userReducer,
    badges: BadgesReducer,
    stripePlans: StripePlansReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
