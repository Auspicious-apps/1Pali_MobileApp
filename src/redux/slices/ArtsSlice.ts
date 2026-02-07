import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Artwork,
  GetUserArtResponse,
} from "../../service/ApiResponses/GetUserArt";
import { fetchData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";

interface ArtsState {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  hasMore: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ArtsState = {
  artworks: [],
  loading: false,
  error: null,
  lastFetchTime: null,
  hasMore: true,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async thunk for fetching arts with caching
export const fetchArts = createAsyncThunk(
  "arts/fetchArts",
  async (
    {
      page = 1,
      forceRefresh = false,
    }: { page?: number; forceRefresh?: boolean } = {},
    { getState, rejectWithValue },
  ) => {
    try {
      // Check cache validity - refresh if data is older than 10 minutes or forced
      const state = getState() as any;
      const lastFetchTime = state.arts.lastFetchTime;
      const now = Date.now();
      const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

      if (
        !forceRefresh &&
        lastFetchTime &&
        now - lastFetchTime < CACHE_DURATION
      ) {
        // Return cached data
        return {
          artworks: state.arts.artworks,
          pagination: state.arts.pagination,
          fromCache: true,
        };
      }

      const response = await fetchData<GetUserArtResponse>(
        ENDPOINTS.GetArtForUser,
        { page, limit: 20 },
      );

      // The response structure: response.data = { artworks, pagination }
      const artworksData = response?.data.data || {};

      return {
        artworks: artworksData?.artworks || [],
        pagination: artworksData?.pagination || {
          page,
          limit: 20,
          total: 0,
        },
        fromCache: false,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch arts");
    }
  },
);

const ArtsSlice = createSlice({
  name: "arts",
  initialState,
  reducers: {
    clearArts: (state) => {
      state.artworks = [];
      state.lastFetchTime = null;
      state.error = null;
    },
    setArtworks: (state, action: PayloadAction<Artwork[]>) => {
      state.artworks = action.payload;
      state.lastFetchTime = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArts.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.fromCache) {
          state.artworks = action.payload.artworks;
          state.pagination = action.payload.pagination;
          state.lastFetchTime = Date.now();
          state.hasMore =
            action.payload.pagination.page <
            Math.ceil(
              action.payload.pagination.total / action.payload.pagination.limit,
            );
        }
      })
      .addCase(fetchArts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearArts, setArtworks } = ArtsSlice.actions;
export default ArtsSlice.reducer;
