import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);
export const releaseEnvironmentEnum = pgEnum("release_environment", ["staging", "production"]);
export const releaseRiskLevelEnum = pgEnum("release_risk_level", ["low", "medium", "high"]);
export const releaseStatusEnum = pgEnum("release_status", ["pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tasksTable = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const releaseRequestsTable = pgTable("release_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceName: text("service_name").notNull(),
  version: text("version").notNull(),
  environment: releaseEnvironmentEnum("environment").notNull(),
  riskLevel: releaseRiskLevelEnum("risk_level").notNull().default("medium"),
  changelog: text("changelog").notNull(),
  status: releaseStatusEnum("status").notNull().default("pending"),
  requestedByEmail: text("requested_by_email").notNull(),
  reviewedByEmail: text("reviewed_by_email"),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});
