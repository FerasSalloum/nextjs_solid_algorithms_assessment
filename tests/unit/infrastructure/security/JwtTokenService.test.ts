import { describe, it, expect, beforeEach } from "vitest";
import { JwtTokenService } from "../../../../src/infrastructure/security/JwtTokenService";
import { Role } from "@prisma/client";

describe("JwtTokenService_Unit_Tests", () => {
  let tokenService: JwtTokenService;

  const mockPayload = {
    userId: "user-123",
    email: "test@example.com",
    name: "user",
    role: Role.MEMBER,
  };

  beforeEach(() => {
    tokenService = new JwtTokenService();
  });

  describe("generateToken", () => {
    it("انشاء JWT والتاكد مناحتوائة على كافة المعلومات", async () => {
      const token = await tokenService.generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verifyToken", () => {
    it("فك التشفير و المطابقة مع البيانات", async () => {
      const token = await tokenService.generateToken(mockPayload);
      const decoded = await tokenService.verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.name).toBe(mockPayload.name);
      expect(decoded?.role).toBe(mockPayload.role);
    });

    it("يرجع قيمة فارغة عند تلف التوكين او تزويره", async () => {
      const invalidToken = "invalid.jwt.token.string";
      const result = await tokenService.verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it("يرجع قيمة فارغة عند انتهاء صلاحية التوكين", async () => {

      const expiredToken = await tokenService.generateToken(mockPayload, "-1s");
      const result = await tokenService.verifyToken(expiredToken);

      expect(result).toBeNull();
    });
  });
});
