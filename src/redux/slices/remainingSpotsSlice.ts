import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RemainingSpotsState {
  availableSpots: number | null;
}

const initialState: RemainingSpotsState = {
  availableSpots: null,
};

const remainingSpotsSlice = createSlice({
  name: "remainingSpots",
  initialState,
  reducers: {
    setRemainingSpots: (state, action: PayloadAction<number>) => {
      state.availableSpots = action.payload;
    },
  },
});

export const { setRemainingSpots } = remainingSpotsSlice.actions;
export default remainingSpotsSlice.reducer;
