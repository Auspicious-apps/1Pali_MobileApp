import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { GetUserReceiptResponse, ReceiptsData } from "../../service/ApiResponses/RecieptApiResponse";
import { fetchData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";

interface ReceiptCache {
  [year: number]: {
    data: GetUserReceiptResponse[];
    timestamp: number;
  };
}

interface ReceiptsState {
  receipts: GetUserReceiptResponse[];
  loading: boolean;
  error: string | null;
  selectedYear: number;
  years: number[];
  cache: ReceiptCache;
  downloadingId: string | null;
}

const initialState: ReceiptsState = {
  receipts: [],
  loading: false,
  error: null,
  selectedYear: new Date().getFullYear(),
  years: [],
  cache: {},
  downloadingId: null,
};

// Async thunk for fetching receipts with year-based caching
export const fetchReceipts = createAsyncThunk(
  "receipts/fetchReceipts",
  async (
    { year, forceRefresh = false }: { year: number; forceRefresh?: boolean },
    { getState, rejectWithValue },
  ) => {
    try {
      // Check cache validity - refresh if data is older than 30 minutes or forced
      const state = getState() as any;
      const cached = state.receipts.cache[year];
      const now = Date.now();
      const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

      if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION) {
        // Return cached data
        return {
          receipts: cached.data,
          year,
          fromCache: true,
        };
      }

      const response = await fetchData<ReceiptsData>(
        ENDPOINTS.GetUserReceipts,
        { year },
      );

      const receipts = response?.data?.data?.receipts || [];

      return {
        receipts,
        year,
        fromCache: false,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch receipts");
    }
  },
);

const ReceiptsSlice = createSlice({
  name: "receipts",
  initialState,
  reducers: {
    clearReceipts: (state) => {
      state.receipts = [];
      state.cache = {};
      state.error = null;
    },
    setReceipts: (state, action: PayloadAction<GetUserReceiptResponse[]>) => {
      state.receipts = action.payload;
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },
    setYears: (state, action: PayloadAction<number[]>) => {
      state.years = action.payload;
    },
    setDownloadingId: (state, action: PayloadAction<string | null>) => {
      state.downloadingId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.fromCache) {
          state.receipts = action.payload.receipts;
          // Cache the receipts for this year
          state.cache[action.payload.year] = {
            data: action.payload.receipts,
            timestamp: Date.now(),
          };

          // Initialize years if not already done
          if (state.years.length === 0) {
            const currentYear = new Date().getFullYear();
            const startYear = currentYear;
            const totalYears = 6;
            state.years = Array.from(
              { length: totalYears },
              (_, i) => startYear + i,
            );
          }
        } else {
          state.receipts = action.payload.receipts;
        }
        state.selectedYear = action.payload.year;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReceipts, setReceipts, setSelectedYear, setYears, setDownloadingId } =
  ReceiptsSlice.actions;
export default ReceiptsSlice.reducer;
