import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Blog,
  GetUserBlogsResponse,
} from "../../service/ApiResponses/GetUserBlogs";
import { fetchData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";

interface UpdatesState {
  blogs: Blog[];
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

const initialState: UpdatesState = {
  blogs: [],
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

// Async thunk for fetching updates (blogs) with caching
export const fetchUpdates = createAsyncThunk(
  "updates/fetchUpdates",
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
      const lastFetchTime = state.updates.lastFetchTime;
      const now = Date.now();
      const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

      if (
        !forceRefresh &&
        lastFetchTime &&
        now - lastFetchTime < CACHE_DURATION
      ) {
        // Return cached data
        return {
          blogs: state.updates.blogs,
          pagination: state.updates.pagination,
          fromCache: true,
        };
      }

      const response = await fetchData<GetUserBlogsResponse>(
        ENDPOINTS.GetBlogForUser,
      );

      // The response structure: response.data = { blogs, pagination }
      const blogsData = response?.data.data || {};

      return {
        blogs: blogsData?.blogs || [],
        pagination: blogsData?.pagination || {
          page,
          limit: 20,
          total: 0,
        },
        fromCache: false,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch updates");
    }
  },
);

const UpdatesSlice = createSlice({
  name: "updates",
  initialState,
  reducers: {
    clearUpdates: (state) => {
      state.blogs = [];
      state.lastFetchTime = null;
      state.error = null;
    },
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = action.payload;
      state.lastFetchTime = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdates.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.fromCache) {
          state.blogs = action.payload.blogs;
          state.pagination = action.payload.pagination;
          state.lastFetchTime = Date.now();
          state.hasMore =
            action.payload.pagination.page <
            Math.ceil(
              action.payload.pagination.total / action.payload.pagination.limit,
            );
        }
      })
      .addCase(fetchUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUpdates, setBlogs } = UpdatesSlice.actions;
export default UpdatesSlice.reducer;
