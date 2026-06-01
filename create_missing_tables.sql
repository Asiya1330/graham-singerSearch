-- =====================================================================
-- SingerSearch.net — create missing tables in production
-- Generated to match shared/schema.ts (Drizzle ORM definitions).
--
-- Safe to run repeatedly: every CREATE uses IF NOT EXISTS.
-- This file does NOT modify or drop existing tables. If a table already
-- exists with a different shape, this file will leave it alone — verify
-- columns match shared/schema.ts manually in that case.
--
-- Covers: repertoire_reference, contact_reveals, search_logs,
--         engagement_feedback, credit_adjustments, admin_gifts, sessions.
-- Also re-declares singers / singer_roles / singer_works / organizations /
-- availabilities under IF NOT EXISTS as a no-op safety net.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- repertoire_reference
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repertoire_reference (
  id                   text PRIMARY KEY,
  work_title           text NOT NULL,
  composer             text,
  part_name            text NOT NULL,
  voice_type_primary   text,
  specialization       text,
  part_tier            text,
  category             text,
  created_at           timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS repertoire_work_title_idx ON repertoire_reference (work_title);
CREATE INDEX IF NOT EXISTS repertoire_part_name_idx  ON repertoire_reference (part_name);
CREATE INDEX IF NOT EXISTS repertoire_category_idx   ON repertoire_reference (category);

-- ---------------------------------------------------------------------
-- singers (safety net — table already exists in prod)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS singers (
  id                              serial PRIMARY KEY,
  email                           text UNIQUE NOT NULL,
  password                        text NOT NULL,
  first_name                      text NOT NULL,
  last_name                       text NOT NULL,
  city                            text,
  state                           text,
  zip                             text,
  primary_voice_type              text,
  primary_fach                    text,
  union_status                    text,
  represented                     boolean DEFAULT false,
  agent_name                      text,
  agent_email                     text,
  website_url                     text,
  short_bio                       text,
  headshot_url                    text,
  resume_url                      text,
  companies_worked_with           text[],
  languages_sung                  text[],
  subscription_status             text DEFAULT 'active',
  subscription_tier               text DEFAULT 'free',
  admin_approved                  boolean DEFAULT false,
  admin_rejected                  boolean DEFAULT false,
  pro_expires_at                  timestamp,
  founding_artist                 boolean DEFAULT false,
  is_gifted                       boolean DEFAULT false,
  emergency_opt_in                boolean DEFAULT false,
  emergency_lead_time_hours       integer,
  emergency_travel_radius_miles   integer,
  emergency_travel_modes          text[],
  emergency_notes                 text,
  languages_spoken                text[],
  performance_types               text[],
  founding_expires_at             timestamp,
  viewed_count                    integer DEFAULT 0,
  is_trending                     boolean DEFAULT false,
  is_managed                      boolean DEFAULT false,
  manager_name                    text,
  manager_email                   text,
  manager_phone                   text,
  reliability_score               integer DEFAULT 0,
  total_gigs                      integer DEFAULT 0,
  is_pro_verified                 boolean DEFAULT false,
  is_emergency_ready              boolean DEFAULT false,
  is_management_verified          boolean DEFAULT false,
  last_updated                    timestamp,
  confidence_tier                 integer DEFAULT 1,
  confidence_points               integer DEFAULT 0,
  emergency_status_requested      boolean DEFAULT false,
  flagged_for_review              boolean DEFAULT false,
  approval_seen                   boolean DEFAULT false,
  admin_notes                     text,
  created_at                      timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS singers_admin_approved_idx       ON singers (admin_approved);
CREATE INDEX IF NOT EXISTS singers_subscription_status_idx  ON singers (subscription_status);
CREATE INDEX IF NOT EXISTS singers_voice_type_idx           ON singers (primary_voice_type);
CREATE INDEX IF NOT EXISTS singers_union_status_idx         ON singers (union_status);
CREATE INDEX IF NOT EXISTS singers_represented_idx          ON singers (represented);
CREATE INDEX IF NOT EXISTS singers_emergency_opt_in_idx     ON singers (emergency_opt_in);
CREATE INDEX IF NOT EXISTS singers_created_at_idx           ON singers (created_at);

-- ---------------------------------------------------------------------
-- singer_roles (safety net — table already exists in prod)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS singer_roles (
  id                     serial PRIMARY KEY,
  singer_id              integer NOT NULL REFERENCES singers(id),
  role_name              text NOT NULL,
  work_title             text NOT NULL,
  composer               text NOT NULL,
  languages              text[],
  performance_types      text[],
  experience_depth       text,
  last_performed_date    text,
  notable_companies      text[]
);
CREATE INDEX IF NOT EXISTS singer_roles_singer_id_idx   ON singer_roles (singer_id);
CREATE INDEX IF NOT EXISTS singer_roles_composer_idx    ON singer_roles (composer);
CREATE INDEX IF NOT EXISTS singer_roles_role_name_idx   ON singer_roles (role_name);
CREATE INDEX IF NOT EXISTS singer_roles_work_title_idx  ON singer_roles (work_title);

-- ---------------------------------------------------------------------
-- singer_works (safety net — table already exists in prod)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS singer_works (
  id                     serial PRIMARY KEY,
  singer_id              integer NOT NULL REFERENCES singers(id),
  work_title             text NOT NULL,
  composer               text NOT NULL,
  part_name              text,
  context                text,
  languages              text[],
  experience_depth       text,
  last_performed_date    text,
  notable_ensembles      text[] DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS singer_works_singer_id_idx   ON singer_works (singer_id);
CREATE INDEX IF NOT EXISTS singer_works_composer_idx    ON singer_works (composer);
CREATE INDEX IF NOT EXISTS singer_works_work_title_idx  ON singer_works (work_title);
CREATE INDEX IF NOT EXISTS singer_works_part_name_idx   ON singer_works (part_name);

-- ---------------------------------------------------------------------
-- organizations (safety net — table already exists in prod)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id                                  serial PRIMARY KEY,
  email                               text UNIQUE NOT NULL,
  password                            text NOT NULL,
  organization_name                   text NOT NULL,
  organization_type                   text,
  website_url                         text,
  city                                text,
  state                               text,
  verified                            boolean DEFAULT false,
  admin_approved                      boolean DEFAULT false,
  subscription_tier                   text DEFAULT 'free',
  contact_reveal_limit                integer DEFAULT 3,
  contact_reveals_used_this_month     integer DEFAULT 0,
  login_count                         integer DEFAULT 0,
  contact_person_name                 text,
  contact_person_email                text,
  admin_notes                         text,
  pro_expires_at                      timestamp,
  founding_org                        boolean DEFAULT false,
  is_gifted                           boolean DEFAULT false,
  created_at                          timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizations_email_idx              ON organizations (email);
CREATE INDEX IF NOT EXISTS organizations_subscription_tier_idx  ON organizations (subscription_tier);
CREATE INDEX IF NOT EXISTS organizations_admin_approved_idx     ON organizations (admin_approved);

-- ---------------------------------------------------------------------
-- availabilities (safety net — table already exists in prod)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS availabilities (
  id                  serial PRIMARY KEY,
  singer_id           integer NOT NULL REFERENCES singers(id),
  start_date          text NOT NULL,
  end_date            text NOT NULL,
  geographic_radius   text,
  status              text DEFAULT 'active',
  expires_at          timestamp
);
CREATE INDEX IF NOT EXISTS availabilities_singer_id_idx   ON availabilities (singer_id);
CREATE INDEX IF NOT EXISTS availabilities_start_date_idx  ON availabilities (start_date);
CREATE INDEX IF NOT EXISTS availabilities_end_date_idx    ON availabilities (end_date);
CREATE INDEX IF NOT EXISTS availabilities_status_idx      ON availabilities (status);

-- ---------------------------------------------------------------------
-- contact_reveals
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_reveals (
  id            serial PRIMARY KEY,
  org_id        integer NOT NULL REFERENCES organizations(id),
  singer_id     integer NOT NULL REFERENCES singers(id),
  revealed_at   timestamp DEFAULT now(),
  is_emergency  boolean DEFAULT false,
  credits_used  integer DEFAULT 1
);
CREATE INDEX IF NOT EXISTS contact_reveals_org_id_idx       ON contact_reveals (org_id);
CREATE INDEX IF NOT EXISTS contact_reveals_singer_id_idx    ON contact_reveals (singer_id);
CREATE INDEX IF NOT EXISTS contact_reveals_revealed_at_idx  ON contact_reveals (revealed_at);

-- ---------------------------------------------------------------------
-- search_logs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_logs (
  id              serial PRIMARY KEY,
  org_id          integer,
  search_filters  jsonb,
  created_at      timestamp DEFAULT now()
);

-- ---------------------------------------------------------------------
-- engagement_feedback
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engagement_feedback (
  id                serial PRIMARY KEY,
  singer_id         integer NOT NULL REFERENCES singers(id),
  org_id            integer NOT NULL REFERENCES organizations(id),
  role_name         text NOT NULL,
  engagement_date   text NOT NULL,
  was_prepared      boolean DEFAULT false,
  was_professional  boolean DEFAULT false,
  was_accurate      boolean DEFAULT false,
  created_at        timestamp DEFAULT now()
);
CREATE INDEX        IF NOT EXISTS engagement_feedback_singer_id_idx  ON engagement_feedback (singer_id);
CREATE INDEX        IF NOT EXISTS engagement_feedback_org_id_idx     ON engagement_feedback (org_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_singer_org_date_idx         ON engagement_feedback (singer_id, org_id, engagement_date);

-- ---------------------------------------------------------------------
-- credit_adjustments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_adjustments (
  id                serial PRIMARY KEY,
  org_id            integer NOT NULL REFERENCES organizations(id),
  admin_action      text NOT NULL,
  amount            integer NOT NULL,
  previous_balance  integer NOT NULL,
  new_balance       integer NOT NULL,
  created_at        timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS credit_adjustments_org_id_idx ON credit_adjustments (org_id);

-- ---------------------------------------------------------------------
-- admin_gifts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_gifts (
  id              serial PRIMARY KEY,
  recipient_type  text NOT NULL,
  recipient_id    integer NOT NULL,
  gifted_by       text NOT NULL DEFAULT 'admin',
  duration_days   integer NOT NULL,
  expires_at      timestamp NOT NULL,
  reason          text,
  created_at      timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_gifts_recipient_idx ON admin_gifts (recipient_type, recipient_id);

-- ---------------------------------------------------------------------
-- sessions (used by express-session / connect-pg-simple)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  sid     varchar PRIMARY KEY,
  sess    json NOT NULL,
  expire  timestamp with time zone NOT NULL
);

COMMIT;

-- =====================================================================
-- Verify which tables now exist
-- =====================================================================
SELECT table_name
  FROM information_schema.tables
 WHERE table_schema = 'public'
   AND table_name IN (
     'repertoire_reference','singers','singer_roles','singer_works',
     'organizations','availabilities','contact_reveals','search_logs',
     'engagement_feedback','credit_adjustments','admin_gifts','sessions'
   )
 ORDER BY table_name;
