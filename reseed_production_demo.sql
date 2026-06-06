-- =====================================================================
  -- SingerSearch.net — production demo data reseed
  -- Generated from server/seed-data.ts (mirrors what seedDatabase() inserts).
  -- Safe to run in the Supabase SQL editor or psql against the production DB.
  --
  -- This file:
  --   1. Deletes all @example.com singer-related records in FK-safe order.
  --   2. Deletes all @example.com organizations.
  --   3. Inserts 100 demo singers with scrypt-hashed password (password123)
  --      and their roles (10 each), concert works (6 each), availabilities (3 each).
  --   4. Inserts 7 demo organizations (same password).
  --
  -- Wrapped in a single transaction. If anything fails, nothing is committed.
  -- Non-@example.com accounts (e.g. gfandrei@gmail.com) are NOT touched.
  -- =====================================================================

  BEGIN;

  -- ---------------------------------------------------------------------
  -- 1. Delete @example.com singer-related rows in FK-safe order
  --    (engagement_feedback / credit_adjustments DELETEs intentionally
  --     omitted — those tables may not exist in the target Supabase schema,
  --     and the seed never inserts into them.)
  -- ---------------------------------------------------------------------
  DELETE FROM contact_reveals
   WHERE singer_id IN (SELECT id FROM singers WHERE email ILIKE '%@example.com')
      OR org_id    IN (SELECT id FROM organizations WHERE email ILIKE '%@example.com');

  DELETE FROM availabilities
   WHERE singer_id IN (SELECT id FROM singers WHERE email ILIKE '%@example.com');

  DELETE FROM singer_works
   WHERE singer_id IN (SELECT id FROM singers WHERE email ILIKE '%@example.com');

  DELETE FROM singer_roles
   WHERE singer_id IN (SELECT id FROM singers WHERE email ILIKE '%@example.com');

  DELETE FROM singers
   WHERE email ILIKE '%@example.com';

  -- ---------------------------------------------------------------------
  -- 2. Delete @example.com organizations
  --    (engagement_feedback / credit_adjustments cleanup intentionally
  --     omitted — see note above.)
  -- ---------------------------------------------------------------------
  DELETE FROM contact_reveals
   WHERE org_id IN (SELECT id FROM organizations WHERE email ILIKE '%@example.com');

  DELETE FROM organizations
   WHERE email ILIKE '%@example.com';

  -- ---------------------------------------------------------------------
  -- 3. Insert 100 demo singers + their roles, works, availabilities
  --    Each singer is wrapped in a DO block so we can capture the new id
  --    via RETURNING into a plpgsql variable for the dependent inserts.
  -- ---------------------------------------------------------------------
  
-- Singer 1/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('anna.petrova@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Anna','Petrova','Denver','CO','Soprano','Dramatic Soprano','AGMA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Anna Petrova is a dramatic soprano based in Denver, CO with 3 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',ARRAY['Atlanta Opera','Palm Beach Opera']::text[],ARRAY['English','Italian','German','French','Spanish']::text[],'active','pro',true,TRUE,72,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French','Spanish']::text[],ARRAY['Opera','Orchestra']::text[],5,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2020-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2021-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'10+','2022-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2023-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2024-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2025-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','50','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','50','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','50','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 2/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('maria.castellano@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Maria','Castellano','Washington','DC','Soprano','Lyric Soprano','AEA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Maria Castellano is a lyric soprano based in Washington, DC with 4 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',ARRAY['Palm Beach Opera','Opera San José','Cincinnati Opera']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Orchestra','Other']::text[],18,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2021-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2022-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2023-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2024-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2025-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2026-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','50','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','50','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','50','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 3/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('elena.volkov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Elena','Volkov','Dallas','TX','Soprano','Coloratura Soprano','Non-Union',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Elena Volkov is a coloratura soprano based in Dallas, TX with 5 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',ARRAY['Arizona Opera','Opera Omaha','Utah Opera','Opera San José']::text[],ARRAY['English','Italian','German','French']::text[],'active','founding',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Other']::text[],31,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2022-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2023-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2024-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2025-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2026-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2020-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','200','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','200','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','200','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 4/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('sarah.chen@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Sarah','Chen','Miami','FL','Soprano','Lyric Soprano','AGMA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Sarah Chen is a lyric soprano based in Miami, FL with 6 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',ARRAY['Arizona Opera','Atlanta Opera']::text[],ARRAY['English','Italian']::text[],'active','founding',true,TRUE,72,200,ARRAY['car','train']::text[],ARRAY['English','Italian']::text[],ARRAY['Opera','Other']::text[],44,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2023-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2024-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2025-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'10+','2026-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2020-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2021-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','200','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','200','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','200','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 5/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('lucia.fernandez@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Lucia','Fernandez','New Orleans','LA','Soprano','Spinto Soprano','AEA',FALSE,NULL,NULL,NULL,'Lucia Fernandez is a spinto soprano based in New Orleans, LA with 7 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',ARRAY['Opera Tampa','Florida Grand Opera','Arizona Opera']::text[],ARRAY['English','Italian','French']::text[],'active','free',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Chorus']::text[],17,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2024-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2025-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2026-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2020-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2021-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2022-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-22','national','active','2027-06-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-29','national','active','2026-12-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-09','national','active','2027-03-11T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 6/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('katherine.wells@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Katherine','Wells','Kansas City','MO','Soprano','Soubrette','Non-Union',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Katherine Wells is a soubrette based in Kansas City, MO with 8 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',ARRAY['Opera San José','Utah Opera','Palm Beach Opera','Central City Opera']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Chorus']::text[],30,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2025-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2026-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2020-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2021-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2022-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2023-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-06','50','active','2027-08-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-12','50','active','2027-02-11T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-22','50','active','2027-04-21T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 7/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('yuki.tanaka@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Yuki','Tanaka','Los Angeles','CA','Soprano','Lyric Soprano','AGMA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Yuki Tanaka is a lyric soprano based in Los Angeles, CA with 9 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',ARRAY['Opera Theatre of Saint Louis','Utah Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','pro',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],43,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'10+','2026-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2020-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2021-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2022-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'10+','2023-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2024-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-22','50','active','2027-01-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-01','50','active','2027-03-31T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-05-06','50','active','2027-06-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 8/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('nadia.horvat@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Nadia','Horvat','Atlanta','GA','Soprano','Dramatic Soprano','AEA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Nadia Horvat is a dramatic soprano based in Atlanta, GA with 10 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',ARRAY['Opera Grand Rapids','Florida Grand Opera','Opera Tampa']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,FALSE,NULL,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Orchestra','Chorus']::text[],16,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2020-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2021-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2022-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2023-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2024-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2025-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-10','national','active','2027-03-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-12','national','active','2027-05-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-19','national','active','2027-07-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 9/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('isabella.moretti@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Isabella','Moretti','Dallas','TX','Soprano','Coloratura Soprano','Non-Union',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Isabella Moretti is a coloratura soprano based in Dallas, TX with 11 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',ARRAY['Atlanta Opera','Utah Opera','Opera Grand Rapids','Central City Opera']::text[],ARRAY['English','Italian','French']::text[],'active','founding',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],29,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2021-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2022-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2023-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2024-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2025-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2026-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-22','50','active','2027-04-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-29','50','active','2027-06-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 10/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('johanna.braun@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Johanna','Braun','Seattle','WA','Soprano','Lyric Soprano','AGMA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Johanna Braun is a lyric soprano based in Seattle, WA with 12 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',ARRAY['Arizona Opera','Opera Theatre of Saint Louis']::text[],ARRAY['English','Italian']::text[],'active','pro',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian']::text[],ARRAY['Opera','Orchestra']::text[],42,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2022-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'10+','2023-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2024-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2025-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2026-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'10+','2020-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-06','50','active','2027-06-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-13','50','active','2027-08-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-19','50','active','2027-02-18T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 11/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('camille.dupont@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Camille','Dupont','Chicago','IL','Soprano','Spinto Soprano','AEA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Camille Dupont is a spinto soprano based in Chicago, IL with 13 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',ARRAY['Opera Theatre of Saint Louis','Washington National Opera','Utah Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','founding',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],15,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2023-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2024-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2025-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2026-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2020-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2021-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-22','200','active','2027-07-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-29','200','active','2027-01-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-08','200','active','2027-04-07T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 12/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('aisha.williams@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Aisha','Williams','New Orleans','LA','Soprano','Lyric Soprano','Non-Union',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Aisha Williams is a lyric soprano based in New Orleans, LA with 14 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',ARRAY['Florida Grand Opera','Atlanta Opera','Opera Grand Rapids','Central City Opera']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],28,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2024-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2025-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2026-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2020-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2021-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2022-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-06','national','active','2027-01-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-17','national','active','2027-03-19T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-19','national','active','2027-05-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 13/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('fiona.obrien@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Fiona','O''Brien','Denver','CO','Soprano','Dramatic Soprano','AGMA',FALSE,NULL,NULL,NULL,'Fiona O''Brien is a dramatic soprano based in Denver, CO with 15 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400',ARRAY['Washington National Opera','Opera Grand Rapids']::text[],ARRAY['English','Italian','German','French']::text[],'active','founding',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Other']::text[],41,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2025-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2026-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'10+','2020-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2021-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2022-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2023-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-01-26','50','active','2027-02-25T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-29','50','active','2027-04-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-06-05','50','active','2027-07-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 14/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('svetlana.kuznetsova@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Svetlana','Kuznetsova','Atlanta','GA','Soprano','Lyric Soprano','AEA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Svetlana Kuznetsova is a lyric soprano based in Atlanta, GA with 16 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',ARRAY['Opera Grand Rapids','Atlanta Opera','Utah Opera']::text[],ARRAY['English','Italian','Spanish']::text[],'active','pro',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','Italian','Spanish']::text[],ARRAY['Opera','Orchestra']::text[],14,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2026-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2020-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2021-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2022-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2023-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2024-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-08','50','active','2027-04-07T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-13','50','active','2027-06-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-20','50','active','2027-08-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 15/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('diana.reyes@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Diana','Reyes','Cincinnati','OH','Soprano','Coloratura Soprano','Non-Union',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Diana Reyes is a coloratura soprano based in Cincinnati, OH with 17 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',ARRAY['Opera Grand Rapids','Cincinnati Opera','Arizona Opera','Opera Theatre of Saint Louis']::text[],ARRAY['English','Italian','French']::text[],'active','founding',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Orchestra','Chorus']::text[],27,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2020-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2021-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2022-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2023-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2024-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2025-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-22','200','active','2027-05-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-29','200','active','2027-07-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2027-01-05','200','active','2027-02-04T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 16/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('margaret.liu@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Margaret','Liu','Houston','TX','Soprano','Soubrette','AGMA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Margaret Liu is a soubrette based in Houston, TX with 18 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',ARRAY['Opera Tampa','Utah Opera']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,TRUE,48,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],40,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2021-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2022-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2023-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'10+','2024-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2025-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2026-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-05','national','active','2027-07-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-13','national','active','2027-01-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-24','national','active','2027-03-26T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 17/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('tatiana.sorokin@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Tatiana','Sorokin','Kansas City','MO','Soprano','Dramatic Soprano','AEA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Tatiana Sorokin is a dramatic soprano based in Kansas City, MO with 19 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1464863979621-258859e62245?w=400',ARRAY['Opera San José','Opera Tampa','Madison Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Chorus']::text[],13,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2022-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2023-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2024-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2025-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2026-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2020-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','national','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','national','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','national','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 18/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('christina.park@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Christina','Park','Denver','CO','Soprano','Lyric Soprano','Non-Union',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Christina Park is a lyric soprano based in Denver, CO with 20 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400',ARRAY['Arizona Opera','Utah Opera','Opera Omaha','Washington National Opera']::text[],ARRAY['English','Italian','German','Russian']::text[],'active','founding',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','Russian']::text[],ARRAY['Opera','Orchestra']::text[],26,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2023-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2024-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2025-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2026-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'6-10','2020-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2021-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','200','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','200','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','200','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 19/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('victoria.alonso@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Victoria','Alonso','Los Angeles','CA','Soprano','Spinto Soprano','AGMA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Victoria Alonso is a spinto soprano based in Los Angeles, CA with 3 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1485875437071-bb711a2f0a0e?w=400',ARRAY['Cincinnati Opera','Palm Beach Opera']::text[],ARRAY['English','Italian','French']::text[],'active','pro',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Orchestra','Chorus']::text[],39,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'10+','2024-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2025-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Soprano','Orchestra',ARRAY['German']::text[],'3-5','2026-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2020-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Soprano','Orchestra',ARRAY['German']::text[],'10+','2021-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Soprano','Orchestra',ARRAY['English']::text[],'1-2','2022-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','national','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','national','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','national','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 20/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('hannah.morrison@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Hannah','Morrison','Chicago','IL','Soprano','Lyric Soprano, contralto capable','AEA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Hannah Morrison is a lyric soprano, contralto capable based in Chicago, IL with 4 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400',ARRAY['Arizona Opera','Opera San José','Opera Grand Rapids']::text[],ARRAY['English','Italian']::text[],'active','pro',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Chorus']::text[],12,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Violetta','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Mimì','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Musetta','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pamina','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Donna Anna','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Countess','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Susanna','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Fiordiligi','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Micaëla','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tosca','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2025-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2026-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Soprano','Orchestra',ARRAY['English']::text[],'6-10','2020-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2021-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Soprano','Orchestra',ARRAY['German']::text[],'1-2','2022-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2023-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','50','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','50','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','50','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 21/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('alexandra.rossi@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Alexandra','Rossi','Washington','DC','Mezzo-Soprano','Lyric Mezzo','Non-Union',FALSE,NULL,NULL,NULL,'Alexandra Rossi is a lyric mezzo based in Washington, DC with 5 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',ARRAY['Atlanta Opera','Utah Opera','Arizona Opera','Central City Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','founding',true,TRUE,72,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],25,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2026-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2020-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2021-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2022-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2023-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2024-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-22','200','active','2027-06-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-29','200','active','2026-12-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-09','200','active','2027-03-11T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 22/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('carmen.delgado@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Carmen','Delgado','Phoenix','AZ','Mezzo-Soprano','Dramatic Mezzo','AGMA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Carmen Delgado is a dramatic mezzo based in Phoenix, AZ with 6 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',ARRAY['Palm Beach Opera','Opera Grand Rapids']::text[],ARRAY['English','Italian','German']::text[],'active','free',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Chorus']::text[],38,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2020-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2021-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2022-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2023-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2024-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2025-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-06','200','active','2027-08-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-12','200','active','2027-02-11T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-22','200','active','2027-04-21T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 23/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('rachel.kim@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Rachel','Kim','New York','NY','Mezzo-Soprano','Lyric Mezzo','AEA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Rachel Kim is a lyric mezzo based in New York, NY with 7 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',ARRAY['Opera Tampa','Utah Opera','Florida Grand Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','founding',true,TRUE,72,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],11,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2021-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2022-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2023-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2024-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2025-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2026-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-22','50','active','2027-01-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-01','50','active','2027-03-31T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-05-06','50','active','2027-06-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 24/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('olga.federova@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Olga','Federova','Kansas City','MO','Mezzo-Soprano','Dramatic Mezzo','Non-Union',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Olga Federova is a dramatic mezzo based in Kansas City, MO with 8 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',ARRAY['Opera Grand Rapids','Opera Theatre of Saint Louis','Opera Tampa','Central City Opera']::text[],ARRAY['English','Italian']::text[],'active','free',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Other']::text[],24,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2022-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2023-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2024-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2025-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2026-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2020-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-10','50','active','2027-03-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-12','50','active','2027-05-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-19','50','active','2027-07-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 25/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('michelle.bernard@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Michelle','Bernard','Boston','MA','Mezzo-Soprano','Coloratura Mezzo','AGMA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Michelle Bernard is a coloratura mezzo based in Boston, MA with 9 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',ARRAY['Arizona Opera','Opera San José']::text[],ARRAY['English','Italian','French']::text[],'active','free',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],37,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2023-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2024-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2025-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2026-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2020-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2021-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-22','50','active','2027-04-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-29','50','active','2027-06-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 26/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('patricia.santos@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Patricia','Santos','Salt Lake City','UT','Mezzo-Soprano','Lyric Mezzo','AEA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Patricia Santos is a lyric mezzo based in Salt Lake City, UT with 10 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',ARRAY['Atlanta Opera','Utah Opera','Arizona Opera']::text[],ARRAY['English','Italian','German','Czech']::text[],'active','pro',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','Czech']::text[],ARRAY['Opera','Other']::text[],10,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2024-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2025-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2026-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2020-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2021-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2022-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-06','200','active','2027-06-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-13','200','active','2027-08-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-19','200','active','2027-02-18T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 27/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('deborah.washington@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Deborah','Washington','Cincinnati','OH','Mezzo-Soprano','Dramatic Mezzo','Non-Union',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Deborah Washington is a dramatic mezzo based in Cincinnati, OH with 11 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',ARRAY['Washington National Opera','Florida Grand Opera','Cincinnati Opera','Opera San José']::text[],ARRAY['English','Italian','German','French','Spanish']::text[],'active','founding',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French','Spanish']::text[],ARRAY['Orchestra','Chorus']::text[],23,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2025-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2026-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2020-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2021-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2022-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2023-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-22','200','active','2027-07-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-29','200','active','2027-01-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-08','200','active','2027-04-07T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 28/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('ingrid.larsen@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Ingrid','Larsen','New Orleans','LA','Mezzo-Soprano','Lyric Mezzo, contralto capable','AGMA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Ingrid Larsen is a lyric mezzo, contralto capable based in New Orleans, LA with 12 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',ARRAY['Madison Opera','Opera San José']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],36,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2026-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2020-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2021-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2022-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2023-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2024-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-17','50','active','2027-03-19T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-19','50','active','2027-05-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 29/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('marguerite.fontaine@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Marguerite','Fontaine','Nashville','TN','Mezzo-Soprano','Coloratura Mezzo','AEA',FALSE,NULL,NULL,NULL,'Marguerite Fontaine is a coloratura mezzo based in Nashville, TN with 13 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',ARRAY['Opera Grand Rapids','Utah Opera','Arizona Opera']::text[],ARRAY['English','Italian','French']::text[],'active','founding',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],9,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2020-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2021-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2022-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2023-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2024-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2025-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-01-26','national','active','2027-02-25T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-29','national','active','2027-04-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-06-05','national','active','2027-07-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 30/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('teresa.lombardi@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Teresa','Lombardi','Seattle','WA','Mezzo-Soprano','Dramatic Mezzo','Non-Union',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Teresa Lombardi is a dramatic mezzo based in Seattle, WA with 14 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',ARRAY['Palm Beach Opera','Utah Opera','Cincinnati Opera','Washington National Opera']::text[],ARRAY['English','Italian']::text[],'active','pro',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Chorus']::text[],22,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2021-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2022-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2023-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2024-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2025-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2026-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-08','national','active','2027-04-07T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-13','national','active','2027-06-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-20','national','active','2027-08-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 31/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('sandra.nilsson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Sandra','Nilsson','Salt Lake City','UT','Mezzo-Soprano','Lyric Mezzo, contralto capable','AGMA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Sandra Nilsson is a lyric mezzo, contralto capable based in Salt Lake City, UT with 15 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',ARRAY['Arizona Opera','Madison Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Chorus']::text[],35,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2022-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2023-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2024-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2025-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2026-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2020-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-22','200','active','2027-05-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-29','200','active','2027-07-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2027-01-05','200','active','2027-02-04T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 32/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('natasha.ivanova@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Natasha','Ivanova','Miami','FL','Mezzo-Soprano','Dramatic Mezzo','AEA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Natasha Ivanova is a dramatic mezzo based in Miami, FL with 16 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',ARRAY['Opera San José','Washington National Opera','Opera Tampa']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,TRUE,72,50,ARRAY['car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],8,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2023-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2024-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2025-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2026-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2020-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2021-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-05','50','active','2027-07-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-13','50','active','2027-01-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-24','50','active','2027-03-26T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 33/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('keiko.yamamoto@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Keiko','Yamamoto','Philadelphia','PA','Mezzo-Soprano','Lyric Mezzo','Non-Union',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Keiko Yamamoto is a lyric mezzo based in Philadelphia, PA with 17 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400',ARRAY['Atlanta Opera','Madison Opera','Arizona Opera','Washington National Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Orchestra','Chorus']::text[],21,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2024-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2025-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2026-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2020-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2021-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2022-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','200','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','200','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','200','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 34/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('barbara.klein@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Barbara','Klein','Dallas','TX','Mezzo-Soprano','Lyric Mezzo, contralto capable','AGMA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Barbara Klein is a lyric mezzo, contralto capable based in Dallas, TX with 18 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',ARRAY['Washington National Opera','Atlanta Opera']::text[],ARRAY['English','Italian','Russian']::text[],'active','founding',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','Russian']::text[],ARRAY['Orchestra','Chorus']::text[],34,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2025-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2026-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'1-2','2020-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2021-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2022-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2023-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','50','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','50','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','50','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 35/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('valentina.cruz@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Valentina','Cruz','Minneapolis','MN','Mezzo-Soprano','Dramatic Mezzo','AEA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Valentina Cruz is a dramatic mezzo based in Minneapolis, MN with 19 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',ARRAY['Florida Grand Opera','Utah Opera','Opera Tampa']::text[],ARRAY['English','Italian','French','Russian']::text[],'active','pro',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','French','Russian']::text[],ARRAY['Opera','Orchestra']::text[],7,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2026-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2020-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'3-5','2021-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2022-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2023-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2024-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','50','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','50','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','50','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 36/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('josephine.taylor@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Josephine','Taylor','Minneapolis','MN','Mezzo-Soprano','Coloratura Mezzo','Non-Union',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Josephine Taylor is a coloratura mezzo based in Minneapolis, MN with 20 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',ARRAY['Arizona Opera','Utah Opera','Atlanta Opera','Central City Opera']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Orchestra','Other']::text[],20,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2020-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2021-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'6-10','2022-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'10+','2023-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2024-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2025-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','200','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','200','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','200','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 37/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('andrea.fischer@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Andrea','Fischer','New York','NY','Mezzo-Soprano','Lyric Mezzo','AGMA',FALSE,NULL,NULL,NULL,'Andrea Fischer is a lyric mezzo based in New York, NY with 3 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1464863979621-258859e62245?w=400',ARRAY['Atlanta Opera','Washington National Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],33,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2021-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2022-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'10+','2023-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'1-2','2024-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'3-5','2025-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'6-10','2026-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-22','50','active','2027-06-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-29','50','active','2026-12-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-09','50','active','2027-03-11T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 38/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('rita.cardoso@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Rita','Cardoso','Washington','DC','Mezzo-Soprano','Dramatic Mezzo, contralto capable','AEA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Rita Cardoso is a dramatic mezzo, contralto capable based in Washington, DC with 4 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400',ARRAY['Palm Beach Opera','Utah Opera','Washington National Opera']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],6,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Carmen','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rosina','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cherubino','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dorabella','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Amneris','Aida','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Azucena','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Eboli','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Dalila','Samson et Dalila','Saint-Saëns',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Octavian','Der Rosenkavalier','R. Strauss',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Hänsel','Hänsel und Gretel','Humperdinck',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2022-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2023-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Mezzo-Soprano','Orchestra',ARRAY['German']::text[],'1-2','2024-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Mezzo-Soprano','Orchestra',ARRAY['Latin']::text[],'3-5','2025-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Mezzo-Soprano','Orchestra',ARRAY['English']::text[],'6-10','2026-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Mezzo-Soprano','Orchestra',ARRAY['Latin','German']::text[],'10+','2020-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-06','200','active','2027-08-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-12','200','active','2027-02-11T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-22','200','active','2027-04-21T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 39/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('michael.torres@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Michael','Torres','Washington','DC','Tenor','Lyric Tenor','Non-Union',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Michael Torres is a lyric tenor based in Washington, DC with 5 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',ARRAY['Arizona Opera','Opera San José','Opera Tampa','Florida Grand Opera']::text[],ARRAY['English','Italian','French']::text[],'active','pro',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],19,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2023-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2024-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2025-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2026-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2020-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2021-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-22','50','active','2027-01-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-01','50','active','2027-03-31T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-05-06','50','active','2027-06-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 40/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('giovanni.benedetti@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Giovanni','Benedetti','Denver','CO','Tenor','Spinto Tenor','AGMA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Giovanni Benedetti is a spinto tenor based in Denver, CO with 6 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',ARRAY['Arizona Opera','Washington National Opera']::text[],ARRAY['English','Italian','Spanish']::text[],'active','free',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','Spanish']::text[],ARRAY['Orchestra','Other']::text[],32,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'1-2','2024-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2025-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2026-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'10+','2020-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'1-2','2021-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2022-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-10','200','active','2027-03-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-12','200','active','2027-05-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-19','200','active','2027-07-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 41/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('james.park@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','James','Park','Nashville','TN','Tenor','Lyric Tenor','AEA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'James Park is a lyric tenor based in Nashville, TN with 7 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',ARRAY['Washington National Opera','Atlanta Opera','Cincinnati Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','pro',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],5,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'3-5','2025-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2026-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2020-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2021-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'3-5','2022-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2023-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-22','50','active','2027-04-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-29','50','active','2027-06-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 42/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('david.koenig@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','David','Koenig','Cincinnati','OH','Tenor','Heldentenor','Non-Union',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'David Koenig is a heldentenor based in Cincinnati, OH with 8 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',ARRAY['Arizona Opera','Opera San José','Utah Opera','Central City Opera']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,TRUE,48,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Chorus']::text[],18,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2026-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2020-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2021-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2022-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2023-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2024-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-06','national','active','2027-06-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-13','national','active','2027-08-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-19','national','active','2027-02-18T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 43/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('carlos.mendoza@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Carlos','Mendoza','San Francisco','CA','Tenor','Lyric Tenor','AGMA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Carlos Mendoza is a lyric tenor based in San Francisco, CA with 9 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',ARRAY['Florida Grand Opera','Opera Omaha']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],31,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'10+','2020-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2021-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2022-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'6-10','2023-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'10+','2024-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2025-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-22','50','active','2027-07-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-29','50','active','2027-01-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-08','50','active','2027-04-07T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 44/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('alexei.volkov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Alexei','Volkov','Cincinnati','OH','Tenor','Spinto Tenor','AEA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Alexei Volkov is a spinto tenor based in Cincinnati, OH with 10 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',ARRAY['Arizona Opera','Washington National Opera','Madison Opera']::text[],ARRAY['English','Italian']::text[],'active','free',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian']::text[],ARRAY['Opera','Chorus']::text[],44,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2021-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2022-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2023-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2024-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2025-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2026-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-06','national','active','2027-01-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-17','national','active','2027-03-19T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-19','national','active','2027-05-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 45/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('benjamin.shaw@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Benjamin','Shaw','Chicago','IL','Tenor','Leggiero Tenor','Non-Union',FALSE,NULL,NULL,NULL,'Benjamin Shaw is a leggiero tenor based in Chicago, IL with 11 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',ARRAY['Opera Grand Rapids','Palm Beach Opera','Arizona Opera','Opera San José']::text[],ARRAY['English','Italian','French']::text[],'active','free',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],17,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2022-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2023-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2024-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2025-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2026-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2020-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-01-26','national','active','2027-02-25T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-29','national','active','2027-04-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-06-05','national','active','2027-07-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 46/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('philippe.laurent@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Philippe','Laurent','Nashville','TN','Tenor','Lyric Tenor','AGMA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Philippe Laurent is a lyric tenor based in Nashville, TN with 12 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',ARRAY['Opera Grand Rapids','Atlanta Opera']::text[],ARRAY['English','Italian','German']::text[],'active','free',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],30,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2023-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'10+','2024-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'1-2','2025-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2026-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2020-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'10+','2021-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-08','50','active','2027-04-07T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-13','50','active','2027-06-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-20','50','active','2027-08-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 47/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('robert.chen@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Robert','Chen','New York','NY','Tenor','Lyric Tenor','AEA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Robert Chen is a lyric tenor based in New York, NY with 13 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',ARRAY['Opera Grand Rapids','Utah Opera','Opera San José']::text[],ARRAY['English','Italian','German','French']::text[],'active','pro',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],43,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2024-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2025-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'3-5','2026-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2020-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2021-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2022-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-22','50','active','2027-05-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-29','50','active','2027-07-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2027-01-05','50','active','2027-02-04T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 48/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('antonio.ferrara@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Antonio','Ferrara','Chicago','IL','Tenor','Spinto Tenor','Non-Union',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Antonio Ferrara is a spinto tenor based in Chicago, IL with 14 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',ARRAY['Florida Grand Opera','Opera San José','Utah Opera','Opera Theatre of Saint Louis']::text[],ARRAY['English','Italian','German']::text[],'active','free',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],16,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2025-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2026-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2020-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2021-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2022-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2023-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-05','national','active','2027-07-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-13','national','active','2027-01-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-24','national','active','2027-03-26T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 49/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('william.hayes@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','William','Hayes','Seattle','WA','Tenor','Heldentenor','AGMA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'William Hayes is a heldentenor based in Seattle, WA with 15 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400',ARRAY['Opera Grand Rapids','Opera San José']::text[],ARRAY['English','Italian','French']::text[],'active','free',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Chorus']::text[],29,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2026-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'6-10','2020-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'10+','2021-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2022-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2023-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'6-10','2024-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','50','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','50','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','50','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 50/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('hans.mueller@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Hans','Mueller','Denver','CO','Tenor','Lyric Tenor','AEA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Hans Mueller is a lyric tenor based in Denver, CO with 16 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',ARRAY['Cincinnati Opera','Atlanta Opera','Utah Opera']::text[],ARRAY['English','Italian']::text[],'active','pro',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Chorus']::text[],42,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2020-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2021-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2022-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2023-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2024-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2025-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','national','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','national','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','national','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 51/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('eduardo.ortiz@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Eduardo','Ortiz','Kansas City','MO','Tenor','Leggiero Tenor','Non-Union',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Eduardo Ortiz is a leggiero tenor based in Kansas City, MO with 17 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',ARRAY['Opera Tampa','Washington National Opera','Opera Grand Rapids','Cincinnati Opera']::text[],ARRAY['English','Italian','German','French','Czech']::text[],'active','founding',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French','Czech']::text[],ARRAY['Opera','Chorus']::text[],15,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2021-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2022-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2023-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2024-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2025-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2026-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','50','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','50','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','50','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 52/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('christopher.evans@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Christopher','Evans','New Orleans','LA','Tenor','Lyric Tenor','AGMA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Christopher Evans is a lyric tenor based in New Orleans, LA with 18 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400',ARRAY['Arizona Opera','Atlanta Opera']::text[],ARRAY['English','Italian','German','Russian']::text[],'active','pro',true,FALSE,NULL,500,ARRAY['flight','car']::text[],ARRAY['English','Italian','German','Russian']::text[],ARRAY['Opera','Chorus']::text[],28,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'1-2','2022-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2023-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2024-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'10+','2025-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'1-2','2026-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2020-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','national','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','national','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','national','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 53/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('sergei.popov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Sergei','Popov','Seattle','WA','Tenor','Spinto Tenor','AEA',FALSE,NULL,NULL,NULL,'Sergei Popov is a spinto tenor based in Seattle, WA with 19 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400',ARRAY['Opera Omaha','Opera San José','Cincinnati Opera']::text[],ARRAY['English','Italian','German','French','Spanish']::text[],'active','pro',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French','Spanish']::text[],ARRAY['Opera','Chorus']::text[],41,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'3-5','2023-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2024-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2025-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2026-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'3-5','2020-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2021-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-22','50','active','2027-06-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-29','50','active','2026-12-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-09','50','active','2027-03-11T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 54/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('thomas.andersen@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Thomas','Andersen','Philadelphia','PA','Tenor','Lyric Tenor','Non-Union',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Thomas Andersen is a lyric tenor based in Philadelphia, PA with 20 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1548449112-96a38a643324?w=400',ARRAY['Opera Grand Rapids','Utah Opera','Opera Tampa','Palm Beach Opera']::text[],ARRAY['English','Italian']::text[],'active','pro',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Chorus']::text[],14,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2024-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2025-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2026-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2020-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'6-10','2021-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Tenor','Orchestra',ARRAY['Latin']::text[],'10+','2022-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-06','200','active','2027-08-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-12','200','active','2027-02-11T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-22','200','active','2027-04-21T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 55/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('kenneth.yamada@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Kenneth','Yamada','Dallas','TX','Tenor','Leggiero Tenor','AGMA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Kenneth Yamada is a leggiero tenor based in Dallas, TX with 3 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400',ARRAY['Cincinnati Opera','Opera Tampa']::text[],ARRAY['English','Italian','French']::text[],'active','founding',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],27,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'10+','2025-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2026-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Tenor','Orchestra',ARRAY['German']::text[],'3-5','2020-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Tenor','Orchestra',ARRAY['Latin']::text[],'6-10','2021-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Tenor','Orchestra',ARRAY['German']::text[],'10+','2022-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Tenor','Orchestra',ARRAY['English']::text[],'1-2','2023-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-22','200','active','2027-01-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-01','200','active','2027-03-31T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-05-06','200','active','2027-06-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 56/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('patrick.sullivan@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Patrick','Sullivan','Minneapolis','MN','Tenor','Lyric Tenor','AEA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Patrick Sullivan is a lyric tenor based in Minneapolis, MN with 4 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400',ARRAY['Florida Grand Opera','Atlanta Opera','Madison Opera']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,TRUE,72,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Orchestra','Chorus']::text[],40,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rodolfo','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tamino','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Ottavio','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Alfredo','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Duke','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Pinkerton','Madama Butterfly','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Cavaradossi','Tosca','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Nemorino','L''elisir d''amore','Donizetti',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2026-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2020-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Tenor','Orchestra',ARRAY['English']::text[],'6-10','2021-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Tenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2022-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Tenor','Orchestra',ARRAY['German']::text[],'1-2','2023-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Tenor','Orchestra',ARRAY['Latin']::text[],'3-5','2024-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-10','200','active','2027-03-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-12','200','active','2027-05-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-19','200','active','2027-07-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 57/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('marco.rinaldi@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Marco','Rinaldi','Boston','MA','Baritone','Lyric Baritone','Non-Union',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Marco Rinaldi is a lyric baritone based in Boston, MA with 5 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',ARRAY['Palm Beach Opera','Utah Opera','Opera San José','Central City Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],13,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2020-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2021-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2022-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2023-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2024-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2025-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-22','50','active','2027-04-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-29','50','active','2027-06-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 58/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('jonathan.blake@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Jonathan','Blake','San Francisco','CA','Baritone','Verdi Baritone','AGMA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Jonathan Blake is a verdi baritone based in San Francisco, CA with 6 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400',ARRAY['Arizona Opera','Atlanta Opera']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Chorus']::text[],26,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2021-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'10+','2022-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'1-2','2023-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2024-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2025-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'10+','2026-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-06','200','active','2027-06-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-13','200','active','2027-08-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-19','200','active','2027-02-18T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 59/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('andre.williams@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Andre','Williams','Houston','TX','Baritone','Dramatic Baritone','AEA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Andre Williams is a dramatic baritone based in Houston, TX with 7 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',ARRAY['Washington National Opera','Cincinnati Opera','Madison Opera']::text[],ARRAY['English','Italian','French']::text[],'active','founding',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],39,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2022-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2023-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'3-5','2024-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2025-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2026-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2020-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-22','200','active','2027-07-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-29','200','active','2027-01-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-08','200','active','2027-04-07T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 60/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('stefan.horvat@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Stefan','Horvat','Boston','MA','Baritone','Bass-Baritone','Non-Union',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Stefan Horvat is a bass-baritone based in Boston, MA with 8 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',ARRAY['Opera San José','Palm Beach Opera','Madison Opera','Central City Opera']::text[],ARRAY['English','Italian']::text[],'active','free',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Other']::text[],12,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2023-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2024-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2025-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2026-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2020-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2021-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-17','50','active','2027-03-19T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-19','50','active','2027-05-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 61/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('richard.hoffman@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Richard','Hoffman','Atlanta','GA','Baritone','Lyric Baritone','AGMA',FALSE,NULL,NULL,NULL,'Richard Hoffman is a lyric baritone based in Atlanta, GA with 9 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',ARRAY['Washington National Opera','Florida Grand Opera']::text[],ARRAY['English','Italian','German','French']::text[],'active','free',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Orchestra']::text[],25,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2024-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'6-10','2025-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'10+','2026-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2020-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2021-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'6-10','2022-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-01-26','50','active','2027-02-25T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-29','50','active','2027-04-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-06-05','50','active','2027-07-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 62/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('luis.herrera@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Luis','Herrera','Philadelphia','PA','Baritone','Verdi Baritone','AEA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Luis Herrera is a verdi baritone based in Philadelphia, PA with 10 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',ARRAY['Arizona Opera','Opera Tampa','Washington National Opera']::text[],ARRAY['English','Italian','German']::text[],'active','pro',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Other']::text[],38,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2025-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'10+','2026-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2020-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2021-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2022-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'10+','2023-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-08','200','active','2027-04-07T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-13','200','active','2027-06-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-20','200','active','2027-08-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 63/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('peter.johansson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Peter','Johansson','Phoenix','AZ','Baritone','Dramatic Baritone','Non-Union',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Peter Johansson is a dramatic baritone based in Phoenix, AZ with 11 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',ARRAY['Washington National Opera','Madison Opera','Opera San José','Opera Theatre of Saint Louis']::text[],ARRAY['English','Italian','German','French']::text[],'active','pro',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French']::text[],ARRAY['Opera','Chorus']::text[],11,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2026-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2020-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2021-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2022-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2023-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2024-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-22','200','active','2027-05-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-29','200','active','2027-07-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2027-01-05','200','active','2027-02-04T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 64/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('frank.dubois@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Frank','Dubois','Miami','FL','Baritone','Lyric Baritone','AGMA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Frank Dubois is a lyric baritone based in Miami, FL with 12 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',ARRAY['Madison Opera','Utah Opera']::text[],ARRAY['English','Italian']::text[],'active','pro',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','Italian']::text[],ARRAY['Orchestra','Other']::text[],24,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'1-2','2020-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2021-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2022-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'10+','2023-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'1-2','2024-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2025-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-05','national','active','2027-07-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-13','national','active','2027-01-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-24','national','active','2027-03-26T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 65/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('george.patterson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','George','Patterson','New Orleans','LA','Baritone','Bass-Baritone','AEA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'George Patterson is a bass-baritone based in New Orleans, LA with 13 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',ARRAY['Palm Beach Opera','Utah Opera','Opera Tampa']::text[],ARRAY['English','Italian','French']::text[],'active','pro',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','Italian','French']::text[],ARRAY['Opera','Orchestra']::text[],37,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'3-5','2021-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2022-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2023-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2024-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'3-5','2025-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2026-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','50','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','50','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','50','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 66/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('dmitri.kozlov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Dmitri','Kozlov','Washington','DC','Baritone','Verdi Baritone','Non-Union',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Dmitri Kozlov is a verdi baritone based in Washington, DC with 14 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',ARRAY['Arizona Opera','Utah Opera','Palm Beach Opera','Central City Opera']::text[],ARRAY['English','Italian','German','Spanish']::text[],'active','founding',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','Spanish']::text[],ARRAY['Opera','Orchestra']::text[],10,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2022-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2023-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2024-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2025-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2026-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2020-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','200','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','200','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','200','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 67/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('kevin.omalley@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Kevin','O''Malley','Salt Lake City','UT','Baritone','Lyric Baritone','AGMA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Kevin O''Malley is a lyric baritone based in Salt Lake City, UT with 15 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',ARRAY['Arizona Opera','Washington National Opera']::text[],ARRAY['English','Italian','German','French','Russian']::text[],'active','pro',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German','French','Russian']::text[],ARRAY['Orchestra','Other']::text[],23,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'10+','2023-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2024-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2025-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'6-10','2026-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'10+','2020-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2021-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','200','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','200','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','200','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 68/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('tomas.guerrero@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Tomas','Guerrero','Chicago','IL','Baritone','Dramatic Baritone','AEA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Tomas Guerrero is a dramatic baritone based in Chicago, IL with 16 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',ARRAY['Opera San José','Utah Opera','Florida Grand Opera']::text[],ARRAY['English','Italian','German']::text[],'active','founding',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','German']::text[],ARRAY['Opera','Orchestra']::text[],36,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2024-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2025-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2026-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'10+','2020-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2021-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2022-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','200','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','200','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','200','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 69/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('nicholas.grant@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Nicholas','Grant','Boston','MA','Baritone','Lyric Baritone','Non-Union',FALSE,NULL,NULL,NULL,'Nicholas Grant is a lyric baritone based in Boston, MA with 17 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400',ARRAY['Arizona Opera','Utah Opera','Opera San José','Opera Grand Rapids']::text[],ARRAY['English','Italian','French','Russian']::text[],'active','pro',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','Italian','French','Russian']::text[],ARRAY['Orchestra','Chorus']::text[],9,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2025-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2026-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2020-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2021-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2022-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2023-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-22','200','active','2027-06-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-29','200','active','2026-12-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-09','200','active','2027-03-11T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 70/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('charles.wright@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Charles','Wright','Dallas','TX','Baritone','Bass-Baritone','AGMA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Charles Wright is a bass-baritone based in Dallas, TX with 18 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',ARRAY['Opera San José','Cincinnati Opera']::text[],ARRAY['English','Italian']::text[],'active','free',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','Italian']::text[],ARRAY['Opera','Other']::text[],22,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2026-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'10+','2020-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'1-2','2021-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2022-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2023-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'10+','2024-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-06','50','active','2027-08-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-12','50','active','2027-02-11T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-22','50','active','2027-04-21T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 71/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('raymond.lee@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Raymond','Lee','Minneapolis','MN','Baritone','Verdi Baritone','AEA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Raymond Lee is a verdi baritone based in Minneapolis, MN with 19 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',ARRAY['Atlanta Opera','Utah Opera','Arizona Opera']::text[],ARRAY['English','German','French']::text[],'active','pro',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','German','French']::text[],ARRAY['Opera','Orchestra']::text[],35,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2020-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2021-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'3-5','2022-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2023-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2024-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2025-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-22','200','active','2027-01-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-01','200','active','2027-03-31T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-05-06','200','active','2027-06-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 72/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('albert.fischer@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Albert','Fischer','Salt Lake City','UT','Baritone','Dramatic Baritone','Non-Union',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Albert Fischer is a dramatic baritone based in Salt Lake City, UT with 20 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400',ARRAY['Opera San José','Utah Opera','Cincinnati Opera','Central City Opera']::text[],ARRAY['English','German']::text[],'active','pro',true,TRUE,72,200,ARRAY['car','train']::text[],ARRAY['English','German']::text[],ARRAY['Opera','Other']::text[],8,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2021-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2022-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'6-10','2023-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Baritone','Orchestra',ARRAY['Latin']::text[],'10+','2024-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2025-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2026-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-10','200','active','2027-03-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-12','200','active','2027-05-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-19','200','active','2027-07-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 73/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('simon.campbell@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Simon','Campbell','Miami','FL','Baritone','Lyric Baritone','AGMA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Simon Campbell is a lyric baritone based in Miami, FL with 3 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400',ARRAY['Opera San José','Palm Beach Opera']::text[],ARRAY['English','German','French']::text[],'active','pro',true,FALSE,NULL,500,ARRAY['flight','car']::text[],ARRAY['English','German','French']::text[],ARRAY['Opera','Orchestra']::text[],21,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2022-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'6-10','2023-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Baritone','Orchestra',ARRAY['German']::text[],'10+','2024-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Baritone','Orchestra',ARRAY['English']::text[],'1-2','2025-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Baritone','Orchestra',ARRAY['German']::text[],'3-5','2026-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Baritone','Orchestra',ARRAY['Latin']::text[],'6-10','2020-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-22','national','active','2027-04-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-29','national','active','2027-06-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-12-06','national','active','2027-01-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 74/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('oscar.lindqvist@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Oscar','Lindqvist','Houston','TX','Baritone','Bass-Baritone','AEA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Oscar Lindqvist is a bass-baritone based in Houston, TX with 4 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1548449112-96a38a643324?w=400',ARRAY['Arizona Opera','Utah Opera','Florida Grand Opera']::text[],ARRAY['English']::text[],'active','free',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English']::text[],ARRAY['Orchestra','Other']::text[],34,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Figaro','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Don Giovanni','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Escamillo','Carmen','Bizet',ARRAY['French']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Marcello','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Guglielmo','Così fan tutte','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Papageno','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Count Almaviva','Le Nozze di Figaro','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Germont','La Traviata','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rigoletto','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2023-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'10+','2024-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Baritone','Orchestra',ARRAY['German']::text[],'1-2','2025-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Baritone','Orchestra',ARRAY['Latin']::text[],'3-5','2026-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Baritone','Orchestra',ARRAY['English']::text[],'6-10','2020-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Baritone','Orchestra',ARRAY['Latin','German']::text[],'10+','2021-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-06','50','active','2027-06-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-13','50','active','2027-08-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-19','50','active','2027-02-18T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 75/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('vladimir.petrov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Vladimir','Petrov','Phoenix','AZ','Bass','Basso Profondo','Non-Union',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Vladimir Petrov is a basso profondo based in Phoenix, AZ with 5 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400',ARRAY['Arizona Opera','Cincinnati Opera','Utah Opera','Opera Grand Rapids']::text[],ARRAY['English','French']::text[],'active','pro',true,TRUE,48,500,ARRAY['flight','car']::text[],ARRAY['English','French']::text[],ARRAY['Opera','Orchestra']::text[],7,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2024-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'1-2','2025-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2026-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'6-10','2020-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2021-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'1-2','2022-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-22','national','active','2027-07-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-29','national','active','2027-01-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-08','national','active','2027-04-07T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 76/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('james.henderson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','James','Henderson','Seattle','WA','Bass','Basso Cantante','AGMA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'James Henderson is a basso cantante based in Seattle, WA with 6 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400',ARRAY['Cincinnati Opera','Opera Grand Rapids']::text[],ARRAY['English','German','Czech']::text[],'active','founding',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','German','Czech']::text[],ARRAY['Opera','Other']::text[],20,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'1-2','2025-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'3-5','2026-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'6-10','2020-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'10+','2021-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'1-2','2022-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'3-5','2023-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-06','50','active','2027-01-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-17','50','active','2027-03-19T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-19','50','active','2027-05-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 77/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('friedrich.bauer@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Friedrich','Bauer','Nashville','TN','Bass','Dramatic Bass','AEA',FALSE,NULL,NULL,NULL,'Friedrich Bauer is a dramatic bass based in Nashville, TN with 7 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',ARRAY['Arizona Opera','Cincinnati Opera','Florida Grand Opera']::text[],ARRAY['English','German','French']::text[],'active','free',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','German','French']::text[],ARRAY['Orchestra','Other']::text[],33,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'3-5','2026-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'6-10','2020-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2021-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'1-2','2022-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'3-5','2023-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'6-10','2024-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-01-26','50','active','2027-02-25T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-29','50','active','2027-04-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-06-05','50','active','2027-07-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 78/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('samuel.jackson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Samuel','Jackson','Houston','TX','Bass','Bass-Baritone','Non-Union',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Samuel Jackson is a bass-baritone based in Houston, TX with 8 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400',ARRAY['Palm Beach Opera','Cincinnati Opera','Arizona Opera','Opera San José']::text[],ARRAY['English','German']::text[],'active','founding',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English','German']::text[],ARRAY['Opera','Orchestra']::text[],6,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'6-10','2020-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2021-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'1-2','2022-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2023-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'6-10','2024-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2025-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-08','50','active','2027-04-07T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-13','50','active','2027-06-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-20','50','active','2027-08-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 79/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('mikhail.sorokin@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Mikhail','Sorokin','Los Angeles','CA','Bass','Basso Profondo','AGMA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Mikhail Sorokin is a basso profondo based in Los Angeles, CA with 9 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',ARRAY['Arizona Opera','Utah Opera']::text[],ARRAY['English','French','Spanish']::text[],'active','pro',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','French','Spanish']::text[],ARRAY['Opera','Other']::text[],19,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'10+','2021-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'1-2','2022-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'3-5','2023-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'6-10','2024-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'10+','2025-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'1-2','2026-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-22','national','active','2027-05-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-29','national','active','2027-07-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2027-01-05','national','active','2027-02-04T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 80/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('lawrence.mitchell@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Lawrence','Mitchell','Philadelphia','PA','Bass','Basso Cantante','AEA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Lawrence Mitchell is a basso cantante based in Philadelphia, PA with 10 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',ARRAY['Opera San José','Opera Grand Rapids','Washington National Opera']::text[],ARRAY['English']::text[],'active','founding',true,FALSE,NULL,500,ARRAY['flight','car']::text[],ARRAY['English']::text[],ARRAY['Opera','Chorus']::text[],32,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'1-2','2022-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2023-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'6-10','2024-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'10+','2025-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'1-2','2026-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2020-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-05','national','active','2027-07-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-13','national','active','2027-01-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-24','national','active','2027-03-26T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 81/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('igor.zhukov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Igor','Zhukov','Atlanta','GA','Bass','Dramatic Bass','Non-Union',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Igor Zhukov is a dramatic bass based in Atlanta, GA with 11 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',ARRAY['Opera Theatre of Saint Louis','Utah Opera','Arizona Opera','Palm Beach Opera']::text[],ARRAY['English','German','French']::text[],'active','founding',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','German','French']::text[],ARRAY['Opera','Orchestra']::text[],5,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2023-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'6-10','2024-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2025-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'1-2','2026-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2020-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'6-10','2021-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','200','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','200','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','200','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 82/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('robert.oconnor@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Robert','O''Connor','Philadelphia','PA','Bass','Bass-Baritone','AGMA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Robert O''Connor is a bass-baritone based in Philadelphia, PA with 12 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',ARRAY['Opera Grand Rapids','Opera Theatre of Saint Louis']::text[],ARRAY['English','German']::text[],'active','founding',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','German']::text[],ARRAY['Opera','Chorus']::text[],18,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'6-10','2024-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'10+','2025-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'1-2','2026-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'3-5','2020-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'6-10','2021-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'10+','2022-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','200','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','200','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','200','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 83/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('henrik.magnusson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Henrik','Magnusson','Kansas City','MO','Bass','Basso Profondo','AEA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Henrik Magnusson is a basso profondo based in Kansas City, MO with 13 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',ARRAY['Cincinnati Opera','Washington National Opera','Madison Opera']::text[],ARRAY['English','German','French']::text[],'active','pro',true,TRUE,72,500,ARRAY['flight','car']::text[],ARRAY['English','German','French']::text[],ARRAY['Orchestra','Chorus']::text[],31,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2025-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'1-2','2026-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'3-5','2020-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'6-10','2021-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2022-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'1-2','2023-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','national','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','national','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','national','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 84/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('arthur.kim@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Arthur','Kim','Boston','MA','Bass','Basso Cantante','Non-Union',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Arthur Kim is a basso cantante based in Boston, MA with 14 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',ARRAY['Florida Grand Opera','Utah Opera','Opera Omaha','Central City Opera']::text[],ARRAY['English']::text[],'active','free',true,TRUE,48,500,ARRAY['flight','car']::text[],ARRAY['English']::text[],ARRAY['Opera','Orchestra']::text[],44,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'1-2','2026-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2020-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'6-10','2021-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2022-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'1-2','2023-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2024-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','national','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','national','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','national','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 85/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('giuseppe.rizzo@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Giuseppe','Rizzo','Los Angeles','CA','Bass','Dramatic Bass','AGMA',FALSE,NULL,NULL,NULL,'Giuseppe Rizzo is a dramatic bass based in Los Angeles, CA with 15 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',ARRAY['Florida Grand Opera','Opera San José']::text[],ARRAY['English','French']::text[],'active','founding',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','French']::text[],ARRAY['Opera','Orchestra']::text[],17,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'3-5','2020-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'6-10','2021-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'10+','2022-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'1-2','2023-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'3-5','2024-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'6-10','2025-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-22','national','active','2027-06-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-29','national','active','2026-12-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-09','national','active','2027-03-11T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 86/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('donald.pearson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Donald','Pearson','San Francisco','CA','Bass','Bass-Baritone','AEA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Donald Pearson is a bass-baritone based in San Francisco, CA with 16 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',ARRAY['Palm Beach Opera','Utah Opera','Opera Grand Rapids']::text[],ARRAY['English','German','Russian']::text[],'active','free',true,FALSE,NULL,200,ARRAY['car','train']::text[],ARRAY['English','German','Russian']::text[],ARRAY['Orchestra','Chorus']::text[],30,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'6-10','2021-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'10+','2022-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'1-2','2023-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2024-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'6-10','2025-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'10+','2026-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-06','200','active','2027-08-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-12','200','active','2027-02-11T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-22','200','active','2027-04-21T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 87/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('nikolai.dragunov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Nikolai','Dragunov','San Francisco','CA','Bass','Basso Profondo','Non-Union',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Nikolai Dragunov is a basso profondo based in San Francisco, CA with 17 years of professional experience in opera and other performance.','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',ARRAY['Arizona Opera','Palm Beach Opera','Cincinnati Opera','Opera San José']::text[],ARRAY['English','German','French']::text[],'active','pro',true,TRUE,72,200,ARRAY['car','train']::text[],ARRAY['English','German','French']::text[],ARRAY['Opera','Other']::text[],43,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2022-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'1-2','2023-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2024-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'6-10','2025-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2026-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'1-2','2020-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-22','200','active','2027-01-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-01','200','active','2027-03-31T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-05-06','200','active','2027-06-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 88/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('timothy.walsh@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Timothy','Walsh','New York','NY','Bass','Basso Cantante','AGMA',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Timothy Walsh is a basso cantante based in New York, NY with 18 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',ARRAY['Cincinnati Opera','Opera San José']::text[],ARRAY['English','German']::text[],'active','founding',true,TRUE,72,50,ARRAY['car']::text[],ARRAY['English','German']::text[],ARRAY['Opera','Chorus']::text[],16,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'1-2','2023-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'3-5','2024-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Bass','Orchestra',ARRAY['English']::text[],'6-10','2025-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Bass','Orchestra',ARRAY['German']::text[],'10+','2026-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Bass','Orchestra',ARRAY['Latin']::text[],'1-2','2020-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Bass','Orchestra',ARRAY['German']::text[],'3-5','2021-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-10','50','active','2027-03-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-12','50','active','2027-05-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-19','50','active','2027-07-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 89/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('emilio.vargas@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Emilio','Vargas','Houston','TX','Bass','Dramatic Bass','AEA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Emilio Vargas is a dramatic bass based in Houston, TX with 19 years of professional experience in orchestra and other performance.','https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400',ARRAY['Arizona Opera','Madison Opera','Atlanta Opera']::text[],ARRAY['English','French']::text[],'active','pro',true,TRUE,24,200,ARRAY['car','train']::text[],ARRAY['English','French']::text[],ARRAY['Orchestra','Other']::text[],29,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'3-5','2024-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'6-10','2025-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2026-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Bass','Orchestra',ARRAY['English']::text[],'1-2','2020-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Bass','Orchestra',ARRAY['Latin','German']::text[],'3-5','2021-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Bass','Orchestra',ARRAY['German']::text[],'6-10','2022-03');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-22','200','active','2027-04-21T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-05-29','200','active','2027-06-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-12-06','200','active','2027-01-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 90/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('martin.lindberg@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Martin','Lindberg','Phoenix','AZ','Bass','Bass-Baritone','Non-Union',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Martin Lindberg is a bass-baritone based in Phoenix, AZ with 20 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',ARRAY['Opera Grand Rapids','Utah Opera','Opera Omaha','Central City Opera']::text[],ARRAY['English']::text[],'active','pro',true,TRUE,24,50,ARRAY['car']::text[],ARRAY['English']::text[],ARRAY['Opera','Orchestra']::text[],42,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sarastro','Die Zauberflöte','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Leporello','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Commendatore','Don Giovanni','Mozart',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Sparafucile','Rigoletto','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Colline','La Bohème','Puccini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Basilio','Il Barbiere di Siviglia','Rossini',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'King Philip','Don Carlo','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Osmin','Die Entführung aus dem Serail','Mozart',ARRAY['German']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Gremin','Eugene Onegin','Tchaikovsky',ARRAY['Russian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ferrando','Il Trovatore','Verdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'6-10','2025-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2026-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Bass','Orchestra',ARRAY['German']::text[],'1-2','2020-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Bass','Orchestra',ARRAY['Latin']::text[],'3-5','2021-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Bass','Orchestra',ARRAY['German']::text[],'6-10','2022-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Bass','Orchestra',ARRAY['Latin']::text[],'10+','2023-04');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-06','50','active','2027-06-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-13','50','active','2027-08-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-19','50','active','2027-02-18T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 91/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('daniel.rivera@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Daniel','Rivera','Cincinnati','OH','Countertenor','Countertenor','AGMA',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Daniel Rivera is a countertenor based in Cincinnati, OH with 3 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',ARRAY['Opera Tampa','Cincinnati Opera']::text[],ARRAY['English','German','French']::text[],'active','free',true,TRUE,72,200,ARRAY['car','train']::text[],ARRAY['English','German','French']::text[],ARRAY['Opera','Orchestra']::text[],15,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'10+','2026-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Countertenor','Orchestra',ARRAY['English']::text[],'1-2','2020-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Countertenor','Orchestra',ARRAY['German']::text[],'3-5','2021-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Countertenor','Orchestra',ARRAY['Latin']::text[],'6-10','2022-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'10+','2023-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Countertenor','Orchestra',ARRAY['English']::text[],'1-2','2024-05');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-22','200','active','2027-07-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2026-12-29','200','active','2027-01-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-03-08','200','active','2027-04-07T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 92/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('andrew.nakamura@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Andrew','Nakamura','Salt Lake City','UT','Countertenor','Countertenor','AEA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Andrew Nakamura is a countertenor based in Salt Lake City, UT with 4 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400',ARRAY['Florida Grand Opera','Cincinnati Opera','Palm Beach Opera']::text[],ARRAY['English','German','Spanish']::text[],'active','founding',true,TRUE,24,500,ARRAY['flight','car']::text[],ARRAY['English','German','Spanish']::text[],ARRAY['Opera','Chorus']::text[],28,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2020-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2021-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Countertenor','Orchestra',ARRAY['English']::text[],'6-10','2022-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Countertenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2023-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2024-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2025-06');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-06','national','active','2027-01-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-17','national','active','2027-03-19T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-19','national','active','2027-05-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 93/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('marcus.thompson@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Marcus','Thompson','Los Angeles','CA','Countertenor','Alto Countertenor','Non-Union',FALSE,NULL,NULL,NULL,'Marcus Thompson is a alto countertenor based in Los Angeles, CA with 5 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400',ARRAY['Opera Omaha','Opera Theatre of Saint Louis','Florida Grand Opera','Central City Opera']::text[],ARRAY['English','German','French']::text[],'active','pro',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','German','French']::text[],ARRAY['Opera','Orchestra']::text[],41,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-10',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-11',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-01',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2021-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Countertenor','Orchestra',ARRAY['German']::text[],'6-10','2022-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Countertenor','Orchestra',ARRAY['Latin']::text[],'10+','2023-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2024-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2025-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Countertenor','Orchestra',ARRAY['German']::text[],'6-10','2026-07');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-01-26','200','active','2027-02-25T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-03-29','200','active','2027-04-28T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-01','2027-06-05','200','active','2027-07-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 94/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('julian.devries@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Julian','De Vries','Phoenix','AZ','Countertenor','Countertenor','AGMA',TRUE,'Tact Artists Management','tactartistsmanagement@agency.com',NULL,'Julian De Vries is a countertenor based in Phoenix, AZ with 6 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1548449112-96a38a643324?w=400',ARRAY['Opera Tampa','Utah Opera']::text[],ARRAY['English']::text[],'active','founding',true,TRUE,72,50,ARRAY['car']::text[],ARRAY['English']::text[],ARRAY['Opera','Orchestra']::text[],14,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-11',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-12',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-02',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Countertenor','Orchestra',ARRAY['English']::text[],'6-10','2022-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Countertenor','Orchestra',ARRAY['German']::text[],'10+','2023-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Countertenor','Orchestra',ARRAY['Latin']::text[],'1-2','2024-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'3-5','2025-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Countertenor','Orchestra',ARRAY['English']::text[],'6-10','2026-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Countertenor','Orchestra',ARRAY['German']::text[],'10+','2020-08');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-08','50','active','2027-04-07T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-13','50','active','2027-06-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-15','2027-07-20','50','active','2027-08-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 95/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('ryan.mitchell@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Ryan','Mitchell','San Francisco','CA','Countertenor','Alto Countertenor','AEA',TRUE,'Askonas Holt','askonasholt@agency.com',NULL,'Ryan Mitchell is a alto countertenor based in San Francisco, CA with 7 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400',ARRAY['Arizona Opera','Florida Grand Opera','Utah Opera']::text[],ARRAY['English','French']::text[],'active','free',true,FALSE,NULL,50,ARRAY['car']::text[],ARRAY['English','French']::text[],ARRAY['Opera','Chorus']::text[],27,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-12',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-01',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-02',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-03',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Countertenor','Orchestra',ARRAY['Latin']::text[],'10+','2023-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Countertenor','Orchestra',ARRAY['English']::text[],'1-2','2024-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Countertenor','Orchestra',ARRAY['Latin','German']::text[],'3-5','2025-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Countertenor','Orchestra',ARRAY['German']::text[],'6-10','2026-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Countertenor','Orchestra',ARRAY['Latin']::text[],'10+','2020-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Countertenor','Orchestra',ARRAY['English']::text[],'1-2','2021-09');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-22','50','active','2027-05-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-06-29','50','active','2027-07-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-01','2027-01-05','50','active','2027-02-04T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 96/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('alexander.popov@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Alexander','Popov','Minneapolis','MN','Countertenor','Countertenor','Non-Union',TRUE,'Hazard Chase','hazardchase@agency.com',NULL,'Alexander Popov is a countertenor based in Minneapolis, MN with 8 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400',ARRAY['Florida Grand Opera','Utah Opera','Opera Grand Rapids','Central City Opera']::text[],ARRAY['English','German']::text[],'active','founding',true,TRUE,48,200,ARRAY['car','train']::text[],ARRAY['English','German']::text[],ARRAY['Opera','Orchestra']::text[],40,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-01',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-02',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-03',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-04',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-05',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-06',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2023-07',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2026-08',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-09',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2024-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2025-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'6-10','2026-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Countertenor','Orchestra',ARRAY['Latin']::text[],'10+','2020-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2021-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2022-10');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-05','200','active','2027-07-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-13','200','active','2027-01-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-20','2027-02-24','200','active','2027-03-26T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 97/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('nathan.reeves@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Nathan','Reeves','New York','NY','Countertenor','Countertenor','AGMA',TRUE,'Barrett Vantage','barrettvantage@agency.com',NULL,'Nathan Reeves is a countertenor based in New York, NY with 9 years of professional experience in orchestra and chorus performance.','https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',ARRAY['Arizona Opera','Florida Grand Opera']::text[],ARRAY['English','German','French']::text[],'active','founding',true,FALSE,NULL,500,ARRAY['flight','car']::text[],ARRAY['English','German','French']::text[],ARRAY['Orchestra','Chorus']::text[],13,'2027-05-08T00:28:35.619Z'::timestamp)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-02',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-03',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-04',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-05',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-06',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-07',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2024-08',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2017-09',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2020-10',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Countertenor','Orchestra',ARRAY['German']::text[],'3-5','2025-01');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Countertenor','Orchestra',ARRAY['Latin']::text[],'6-10','2026-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'10+','2020-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Countertenor','Orchestra',ARRAY['English']::text[],'1-2','2021-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Countertenor','Orchestra',ARRAY['German']::text[],'3-5','2022-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Countertenor','Orchestra',ARRAY['Latin']::text[],'6-10','2023-11');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-01','2026-11-22','national','active','2026-12-22T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-01-05','2027-02-02','national','active','2027-03-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-01','2027-04-05','national','active','2027-05-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 98/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('christoph.braun@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Christoph','Braun','Atlanta','GA','Countertenor','Alto Countertenor','AEA',TRUE,'Opus 3 Artists','opus3artists@agency.com',NULL,'Christoph Braun is a alto countertenor based in Atlanta, GA with 10 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400',ARRAY['Opera Tampa','Florida Grand Opera','Washington National Opera']::text[],ARRAY['English','German']::text[],'active','pro',true,FALSE,NULL,500,ARRAY['flight','car']::text[],ARRAY['English','German']::text[],ARRAY['Opera','Chorus']::text[],26,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'3-5','2024-02',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-03',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-04',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-05',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-06',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-07',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-08',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2025-09',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2018-10',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2021-11',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Countertenor','Orchestra',ARRAY['English']::text[],'6-10','2026-02');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Countertenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2020-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Brahms Requiem','Brahms','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2021-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Bach Mass in B Minor','Bach','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2022-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Messiah','Handel','Countertenor','Orchestra',ARRAY['English']::text[],'6-10','2023-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Carmina Burana','Orff','Countertenor','Orchestra',ARRAY['Latin','German']::text[],'10+','2024-12');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-12-15','2027-01-05','national','active','2027-02-04T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-15','2027-03-15','national','active','2027-04-14T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-15','2027-05-20','national','active','2027-06-19T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 99/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('isaiah.greene@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Isaiah','Greene','Nashville','TN','Countertenor','Countertenor','Non-Union',TRUE,'IMG Artists','imgartists@agency.com',NULL,'Isaiah Greene is a countertenor based in Nashville, TN with 11 years of professional experience in opera and chorus performance.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',ARRAY['Opera Tampa','Opera Theatre of Saint Louis','Opera San José','Central City Opera']::text[],ARRAY['English','French']::text[],'active','free',true,TRUE,48,50,ARRAY['car']::text[],ARRAY['English','French']::text[],ARRAY['Opera','Chorus']::text[],39,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'6-10','2025-03',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-04',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-05',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-06',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-07',ARRAY['Central City Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-08',ARRAY['Washington National Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-09',ARRAY['Madison Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2026-10',ARRAY['Atlanta Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2019-11',ARRAY['Opera San José']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2022-12',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Countertenor','Orchestra',ARRAY['Latin']::text[],'10+','2020-03');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2021-05');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Rossini Stabat Mater','Rossini','Countertenor','Orchestra',ARRAY['Latin']::text[],'3-5','2022-07');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'St Matthew Passion','Bach','Countertenor','Orchestra',ARRAY['German']::text[],'6-10','2023-09');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mozart Requiem','Mozart','Countertenor','Orchestra',ARRAY['Latin']::text[],'10+','2024-11');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 2','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'1-2','2025-01');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-02-01','2027-02-22','50','active','2027-03-24T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-04-01','2027-04-29','50','active','2027-05-29T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-06-01','2027-07-06','50','active','2027-08-05T00:00:00.000Z'::timestamp);
END
$singer$;

-- Singer 100/100
DO $singer$
DECLARE v_singer_id integer;
BEGIN
  INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ('felix.kowalski@example.com','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Felix','Kowalski','Miami','FL','Countertenor','Alto Countertenor','AGMA',TRUE,'Columbia Artists','columbiaartists@agency.com',NULL,'Felix Kowalski is a alto countertenor based in Miami, FL with 12 years of professional experience in opera and orchestra performance.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',ARRAY['Arizona Opera','Washington National Opera']::text[],ARRAY['English','Russian']::text[],'active','pro',true,TRUE,72,50,ARRAY['car']::text[],ARRAY['English','Russian']::text[],ARRAY['Opera','Orchestra']::text[],12,NULL)
  RETURNING id INTO v_singer_id;
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Oberon','A Midsummer Night''s Dream','Britten',ARRAY['English']::text[],ARRAY['fully_staged']::text[],'10+','2026-04',ARRAY['Florida Grand Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Giulio Cesare','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2019-05',ARRAY['Palm Beach Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Rinaldo','Rinaldo','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2022-06',ARRAY['Opera Theatre of Saint Louis']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Ottone','L''incoronazione di Poppea','Monteverdi',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2025-07',ARRAY['Utah Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Tolomeo','Giulio Cesare','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2018-08',ARRAY['Cincinnati Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsace','Partenope','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2021-09',ARRAY['Opera Tampa']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Unulfo','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'3-5','2024-10',ARRAY['Opera Grand Rapids']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Bertarido','Rodelinda','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'6-10','2017-11',ARRAY['Arizona Opera']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Arsamenes','Xerxes','Handel',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'10+','2020-12',ARRAY['Opera Omaha']::text[]);
  INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES (v_singer_id,'Orfeo','Orfeo ed Euridice','Gluck',ARRAY['Italian']::text[],ARRAY['fully_staged']::text[],'1-2','2023-01',ARRAY['Opera Carolina']::text[]);
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Countertenor','Orchestra',ARRAY['Latin']::text[],'1-2','2021-04');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'3-5','2022-06');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Elijah','Mendelssohn','Countertenor','Orchestra',ARRAY['English']::text[],'6-10','2023-08');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Beethoven Symphony No. 9','Beethoven','Countertenor','Orchestra',ARRAY['German']::text[],'10+','2024-10');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Verdi Requiem','Verdi','Countertenor','Orchestra',ARRAY['Latin']::text[],'1-2','2025-12');
  INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES (v_singer_id,'Mahler Symphony No. 4','Mahler','Countertenor','Orchestra',ARRAY['German']::text[],'3-5','2026-02');
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-03-15','2027-04-05','50','active','2027-05-05T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2027-05-15','2027-06-12','50','active','2027-07-12T00:00:00.000Z'::timestamp);
  INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES (v_singer_id,'2026-11-15','2026-12-20','50','active','2027-01-19T00:00:00.000Z'::timestamp);
END
$singer$;

  -- ---------------------------------------------------------------------
  -- 4. Insert 7 demo organizations
  -- ---------------------------------------------------------------------
  INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('sarah.mitchell@metopera.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Metropolitan Opera','Opera Company','New York','NY',true,true,'pro',50,3);

INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('casting@lyricchicago.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Lyric Opera of Chicago','Opera Company','Chicago','IL',true,true,'pro',50,1);

INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('casting@operasanjose.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Opera San José','Opera Company','San José','CA',true,true,'free',3,0);

INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('casting@azopera.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Arizona Opera','Opera Company','Phoenix','AZ',true,true,'pro',50,2);

INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('casting@operatampa.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Opera Tampa','Opera Company','Tampa','FL',true,true,'free',3,0);

INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('casting@madisonopera.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Madison Opera','Opera Company','Madison','WI',true,true,'free',3,0);

INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ('casting@pbopera.org','fcb27a2420f7323f4163a42feda39f8d.5dbebecfbde4d3149245e7ab69750a98c72b58a427f5be49492da30749ba035ee51f02316602a12a462ca6f0252fa7ecb17780fb9171ab27f9e325b490bc9546','Palm Beach Opera','Opera Company','Palm Beach','FL',true,true,'pro',50,4);

  -- ---------------------------------------------------------------------
  -- 5. Verification (these run inside the transaction)
  -- ---------------------------------------------------------------------
  DO $verify$
  DECLARE
    v_singers integer;
    v_orgs    integer;
    v_anna    integer;
  BEGIN
    SELECT count(*) INTO v_singers FROM singers WHERE email ILIKE '%@example.com';
    SELECT count(*) INTO v_orgs    FROM organizations WHERE email ILIKE '%@example.com';
    SELECT count(*) INTO v_anna    FROM singers WHERE email = 'anna.petrova@example.com';
    RAISE NOTICE 'Demo singers inserted: %  (expected 100)', v_singers;
    RAISE NOTICE 'Demo orgs inserted:    %  (expected 7)',  v_orgs;
    RAISE NOTICE 'anna.petrova@example.com present: %  (expected 1)', v_anna;
    IF v_singers <> 100 OR v_orgs <> 7 OR v_anna <> 1 THEN
      RAISE EXCEPTION 'Verification failed — rolling back';
    END IF;
  END
  $verify$;

  COMMIT;

  -- =====================================================================
  -- After commit: anna.petrova@example.com / password123 should log in.
  -- =====================================================================
  