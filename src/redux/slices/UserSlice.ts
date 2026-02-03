import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Badge,
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
      console.log(action.payload, "OPOPOP");

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

    markAllBadgesViewed: (state) => {
      const now = new Date().toISOString();

      if (state.badges) {
        state.badges.badges = state.badges.badges.map((b) => ({
          ...b,
          isViewed: true,
          viewedAt: now,
        }));
        state.badges.unviewedCount = 0;
      }

      if (state.user?.badges) {
        state.user.badges.badges = state.user.badges.badges.map((b) => ({
          ...b,
          isViewed: true,
          viewedAt: now,
        }));
        state.user.badges.unviewedCount = 0;
      }
    },

    addNewArtBadge: (state, action: PayloadAction<Badge[]>) => {
      if (state.badges) {
        const existingBadgeIds = new Set(state.badges.badges.map((b) => b.id));
        const newBadges = action.payload.filter(
          (b) => !existingBadgeIds.has(b.id),
        );

        state.badges.badges = [...state.badges.badges, ...newBadges];
        state.badges.totalBadges += newBadges.length;
        state.badges.unviewedCount += newBadges.length;
      } else {
        state.badges = {
          userId: state.user?.id!,
          badges: action.payload,
          totalBadges: action.payload.length,
          unviewedCount: action.payload.length,
        };
      }
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
  markAllBadgesViewed,
  addNewArtBadge,
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
