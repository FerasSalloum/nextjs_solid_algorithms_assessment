import { SignJWT, jwtVerify } from "jose";
import { ITokenService, ITokenPayload } from "../../domain/interfaces/ITokenService";

export class JwtTokenService implements ITokenService {
  private readonly secretKey: Uint8Array;

  constructor() {
    const secret = process.env.JWT_SECRET || "default_fallback_secret_for_dev";
    // تحويل مفتاح السر إلى Uint8Array متوافق مع Web Crypto API
    this.secretKey = new TextEncoder().encode(secret);
  }

  async generateToken(payload: ITokenPayload, expiresIn: string = "7d"): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiresIn)
      .sign(this.secretKey);
  }

  async verifyToken(token: string): Promise<ITokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      return payload as unknown as ITokenPayload;
    } catch {
      return null;
    }
  }
}