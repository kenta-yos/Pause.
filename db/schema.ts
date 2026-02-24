import { pgTable, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";

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
