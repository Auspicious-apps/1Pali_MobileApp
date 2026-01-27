import { createSlice } from "@reduxjs/toolkit";
import { Badges, GrowthBadge } from "../../service/ApiResponses/GetUserProfile";

interface CollectBadgesState {
  isVisible: boolean;
  collectibleBadges?: any[];
}

const initialState: CollectBadgesState = {
  isVisible: false,
  collectibleBadges: [],
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
    setCollectibleBadges: (
      state,
      action: {
        payload: {
          growthBadges: GrowthBadge[];
          artBadges: any[];
          impactBadges: any[];
        };
      },
    ) => {
      const list: any[] = [];

      action.payload.growthBadges.forEach((badge) => {
        if (badge.isClaimed === false) {
          list.push(badge);
        }
      });
      action.payload.artBadges.forEach((badge) => {
        if (badge.isClaimed === false) {
          list.push(badge);
        }
      });
      action.payload.impactBadges.forEach((badge) => {
        if (badge.isClaimed === false) {
          list.push(badge);
        }
      });

      state.collectibleBadges = list;
    },
    removeClaimedBadges: (state, action: { payload: string }) => {
      state.collectibleBadges = state.collectibleBadges?.filter(
        (badge) => badge.id !== action.payload,
      );
    },
  },
});

export const {
  openCollectBadgesModal,
  closeCollectBadgesModal,
  setCollectibleBadges,
  removeClaimedBadges,
} = CollectBadgesSlice.actions;

export default CollectBadgesSlice.reducer;
