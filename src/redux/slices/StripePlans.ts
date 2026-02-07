import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plan } from "../../service/ApiResponses/GetAllStripePLans";

interface StripePlansState {
  stripePlans: Plan[];
  selectedPlanId?: string | null;
  selectedPlanData?: Plan | null;
}

const initialState: StripePlansState = {
  stripePlans: [],
  selectedPlanId: null,
  selectedPlanData: null,
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
    setSelectedPlanData: (state, action: PayloadAction<Plan>) => {
      state.selectedPlanData = action.payload;
    },
  },
});

export const { setStripePlans, setSelectedPlanId, setSelectedPlanData } =
  StripePlansSlice.actions;

export default StripePlansSlice.reducer;
