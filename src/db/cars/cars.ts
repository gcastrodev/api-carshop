import { 
    integer, 
    numeric, 
    pgTable, 
    timestamp, 
    uuid, 
    varchar 
} from "drizzle-orm/pg-core";

export const cars = pgTable("cars", {
    id: uuid("id").defaultRandom().primaryKey(),
    brand: varchar("brand", { length: 80 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    version: varchar("version", { length: 120 }),
    year: integer("year").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    fuel: varchar("fuel", { length: 30 }),
    transmission: varchar("transmission", { length: 30 }),
    mileage: integer("mileage"),
    imageUrl: varchar("image_url", { length: 2048 }),
    createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}); 