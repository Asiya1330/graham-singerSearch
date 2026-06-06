import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, integer, boolean, timestamp, json, jsonb, index, uniqueIndex, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const repertoireReference = pgTable("repertoire_reference", {
  id: text("id").primaryKey(),
  work_title: text("work_title").notNull(),
  composer: text("composer"),
  part_name: text("part_name").notNull(),
  voice_type_primary: text("voice_type_primary"),
  specialization: text("specialization"),
  part_tier: text("part_tier"),
  category: text("category"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  workTitleIdx: index("repertoire_work_title_idx").on(table.work_title),
  partNameIdx: index("repertoire_part_name_idx").on(table.part_name),
  categoryIdx: index("repertoire_category_idx").on(table.category),
}));

export type RepertoireReference = typeof repertoireReference.$inferSelect;

export const singers = pgTable("singers", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  primary_voice_type: text("primary_voice_type"),
  primary_fach: text("primary_fach"),
  union_status: text("union_status"),
  represented: boolean("represented").default(false),
  agent_name: text("agent_name"),
  agent_email: text("agent_email"),
  website_url: text("website_url"),
  short_bio: text("short_bio"),
  headshot_url: text("headshot_url"),
  resume_url: text("resume_url"),
  video_link_1: text("video_link_1"),
  video_link_2: text("video_link_2"),
  audio_link_1: text("audio_link_1"),
  companies_worked_with: text("companies_worked_with").array(),
  languages_sung: text("languages_sung").array(),
  subscription_status: text("subscription_status").default("active"),
  subscription_tier: text("subscription_tier").default("free"),
  admin_approved: boolean("admin_approved").default(false),
  admin_rejected: boolean("admin_rejected").default(false),
  pro_expires_at: timestamp("pro_expires_at", { mode: "date" }),
  founding_artist: boolean("founding_artist").default(false),
  is_gifted: boolean("is_gifted").default(false),
  emergency_opt_in: boolean("emergency_opt_in").default(false),
  emergency_lead_time_hours: integer("emergency_lead_time_hours"),
  emergency_travel_radius_miles: integer("emergency_travel_radius_miles"),
  emergency_travel_modes: text("emergency_travel_modes").array(),
  emergency_notes: text("emergency_notes"),
  languages_spoken: text("languages_spoken").array(),
  performance_types: text("performance_types").array(),
  founding_expires_at: timestamp("founding_expires_at", { mode: "date" }),
  viewed_count: integer("viewed_count").default(0),
  is_trending: boolean("is_trending").default(false),
  is_managed: boolean("is_managed").default(false),
  manager_name: text("manager_name"),
  manager_email: text("manager_email"),
  manager_phone: text("manager_phone"),
  reliability_score: integer("reliability_score").default(0),
  total_gigs: integer("total_gigs").default(0),
  is_pro_verified: boolean("is_pro_verified").default(false),
  is_emergency_ready: boolean("is_emergency_ready").default(false),
  is_management_verified: boolean("is_management_verified").default(false),
  last_updated: timestamp("last_updated", { mode: "date" }),
  confidence_tier: integer("confidence_tier").default(1),
  confidence_points: integer("confidence_points").default(0),
  emergency_status_requested: boolean("emergency_status_requested").default(false),
  flagged_for_review: boolean("flagged_for_review").default(false),
  approval_seen: boolean("approval_seen").default(false),
  admin_notes: text("admin_notes"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  approvedIdx: index("singers_admin_approved_idx").on(table.admin_approved),
  subscriptionIdx: index("singers_subscription_status_idx").on(table.subscription_status),
  voiceTypeIdx: index("singers_voice_type_idx").on(table.primary_voice_type),
  unionIdx: index("singers_union_status_idx").on(table.union_status),
  representedIdx: index("singers_represented_idx").on(table.represented),
  emergencyIdx: index("singers_emergency_opt_in_idx").on(table.emergency_opt_in),
  createdIdx: index("singers_created_at_idx").on(table.created_at),
}));

export const insertSingerSchema = createInsertSchema(singers).omit({
  id: true,
  created_at: true,
  viewed_count: true,
  is_trending: true,
  admin_approved: true,
  admin_rejected: true,
  pro_expires_at: true,
  founding_artist: true,
  is_gifted: true,
});

export type InsertSinger = z.infer<typeof insertSingerSchema>;
export type Singer = typeof singers.$inferSelect;

export const singerRoles = pgTable("singer_roles", {
  id: serial("id").primaryKey(),
  singer_id: integer("singer_id").references(() => singers.id).notNull(),
  role_name: text("role_name").notNull(),
  work_title: text("work_title").notNull(),
  composer: text("composer").notNull(),
  languages: text("languages").array(),
  performance_types: text("performance_types").array(),
  experience_depth: text("experience_depth"),
  last_performed_date: text("last_performed_date"),
  notable_companies: text("notable_companies").array(),
  status: text("status").notNull().default("performed"),
}, (table) => ({
  singerIdx: index("singer_roles_singer_id_idx").on(table.singer_id),
  composerIdx: index("singer_roles_composer_idx").on(table.composer),
  roleNameIdx: index("singer_roles_role_name_idx").on(table.role_name),
  workTitleIdx: index("singer_roles_work_title_idx").on(table.work_title),
  statusIdx: index("singer_roles_status_idx").on(table.status),
}));

export const insertSingerRoleSchema = createInsertSchema(singerRoles).omit({
  id: true,
});

export type InsertSingerRole = z.infer<typeof insertSingerRoleSchema>;
export type SingerRole = typeof singerRoles.$inferSelect;

export const singerWorks = pgTable("singer_works", {
  id: serial("id").primaryKey(),
  singer_id: integer("singer_id").references(() => singers.id).notNull(),
  work_title: text("work_title").notNull(),
  composer: text("composer").notNull(),
  part_name: text("part_name"),
  context: text("context"),
  languages: text("languages").array(),
  experience_depth: text("experience_depth"),
  last_performed_date: text("last_performed_date"),
  notable_ensembles: text("notable_ensembles").array().default(sql`'{}'`),
  status: text("status").notNull().default("performed"),
}, (table) => ({
  singerIdx: index("singer_works_singer_id_idx").on(table.singer_id),
  composerIdx: index("singer_works_composer_idx").on(table.composer),
  workTitleIdx: index("singer_works_work_title_idx").on(table.work_title),
  partNameIdx: index("singer_works_part_name_idx").on(table.part_name),
  statusIdx: index("singer_works_status_idx").on(table.status),
}));

export const insertSingerWorkSchema = createInsertSchema(singerWorks).omit({
  id: true,
});

export type InsertSingerWork = z.infer<typeof insertSingerWorkSchema>;
export type SingerWork = typeof singerWorks.$inferSelect;

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  organization_name: text("organization_name").notNull(),
  organization_type: text("organization_type"),
  website_url: text("website_url"),
  city: text("city"),
  state: text("state"),
  verified: boolean("verified").default(false),
  admin_approved: boolean("admin_approved").default(false),
  subscription_tier: text("subscription_tier").default("free"),
  contact_reveal_limit: integer("contact_reveal_limit").default(3),
  contact_reveals_used_this_month: integer("contact_reveals_used_this_month").default(0),
  login_count: integer("login_count").default(0),
  contact_person_name: text("contact_person_name"),
  contact_person_email: text("contact_person_email"),
  admin_notes: text("admin_notes"),
  pro_expires_at: timestamp("pro_expires_at", { mode: "date" }),
  founding_org: boolean("founding_org").default(false),
  is_gifted: boolean("is_gifted").default(false),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  emailIdx: index("organizations_email_idx").on(table.email),
  subscriptionIdx: index("organizations_subscription_tier_idx").on(table.subscription_tier),
  approvedIdx: index("organizations_admin_approved_idx").on(table.admin_approved),
}));

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  created_at: true,
  admin_approved: true,
  verified: true,
  contact_reveals_used_this_month: true,
  admin_notes: true,
  pro_expires_at: true,
  founding_org: true,
  is_gifted: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  singer_id: integer("singer_id").references(() => singers.id).notNull(),
  start_date: text("start_date").notNull(),
  end_date: text("end_date").notNull(),
  geographic_radius: text("geographic_radius"),
  status: text("status").default("active"),
  expires_at: timestamp("expires_at", { mode: "date" }),
}, (table) => ({
  singerIdx: index("availabilities_singer_id_idx").on(table.singer_id),
  startDateIdx: index("availabilities_start_date_idx").on(table.start_date),
  endDateIdx: index("availabilities_end_date_idx").on(table.end_date),
  statusIdx: index("availabilities_status_idx").on(table.status),
}));

export const insertAvailabilitySchema = createInsertSchema(availabilities).omit({
  id: true,
});

export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availabilities.$inferSelect;

export const contactReveals = pgTable("contact_reveals", {
  id: serial("id").primaryKey(),
  org_id: integer("org_id").references(() => organizations.id).notNull(),
  singer_id: integer("singer_id").references(() => singers.id).notNull(),
  revealed_at: timestamp("revealed_at", { mode: "date" }).defaultNow(),
  is_emergency: boolean("is_emergency").default(false),
  credits_used: integer("credits_used").default(1),
}, (table) => ({
  orgIdx: index("contact_reveals_org_id_idx").on(table.org_id),
  singerIdx: index("contact_reveals_singer_id_idx").on(table.singer_id),
  revealedIdx: index("contact_reveals_revealed_at_idx").on(table.revealed_at),
}));

export const insertContactRevealSchema = createInsertSchema(contactReveals).omit({
  id: true,
  revealed_at: true,
});

export type InsertContactReveal = z.infer<typeof insertContactRevealSchema>;
export type ContactReveal = typeof contactReveals.$inferSelect;

export const shortlists = pgTable("shortlists", {
  id: serial("id").primaryKey(),
  org_id: integer("org_id").references(() => organizations.id).notNull(),
  singer_id: integer("singer_id").references(() => singers.id).notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  orgIdx: index("shortlists_org_id_idx").on(table.org_id),
  singerIdx: index("shortlists_singer_id_idx").on(table.singer_id),
  uniqueOrgSinger: uniqueIndex("shortlists_unique_org_singer_idx").on(table.org_id, table.singer_id),
}));

export const insertShortlistSchema = createInsertSchema(shortlists).omit({
  id: true,
  created_at: true,
});

export type InsertShortlist = z.infer<typeof insertShortlistSchema>;
export type Shortlist = typeof shortlists.$inferSelect;

export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  org_id: integer("org_id"),
  search_filters: jsonb("search_filters"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export type SearchLog = typeof searchLogs.$inferSelect;

export const engagementFeedback = pgTable("engagement_feedback", {
  id: serial("id").primaryKey(),
  singer_id: integer("singer_id").references(() => singers.id).notNull(),
  org_id: integer("org_id").references(() => organizations.id).notNull(),
  role_name: text("role_name").notNull(),
  engagement_date: text("engagement_date").notNull(),
  was_prepared: boolean("was_prepared").default(false),
  was_professional: boolean("was_professional").default(false),
  was_accurate: boolean("was_accurate").default(false),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  singerIdx: index("engagement_feedback_singer_id_idx").on(table.singer_id),
  orgIdx: index("engagement_feedback_org_id_idx").on(table.org_id),
  uniqueSingerOrgDate: uniqueIndex("unique_singer_org_date_idx").on(table.singer_id, table.org_id, table.engagement_date),
}));

export const insertEngagementFeedbackSchema = createInsertSchema(engagementFeedback).omit({
  id: true,
  created_at: true,
});

export type InsertEngagementFeedback = z.infer<typeof insertEngagementFeedbackSchema>;
export type EngagementFeedback = typeof engagementFeedback.$inferSelect;

export const creditAdjustments = pgTable("credit_adjustments", {
  id: serial("id").primaryKey(),
  org_id: integer("org_id").references(() => organizations.id).notNull(),
  admin_action: text("admin_action").notNull(),
  amount: integer("amount").notNull(),
  previous_balance: integer("previous_balance").notNull(),
  new_balance: integer("new_balance").notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  orgIdx: index("credit_adjustments_org_id_idx").on(table.org_id),
}));

export type CreditAdjustment = typeof creditAdjustments.$inferSelect;

export const adminGifts = pgTable("admin_gifts", {
  id: serial("id").primaryKey(),
  recipient_type: text("recipient_type").notNull(),
  recipient_id: integer("recipient_id").notNull(),
  gifted_by: text("gifted_by").notNull().default("admin"),
  duration_days: integer("duration_days").notNull(),
  expires_at: timestamp("expires_at", { mode: "date" }).notNull(),
  reason: text("reason"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
}, (table) => ({
  recipientIdx: index("admin_gifts_recipient_idx").on(table.recipient_type, table.recipient_id),
}));

export type AdminGift = typeof adminGifts.$inferSelect;

export const repertoireSuggestions = pgTable("repertoire_suggestions", {
  id: serial("id").primaryKey(),
  singer_id: integer("singer_id").notNull().references(() => singers.id, { onDelete: "cascade" }),
  work_title: text("work_title").notNull(),
  composer: text("composer"),
  role_name: text("role_name"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const insertRepertoireSuggestionSchema = createInsertSchema(repertoireSuggestions).omit({
  id: true,
  singer_id: true,
  status: true,
  created_at: true,
});

export type InsertRepertoireSuggestion = z.infer<typeof insertRepertoireSuggestionSchema>;
export type RepertoireSuggestion = typeof repertoireSuggestions.$inferSelect;

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true, mode: "date" }).notNull(),
});
