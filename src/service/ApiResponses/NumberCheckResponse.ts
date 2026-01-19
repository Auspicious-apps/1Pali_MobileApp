// Type for v1/numbers/check/:number response
export type NumberCheckResponse = {
number: number;
isAvailable: boolean;
isLocked: boolean;
isClaimed: boolean;
};
