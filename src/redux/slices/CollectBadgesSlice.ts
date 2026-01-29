import { createSlice } from "@reduxjs/toolkit";

interface CollectBadgesState {
  isVisible: boolean;
}

const initialState: CollectBadgesState = {
  isVisible: false,
};

const CollectBadgesSlice = createSlice({
  name: "collectBadges",
  initialState,
  reducers: {
    openCollectBadgesModal: (state) => {
      state.isVisible = true;
    },
    closeCollectBadgesModal: (state) => {
      state.isVisible = false;
    },
  },
});

export const { openCollectBadgesModal, closeCollectBadgesModal } =
  CollectBadgesSlice.actions;

export default CollectBadgesSlice.reducer;
