import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import BadgesReducer from "./slices/BadgesSlice";
import CollectBadgesReducer from "./slices/CollectBadgesSlice";
import userReducer, {
  startReservationTimer,
  decrementReservationTimer,
} from "./slices/UserSlice";
import StripePlansReducer from "./slices/StripePlans";
import ArtsReducer from "./slices/ArtsSlice";
import UpdatesReducer from "./slices/UpdatesSlice";
import ReceiptsReducer from "./slices/ReceiptsSlice";

// Create listener middleware for timer countdown
const timerListenerMiddleware = createListenerMiddleware();

let timerInterval: any = null;

timerListenerMiddleware.startListening({
  actionCreator: startReservationTimer,
  effect: (action, api) => {
    // Clear any existing interval
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Start new countdown interval
    timerInterval = setInterval(() => {
      const state = api.getState() as ReturnType<typeof store.getState>;
      const currentSeconds = state.user.reservationSeconds;

      // Only dispatch if timer is still active
      if (currentSeconds !== null && currentSeconds > 0) {
        api.dispatch(decrementReservationTimer());
      } else {
        // Stop interval when expired
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    }, 1000);
  },
});

export const store = configureStore({
  reducer: {
    collectBadges: CollectBadgesReducer,
    user: userReducer,
    badges: BadgesReducer,
    stripePlans: StripePlansReducer,
    arts: ArtsReducer,
    updates: UpdatesReducer,
    receipts: ReceiptsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(timerListenerMiddleware.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
