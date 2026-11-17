import { Injectable, type OnModuleInit } from "@nestjs/common";
import type { UserRole } from "@repo/contracts";
import type { PasswordHasher } from "./password-hasher.js";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");

export interface UsersRepository {
  findByEmail(email: string): Promise<StoredUser | null>;
}

export const DEMO_ADMIN_EMAIL = "admin@example.com";
export const DEMO_ADMIN_PASSWORD = "AdminPassword123!";

@Injectable()
export class InMemoryUsersRepository implements UsersRepository, OnModuleInit {
  private readonly byEmail = new Map<string, StoredUser>();

  constructor(private readonly hasher: PasswordHasher) {}

  async onModuleInit(): Promise<void> {
    await this.seedDemoAdmin();
  }

  async seedDemoAdmin(): Promise<void> {
    if (this.byEmail.has(DEMO_ADMIN_EMAIL)) return;
    const passwordHash = await this.hasher.hash(DEMO_ADMIN_PASSWORD);
    this.byEmail.set(DEMO_ADMIN_EMAIL, {
      id: "00000000-0000-4000-8000-000000000001",
      email: DEMO_ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    });
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.byEmail.get(email.toLowerCase()) ?? null;
  }
}
