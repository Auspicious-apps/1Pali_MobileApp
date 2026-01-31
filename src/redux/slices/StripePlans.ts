import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plan } from "../../service/ApiResponses/GetAllStripePLans";

interface StripePlansState {
  stripePlans: Plan[];
}

const initialState: StripePlansState = {
  stripePlans: [],
};

const StripePlansSlice = createSlice({
  name: "stripePlans",
  initialState,
  reducers: {
    setStripePlans: (state, action: PayloadAction<Plan[]>) => {
      state.stripePlans = action.payload;
    },
  },
});

export const { setStripePlans } = StripePlansSlice.actions;

export default StripePlansSlice.reducer;
