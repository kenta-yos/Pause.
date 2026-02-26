import {
  pgTable,
  varchar,
  integer,
  timestamp,
  index,
  serial,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Rate limiting only - NO user content is ever stored
export const rateLimits = pgTable(
  "rate_limits",
  {
    ipHash: varchar("ip_hash", { length: 64 }).notNull(),
    count: integer("count").notNull().default(0),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  },
  (table) => [index("rate_limits_ip_hash_idx").on(table.ipHash)]
);

// --- v2: Person-centric tables ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  nickname: varchar("nickname", { length: 100 }).notNull(),
  ageGroup: varchar("age_group", { length: 50 }),
  lifeContext: text("life_context"),
  values: text("values"),
  infoSources: text("info_sources"),
  relationship: varchar("relationship", { length: 100 }),
  dialoguePattern: text("dialogue_pattern"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const targetInsights = pgTable("target_insights", {
  id: serial("id").primaryKey(),
  targetId: integer("target_id").notNull().references(() => targets.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dialogueHistory = pgTable(
  "dialogue_history",
  {
    id: serial("id").primaryKey(),
    targetId: integer("target_id").notNull().references(() => targets.id, { onDelete: "cascade" }),
    claim: text("claim").notNull(),
    output: jsonb("output").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("dialogue_history_target_id_idx").on(table.targetId)]
);

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  targets: many(targets),
}));

export const targetsRelations = relations(targets, ({ one, many }) => ({
  user: one(users, { fields: [targets.userId], references: [users.id] }),
  insights: many(targetInsights),
  dialogueHistory: many(dialogueHistory),
}));

export const targetInsightsRelations = relations(targetInsights, ({ one }) => ({
  target: one(targets, { fields: [targetInsights.targetId], references: [targets.id] }),
}));

export const dialogueHistoryRelations = relations(dialogueHistory, ({ one }) => ({
  target: one(targets, { fields: [dialogueHistory.targetId], references: [targets.id] }),
}));
