import { describe, it, expect } from "vitest";
import { redeemableAmount } from "@/server/services/giftcard";

describe("gift card redemption", () => {
  it("covers up to the payable amount", () => {
    expect(redeemableAmount(50000, 120000)).toBe(50000); // balance < payable
    expect(redeemableAmount(200000, 120000)).toBe(120000); // balance > payable → cap at payable
  });
  it("never goes negative", () => {
    expect(redeemableAmount(0, 100000)).toBe(0);
    expect(redeemableAmount(50000, 0)).toBe(0);
  });
});
