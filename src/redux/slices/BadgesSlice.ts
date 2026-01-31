import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Badge } from "../../service/ApiResponses/GetAllBadges";

interface BadgesState {
  badges: Badge[];
}

const initialState: BadgesState = {
  badges: [],
};

const BadgesSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    setBadgeData: (state, action: PayloadAction<Badge[]>) => {
      state.badges = action.payload;
    },
  },
});

export const { setBadgeData } = BadgesSlice.actions;

export default BadgesSlice.reducer;
