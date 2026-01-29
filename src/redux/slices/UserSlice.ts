import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Badges,
  GetUserProfileApiResponse,
} from "../../service/ApiResponses/GetUserProfile";
import { RootState } from "../store";

interface UserState {
  user: GetUserProfileApiResponse | null;
  claimedNumber: number | null;
  reservationToken: string | null;
  badges: Badges | null;
  reservationSeconds: number | null;
}

const initialState: UserState = {
  user: null,
  claimedNumber: null,
  reservationToken: null,
  badges: null,
  reservationSeconds: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<GetUserProfileApiResponse>) => {
      state.user = action.payload;
    },
    clearUserData: (state) => {
      state.user = null;
    },
    setClaimedNumber: (state, action: PayloadAction<number>) => {
      state.claimedNumber = action.payload;
    },
    setReservationToken: (state, action: PayloadAction<string>) => {
      state.reservationToken = action.payload;
    },
    setBadges: (state, action: PayloadAction<Badges>) => {
      state.badges = action.payload;
    },
    startReservationTimer: (state, action: PayloadAction<number>) => {
      state.reservationSeconds = action.payload;
    },

    decrementReservationTimer: (state) => {
      if (state.reservationSeconds && state.reservationSeconds > 0) {
        state.reservationSeconds -= 1;
      }
    },

    clearReservationTimer: (state) => {
      state.reservationSeconds = null;
    },
  },
});

export const {
  setUserData,
  clearUserData,
  setClaimedNumber,
  setReservationToken,
  setBadges,
  startReservationTimer,
  decrementReservationTimer,
  clearReservationTimer,
} = userSlice.actions;

export default userSlice.reducer;

export const selectGrowthBadges = createSelector(
  [(state: RootState) => state.user.badges], // Access global state . slice name . property
  (badges) => badges?.badges.filter((b) => b.badge.category === "GROWTH") ?? [],
);
export const selectCommunityBadges = createSelector(
  [(state: RootState) => state.user.badges], // Access global state . slice name . property
  (badges) =>
    badges?.badges.filter((b) => b.badge.category === "COMMUNITY") ?? [],
);
export const selectImpactBadges = createSelector(
  [(state: RootState) => state.user.badges], // Access global state . slice name . property
  (badges) => badges?.badges.filter((b) => b.badge.category === "IMPACT") ?? [],
);
export const selectArtBadges = createSelector(
  [(state: RootState) => state.user.badges], // Access global state . slice name . property
  (badges) => badges?.badges.filter((b) => b.badge.category === "ART") ?? [],
);

export const getUnViewedBadges = createSelector(
  [(state: RootState) => state.user.badges], // Access global state . slice name . property
  (badges) => badges?.badges.filter((b) => !b.isViewed) ?? [],
);
