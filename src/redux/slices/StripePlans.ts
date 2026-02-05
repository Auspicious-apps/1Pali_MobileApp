import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plan } from "../../service/ApiResponses/GetAllStripePLans";

interface StripePlansState {
  stripePlans: Plan[];
  selectedPlanId?: string | null;
}

const initialState: StripePlansState = {
  stripePlans: [],
  selectedPlanId: null,
};

const StripePlansSlice = createSlice({
  name: "stripePlans",
  initialState,
  reducers: {
    setStripePlans: (state, action: PayloadAction<Plan[]>) => {
      state.stripePlans = action.payload;
    },
    setSelectedPlanId: (state, action: PayloadAction<string>) => {
      state.selectedPlanId = action.payload;
    },
  },
});

export const { setStripePlans, setSelectedPlanId } = StripePlansSlice.actions;

export default StripePlansSlice.reducer;
