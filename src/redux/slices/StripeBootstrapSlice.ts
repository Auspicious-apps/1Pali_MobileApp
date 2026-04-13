import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StripeMode = "live" | "test";

type StripeBootstrapState = {
  mode: StripeMode | null;
  publishableKey: string | null;
  productId: string | null;
};

const initialState: StripeBootstrapState = {
  mode: null,
  publishableKey: null,
  productId: null,
};

const stripeBootstrapSlice = createSlice({
  name: "stripeBootstrap",
  initialState,
  reducers: {
    setStripeBootstrap: (
      state,
      action: PayloadAction<{
        mode: StripeMode;
        publishableKey: string;
        productId: string;
      }>,
    ) => {
      state.mode = action.payload.mode;
      state.publishableKey = action.payload.publishableKey;
      state.productId = action.payload.productId;
    },
    clearStripeBootstrap: (state) => {
      state.mode = null;
      state.publishableKey = null;
      state.productId = null;
    },
  },
});

export const { setStripeBootstrap, clearStripeBootstrap } =
  stripeBootstrapSlice.actions;
export default stripeBootstrapSlice.reducer;

