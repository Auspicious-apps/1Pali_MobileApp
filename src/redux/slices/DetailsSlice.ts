import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { GetArtByIdResponse } from "../../service/ApiResponses/GetArtById";
import { GetBlogByIdResponse } from "../../service/ApiResponses/GetBlogById";
import { fetchData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";

interface CachedDetail<T> {
  data: T;
  timestamp: number;
}

interface DetailsState {
  artDetails: {
    [artId: string]: CachedDetail<GetArtByIdResponse>;
  };
  blogDetails: {
    [blogId: string]: CachedDetail<GetBlogByIdResponse>;
  };
  loadingArt: { [artId: string]: boolean };
  loadingBlog: { [blogId: string]: boolean };
  errorArt: { [artId: string]: string | null };
  errorBlog: { [blogId: string]: string | null };
}

const initialState: DetailsState = {
  artDetails: {},
  blogDetails: {},
  loadingArt: {},
  loadingBlog: {},
  errorArt: {},
  errorBlog: {},
};

// Cache duration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Fetch and cache art details by art ID
 * Will use cached data if available and fresh (within CACHE_DURATION)
 */
export const fetchArtDetails = createAsyncThunk(
  "details/fetchArtDetails",
  async (
    {
      artId,
      forceRefresh = false,
    }: { artId: string; forceRefresh?: boolean },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as any;
      const cachedDetail = state.details.artDetails[artId];
      const now = Date.now();

      // Check if we have valid cached data
      if (
        !forceRefresh &&
        cachedDetail &&
        now - cachedDetail.timestamp < CACHE_DURATION
      ) {
        return {
          artId,
          data: cachedDetail.data,
          fromCache: true,
        };
      }

      // Fetch fresh data
      const response = await fetchData<GetArtByIdResponse>(
        `${ENDPOINTS.GetArtById}/${artId}`,
      );

      if (response?.data?.success) {
        return {
          artId,
          data: response.data.data,
          fromCache: false,
        };
      }

      return rejectWithValue("Failed to fetch art details");
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch art details");
    }
  },
);

/**
 * Fetch and cache blog details by blog ID
 * Will use cached data if available and fresh (within CACHE_DURATION)
 */
export const fetchBlogDetails = createAsyncThunk(
  "details/fetchBlogDetails",
  async (
    {
      blogId,
      forceRefresh = false,
    }: { blogId: string; forceRefresh?: boolean },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as any;
      const cachedDetail = state.details.blogDetails[blogId];
      const now = Date.now();

      // Check if we have valid cached data
      if (
        !forceRefresh &&
        cachedDetail &&
        now - cachedDetail.timestamp < CACHE_DURATION
      ) {
        return {
          blogId,
          data: cachedDetail.data,
          fromCache: true,
        };
      }

      // Fetch fresh data
      const response = await fetchData<GetBlogByIdResponse>(
        `${ENDPOINTS.GetBlogById}/${blogId}`,
      );

      if (response?.data?.success) {
        return {
          blogId,
          data: response.data.data,
          fromCache: false,
        };
      }

      return rejectWithValue("Failed to fetch blog details");
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch blog details");
    }
  },
);

const DetailsSlice = createSlice({
  name: "details",
  initialState,
  reducers: {
    clearArtCache: (state, action: PayloadAction<string>) => {
      const artId = action.payload;
      delete state.artDetails[artId];
      delete state.loadingArt[artId];
      delete state.errorArt[artId];
    },
    clearBlogCache: (state, action: PayloadAction<string>) => {
      const blogId = action.payload;
      delete state.blogDetails[blogId];
      delete state.loadingBlog[blogId];
      delete state.errorBlog[blogId];
    },
    clearAllCache: (state) => {
      state.artDetails = {};
      state.blogDetails = {};
      state.loadingArt = {};
      state.loadingBlog = {};
      state.errorArt = {};
      state.errorBlog = {};
    },
    updateArtDetail: (
      state,
      action: PayloadAction<{ artId: string; data: GetArtByIdResponse }>,
    ) => {
      const { artId, data } = action.payload;
      state.artDetails[artId] = {
        data,
        timestamp: Date.now(),
      };
    },
    updateBlogDetail: (
      state,
      action: PayloadAction<{ blogId: string; data: GetBlogByIdResponse }>,
    ) => {
      const { blogId, data } = action.payload;
      state.blogDetails[blogId] = {
        data,
        timestamp: Date.now(),
      };
    },
  },
  extraReducers: (builder) => {
    // Art Details
    builder
      .addCase(fetchArtDetails.pending, (state, action) => {
        const artId = (action.meta.arg as any).artId;
        state.loadingArt[artId] = true;
        state.errorArt[artId] = null;
      })
      .addCase(fetchArtDetails.fulfilled, (state, action) => {
        const { artId, data } = action.payload;
        state.artDetails[artId] = {
          data,
          timestamp: Date.now(),
        };
        state.loadingArt[artId] = false;
      })
      .addCase(fetchArtDetails.rejected, (state, action) => {
        const artId = (action.meta.arg as any).artId;
        state.loadingArt[artId] = false;
        state.errorArt[artId] = action.payload as string;
      });

    // Blog Details
    builder
      .addCase(fetchBlogDetails.pending, (state, action) => {
        const blogId = (action.meta.arg as any).blogId;
        state.loadingBlog[blogId] = true;
        state.errorBlog[blogId] = null;
      })
      .addCase(fetchBlogDetails.fulfilled, (state, action) => {
        const { blogId, data } = action.payload;
        state.blogDetails[blogId] = {
          data,
          timestamp: Date.now(),
        };
        state.loadingBlog[blogId] = false;
      })
      .addCase(fetchBlogDetails.rejected, (state, action) => {
        const blogId = (action.meta.arg as any).blogId;
        state.loadingBlog[blogId] = false;
        state.errorBlog[blogId] = action.payload as string;
      });
  },
});

export const {
  clearArtCache,
  clearBlogCache,
  clearAllCache,
  updateArtDetail,
  updateBlogDetail,
} = DetailsSlice.actions;

export default DetailsSlice.reducer;
