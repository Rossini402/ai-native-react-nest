import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Injectable } from "@nestjs/common";

const scryptAsync = promisify(scryptCallback);
const KEY_LENGTH = 64;

@Injectable()
export class PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scryptAsync(plainPassword, salt, KEY_LENGTH)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  async verify(plainPassword: string, storedHash: string): Promise<boolean> {
    const [salt, keyHex] = storedHash.split(":");
    if (!salt || !keyHex) return false;

    const storedBuf = Buffer.from(keyHex, "hex");
    const derived = (await scryptAsync(plainPassword, salt, KEY_LENGTH)) as Buffer;
    if (storedBuf.length !== derived.length) return false;
    return timingSafeEqual(storedBuf, derived);
  }
}
