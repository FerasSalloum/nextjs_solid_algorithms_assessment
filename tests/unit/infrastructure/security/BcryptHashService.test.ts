import { describe, it, expect, beforeEach } from "vitest";
import { BcryptHashService } from "../../../../src/infrastructure/security/BcryptHashService";

describe("BcryptHashService_Unit_Tests", () => {
  let hashService: BcryptHashService;

  beforeEach(() => {
    hashService = new BcryptHashService();
  });

  describe("hash", () => {
    it("يجب أن ينشئ نصاً مشفراً يختلف عن النص الأصلي", async () => {
      const plainText = "Password123!";
      const hashedPassword = await hashService.hash(plainText);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainText);
      expect(typeof hashedPassword).toBe("string");
    });

    it("انشاء رموز تشفير مختلفة لنفس كلمة المرور بسبب عدد دورات التشير", async () => {
      const plainText = "Password123!";

      const hash1 = await hashService.hash(plainText);
      const hash2 = await hashService.hash(plainText);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("compare", () => {
    it("كلمة المرور متطابقة مع التشفير", async () => {
      const plainText = "Password123!";
      const hashedPassword = await hashService.hash(plainText);

      const isMatch = await hashService.compare(plainText, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it("كلمة المرور غير متطابقة مع اتشفير", async () => {
      const plainText = "Password123!";
      const wrongText = "WrongPassword123!";
      const hashedPassword = await hashService.hash(plainText);

      const isMatch = await hashService.compare(wrongText, hashedPassword);

      expect(isMatch).toBe(false);
    });
  });
});
