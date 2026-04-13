import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import ENDPOINTS from "../../service/ApiEndpoints";
import { GetMySubscriptionResponse } from "../../service/ApiResponses/GetMySubscriptionApiresponse";
import { fetchData } from "../../service/ApiService";

interface SubscriptionState {
  subscriptionData: GetMySubscriptionResponse | null;
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
}

const initialState: SubscriptionState = {
  subscriptionData: null,
  loading: false,
  error: null,
  lastFetchTime: null,
};

export const fetchMySubscription = createAsyncThunk<
  GetMySubscriptionResponse,
  void,
  { rejectValue: string }
>("subscription/fetchMySubscription", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchData<GetMySubscriptionResponse>(
      ENDPOINTS.mySubscription,
    );
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.message || "Failed to fetch subscription data",
    );
  }
});

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionData: (state) => {
      state.subscriptionData = null;
      state.lastFetchTime = null;
    },
    setSubscriptionData: (
      state,
      action: PayloadAction<GetMySubscriptionResponse>,
    ) => {
      state.subscriptionData = action.payload;
      state.lastFetchTime = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionData = action.payload;
        state.lastFetchTime = Date.now();
        state.error = null;
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch subscription";
      });
  },
});

export const { clearSubscriptionData, setSubscriptionData } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
