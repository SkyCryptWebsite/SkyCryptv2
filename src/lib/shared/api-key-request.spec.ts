import { describe, expect, it } from "vitest";
import { apiKeyRequestSchema } from "./api-key-request";

const valid = {
  name: "My Bot",
  useCase: "discord-bot",
  url: "https://github.com/example",
  description: "Shows SkyBlock networth for members of my guild.",
  acceptTerms: true,
  _captchaToken: "token"
};

describe("apiKeyRequestSchema", () => {
  it("accepts a complete request", () => {
    expect(apiKeyRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("requires the terms checkbox, which is omitted when unchecked", () => {
    const { acceptTerms: _, ...unchecked } = valid;
    expect(apiKeyRequestSchema.safeParse(unchecked).error?.issues[0]?.path).toEqual(["acceptTerms"]);
  });

  it("rejects non-web links", () => {
    expect(apiKeyRequestSchema.safeParse({ ...valid, url: "javascript:alert(1)" }).success).toBe(false);
  });
});
