// Type for v1/numbers/reserve/:number response
export type ReserveSpecificNumberResponse = {
number: number;
reservationToken: string;
expiresAt: string;
expiresInMs: number;
};
