import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppleSigninResponse, User } from "../../service/ApiResponses/AppleSignin";

interface UserState {
  user: User | null;
  claimedNumber: number | null;
  reservationToken: string | null;
}

const initialState: UserState = {
  user: null,
  claimedNumber: null,
  reservationToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<User>) => {
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
  },
});

export const {
  setUserData,
  clearUserData,
  setClaimedNumber,
  setReservationToken,
} = userSlice.actions;

export default userSlice.reducer;
