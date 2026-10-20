import { describe, expect, it } from "vitest";
import { BlockedImageError, fetchPublicImage, isPublicAddress } from "./image-proxy";

describe("isPublicAddress", () => {
  it("allows public addresses", () => {
    for (const address of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])
      expect(isPublicAddress(address), address).toBe(true);
  });

  it("blocks internal, metadata and mapped addresses", () => {
    for (const address of [
      "127.0.0.1",
      "10.1.2.3",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "0.0.0.0",
      "255.255.255.255",
      "::1",
      "::",
      "fd00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
      "::ffff:a9fe:a9fe",
      "not-an-ip"
    ]) {
      expect(isPublicAddress(address), address).toBe(false);
    }
  });
});

describe("fetchPublicImage", () => {
  const signal = () => AbortSignal.timeout(2000);

  it("refuses internal IP literals, internal hostnames and other protocols", async () => {
    for (const url of [
      "http://127.0.0.1/",
      "http://[::1]/",
      "http://169.254.169.254/latest",
      "http://localhost/",
      "file:///etc/passwd"
    ]) {
      await expect(fetchPublicImage(new URL(url), signal()), url).rejects.toBeInstanceOf(BlockedImageError);
    }
  });
});
