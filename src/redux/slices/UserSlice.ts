import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AppleSigninResponse,
  User,
} from "../../service/ApiResponses/AppleSignin";
import {
  Badges,
  GetUserProfileApiResponse,
} from "../../service/ApiResponses/GetUserProfile";

interface UserState {
  user: GetUserProfileApiResponse | null;
  claimedNumber: number | null;
  reservationToken: string | null;
  badges: Badges | [];
  reservationSeconds: number | null;
}

const initialState: UserState = {
  user: null,
  claimedNumber: null,
  reservationToken: null,
  badges: [],
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
