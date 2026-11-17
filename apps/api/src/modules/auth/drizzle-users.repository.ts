import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../../infra/db/database.module.js";
import { usersTable } from "../../infra/db/schema.js";
import type { StoredUser, UsersRepository } from "./users.repository.js";

export class DrizzleUsersRepository implements UsersRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    const [row] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
    };
  }
}
