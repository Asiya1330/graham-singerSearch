import {
  type Singer, type InsertSinger,
  type SingerRole, type InsertSingerRole,
  type SingerWork, type InsertSingerWork,
  type Organization, type InsertOrganization,
  type Availability, type InsertAvailability,
  type ContactReveal, type InsertContactReveal,
  type EngagementFeedback, type InsertEngagementFeedback,
  type RepertoireReference,
  type Shortlist, type InsertShortlist,
  singers, singerRoles, singerWorks, organizations, availabilities, contactReveals, searchLogs, engagementFeedback,
  shortlists, repertoireReference, adminGifts,
  type AdminGift,
  repertoireSuggestions,
  type RepertoireSuggestion, type InsertRepertoireSuggestion,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, gte, lte, ilike, or, sql, desc, count, inArray } from "drizzle-orm";
import { Pool } from "pg";

export interface IStorage {
  getSinger(id: number): Promise<Singer | undefined>;
  getSingerByEmail(email: string): Promise<Singer | undefined>;
  createSinger(singer: InsertSinger): Promise<Singer>;
  updateSinger(id: number, data: Partial<Singer>): Promise<Singer | undefined>;
  deleteSinger(id: number): Promise<void>;
  getApprovedSingers(): Promise<Singer[]>;

  getSingerRoles(singerId: number): Promise<SingerRole[]>;
  createSingerRole(role: InsertSingerRole): Promise<SingerRole>;
  updateSingerRole(id: number, data: Partial<SingerRole>): Promise<SingerRole | undefined>;
  deleteSingerRole(id: number): Promise<void>;
  deleteSingerRoles(singerId: number): Promise<void>;

  getSingerWorks(singerId: number): Promise<SingerWork[]>;
  createSingerWork(work: InsertSingerWork): Promise<SingerWork>;
  deleteSingerWork(id: number): Promise<void>;
  deleteSingerWorks(singerId: number): Promise<void>;

  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByEmail(email: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined>;

  getAvailabilities(singerId: number): Promise<Availability[]>;
  createAvailability(avail: InsertAvailability): Promise<Availability>;
  deleteAvailability(id: number): Promise<void>;
  deleteAvailabilities(singerId: number): Promise<void>;

  createContactReveal(reveal: InsertContactReveal): Promise<ContactReveal>;
  getContactReveals(orgId: number): Promise<ContactReveal[]>;
  getRevealedSingerIds(orgId: number): Promise<number[]>;
  getRevealedSingersWithData(orgId: number): Promise<Singer[]>;
  deleteContactRevealsBySinger(singerId: number): Promise<void>;

  toggleShortlist(orgId: number, singerId: number): Promise<{ shortlisted: boolean }>;
  getShortlistedSingerIds(orgId: number): Promise<number[]>;
  getShortlistedSingersWithData(orgId: number): Promise<Singer[]>;
  deleteShortlistsBySinger(singerId: number): Promise<void>;
  deleteShortlistsByOrg(orgId: number): Promise<void>;

  getSingerCount(): Promise<number>;
  getOrganizationCount(): Promise<number>;
  createAdminGift(data: { recipient_type: 'singer' | 'org'; recipient_id: number; duration_days: number; expires_at: Date; reason?: string | null }): Promise<AdminGift>;
  getAdminGifts(recipientType: 'singer' | 'org', recipientId: number): Promise<AdminGift[]>;

  createSearchLog(orgId: number, filters: any): Promise<void>;

  getAdminStats(): Promise<{
    total_singers: number;
    founding_count: number;
    total_orgs: number;
    total_searches: number;
    total_contact_reveals: number;
  }>;

  searchSingers(filters: {
    voiceType?: string;
    startDate?: string;
    endDate?: string;
    composer?: string;
    roleOrWork?: string;
    workTitle?: string;
    role?: string;
    roleNames?: string[];
    workTitleForWorks?: string;
    roleVoiceType?: string;
    unionStatus?: string;
    represented?: string;
    emergencyMode?: boolean;
    performanceTypes?: string[];
    city?: string;
    searchLat?: number;
    searchLng?: number;
    radiusMiles?: number;
    language?: string;
    experienceLevel?: string;
    managedOnly?: string;
  }): Promise<(Singer & { roles: SingerRole[]; works: SingerWork[]; availabilities: Availability[]; distance_miles?: number | null })[]>;

  countSingers(filters: {
    voiceType?: string;
    startDate?: string;
    endDate?: string;
    composer?: string;
    roleOrWork?: string;
    workTitle?: string;
    role?: string;
    roleNames?: string[];
    workTitleForWorks?: string;
    roleVoiceType?: string;
    unionStatus?: string;
    represented?: string;
    emergencyMode?: boolean;
    performanceTypes?: string[];
    city?: string;
    language?: string;
    experienceLevel?: string;
    managedOnly?: string;
  }): Promise<number>;

  submitEngagementFeedback(feedback: InsertEngagementFeedback): Promise<EngagementFeedback>;
  checkDuplicateFeedback(singerId: number, orgId: number, engagementDate: string): Promise<boolean>;
  recalculateReliabilityScore(singerId: number): Promise<void>;
  getFeedbackByOrg(orgId: number): Promise<EngagementFeedback[]>;

  searchRepertoire(query: string, limit?: number, type?: 'work' | 'role', categories?: string[], workTitleFilter?: string, composerFilter?: string): Promise<RepertoireReference[]>;

  countSearchAppearances(singerId: number, days: number): Promise<number>;

  createRepertoireSuggestion(data: InsertRepertoireSuggestion & { singer_id: number }): Promise<RepertoireSuggestion>;
  listRepertoireSuggestions(): Promise<(RepertoireSuggestion & { singer_first_name: string | null; singer_last_name: string | null })[]>;
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async getSinger(id: number): Promise<Singer | undefined> {
    const [singer] = await db.select().from(singers).where(eq(singers.id, id));
    return singer;
  }

  async getSingerByEmail(email: string): Promise<Singer | undefined> {
    const [singer] = await db.select().from(singers).where(eq(singers.email, email));
    return singer;
  }

  async createSinger(singer: InsertSinger): Promise<Singer> {
    const [created] = await db.insert(singers).values(singer).returning();
    return created;
  }

  async updateSinger(id: number, data: Partial<Singer>): Promise<Singer | undefined> {
    const [updated] = await db.update(singers).set(data).where(eq(singers.id, id)).returning();
    return updated;
  }

  async deleteSinger(id: number): Promise<void> {
    await db.delete(singers).where(eq(singers.id, id));
  }

  async getApprovedSingers(): Promise<Singer[]> {
    return db.select().from(singers).where(eq(singers.admin_approved, true));
  }

  async getSingerRoles(singerId: number): Promise<SingerRole[]> {
    return db.select().from(singerRoles).where(eq(singerRoles.singer_id, singerId));
  }

  async createSingerRole(role: InsertSingerRole): Promise<SingerRole> {
    const [created] = await db.insert(singerRoles).values(role).returning();
    return created;
  }

  async updateSingerRole(id: number, data: Partial<SingerRole>): Promise<SingerRole | undefined> {
    const { id: _, singer_id: __, ...updateData } = data as any;
    const [updated] = await db.update(singerRoles).set(updateData).where(eq(singerRoles.id, id)).returning();
    return updated;
  }

  async deleteSingerRole(id: number): Promise<void> {
    await db.delete(singerRoles).where(eq(singerRoles.id, id));
  }

  async deleteSingerRoles(singerId: number): Promise<void> {
    await db.delete(singerRoles).where(eq(singerRoles.singer_id, singerId));
  }

  async getSingerWorks(singerId: number): Promise<SingerWork[]> {
    return db.select().from(singerWorks).where(eq(singerWorks.singer_id, singerId));
  }

  async createSingerWork(work: InsertSingerWork): Promise<SingerWork> {
    const [created] = await db.insert(singerWorks).values(work).returning();
    return created;
  }

  async deleteSingerWork(id: number): Promise<void> {
    await db.delete(singerWorks).where(eq(singerWorks.id, id));
  }

  async deleteSingerWorks(singerId: number): Promise<void> {
    await db.delete(singerWorks).where(eq(singerWorks.singer_id, singerId));
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationByEmail(email: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.email, email));
    return org;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [created] = await db.insert(organizations).values(org).returning();
    return created;
  }

  async updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined> {
    const [updated] = await db.update(organizations).set(data).where(eq(organizations.id, id)).returning();
    return updated;
  }

  async getAvailabilities(singerId: number): Promise<Availability[]> {
    return db.select().from(availabilities).where(eq(availabilities.singer_id, singerId));
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const [created] = await db.insert(availabilities).values(avail).returning();
    return created;
  }

  async deleteAvailability(id: number): Promise<void> {
    await db.delete(availabilities).where(eq(availabilities.id, id));
  }

  async deleteAvailabilities(singerId: number): Promise<void> {
    await db.delete(availabilities).where(eq(availabilities.singer_id, singerId));
  }

  async createContactReveal(reveal: InsertContactReveal): Promise<ContactReveal> {
    const [created] = await db.insert(contactReveals).values(reveal).returning();
    return created;
  }

  async getContactReveals(orgId: number): Promise<ContactReveal[]> {
    return db.select().from(contactReveals).where(eq(contactReveals.org_id, orgId));
  }

  async getRevealedSingerIds(orgId: number): Promise<number[]> {
    const reveals = await db.select({ singer_id: contactReveals.singer_id })
      .from(contactReveals)
      .where(eq(contactReveals.org_id, orgId));
    return reveals.map(r => r.singer_id);
  }

  async getRevealedSingersWithData(orgId: number): Promise<Singer[]> {
    const reveals = await db.select({
      singer_id: contactReveals.singer_id,
      revealed_at: contactReveals.revealed_at,
    })
      .from(contactReveals)
      .where(eq(contactReveals.org_id, orgId))
      .orderBy(desc(contactReveals.revealed_at));

    if (reveals.length === 0) return [];

    const uniqueIds = [...new Set(reveals.map(r => r.singer_id))];
    const singerRows = await db.select().from(singers).where(inArray(singers.id, uniqueIds));

    const revealedAtMap: Record<number, Date | null> = {};
    for (const r of reveals) {
      if (!revealedAtMap[r.singer_id]) revealedAtMap[r.singer_id] = r.revealed_at;
    }

    return singerRows.map(s => ({ ...s, revealed_at: revealedAtMap[s.id] } as any));
  }

  async deleteContactRevealsBySinger(singerId: number): Promise<void> {
    await db.delete(contactReveals).where(eq(contactReveals.singer_id, singerId));
  }

  async toggleShortlist(orgId: number, singerId: number): Promise<{ shortlisted: boolean }> {
    const existing = await db.select({ id: shortlists.id })
      .from(shortlists)
      .where(and(eq(shortlists.org_id, orgId), eq(shortlists.singer_id, singerId)))
      .limit(1);
    if (existing.length > 0) {
      await db.delete(shortlists).where(eq(shortlists.id, existing[0].id));
      return { shortlisted: false };
    }
    try {
      await db.insert(shortlists).values({ org_id: orgId, singer_id: singerId });
      return { shortlisted: true };
    } catch (err: any) {
      if (err?.code === "23505") {
        return { shortlisted: true };
      }
      throw err;
    }
  }

  async getShortlistedSingerIds(orgId: number): Promise<number[]> {
    const rows = await db.select({ singer_id: shortlists.singer_id })
      .from(shortlists)
      .where(eq(shortlists.org_id, orgId));
    return rows.map(r => r.singer_id);
  }

  async getShortlistedSingersWithData(orgId: number): Promise<Singer[]> {
    const rows = await db.select({
      singer_id: shortlists.singer_id,
      created_at: shortlists.created_at,
    })
      .from(shortlists)
      .where(eq(shortlists.org_id, orgId))
      .orderBy(desc(shortlists.created_at));
    if (rows.length === 0) return [];
    const ids = [...new Set(rows.map(r => r.singer_id))];
    const singerRows = await db.select().from(singers).where(inArray(singers.id, ids));
    const orderMap: Record<number, Date | null> = {};
    for (const r of rows) orderMap[r.singer_id] = r.created_at;
    const sorted = singerRows.sort((a, b) => {
      const ta = orderMap[a.id]?.getTime() ?? 0;
      const tb = orderMap[b.id]?.getTime() ?? 0;
      return tb - ta;
    });
    return sorted.map(s => ({ ...s, shortlisted_at: orderMap[s.id] } as any));
  }

  async deleteShortlistsBySinger(singerId: number): Promise<void> {
    await db.delete(shortlists).where(eq(shortlists.singer_id, singerId));
  }

  async deleteShortlistsByOrg(orgId: number): Promise<void> {
    await db.delete(shortlists).where(eq(shortlists.org_id, orgId));
  }

  async getSingerCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(singers);
    return result.value;
  }

  async getOrganizationCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(organizations);
    return result.value;
  }

  async createAdminGift(data: { recipient_type: 'singer' | 'org'; recipient_id: number; duration_days: number; expires_at: Date; reason?: string | null }): Promise<AdminGift> {
    const [created] = await db.insert(adminGifts).values({
      recipient_type: data.recipient_type,
      recipient_id: data.recipient_id,
      gifted_by: 'admin',
      duration_days: data.duration_days,
      expires_at: data.expires_at,
      reason: data.reason ?? null,
    }).returning();
    return created;
  }

  async getAdminGifts(recipientType: 'singer' | 'org', recipientId: number): Promise<AdminGift[]> {
    return db.select().from(adminGifts)
      .where(and(eq(adminGifts.recipient_type, recipientType), eq(adminGifts.recipient_id, recipientId)))
      .orderBy(desc(adminGifts.created_at));
  }

  async createSearchLog(orgId: number, filters: any): Promise<void> {
    await db.insert(searchLogs).values({ org_id: orgId, search_filters: filters });
  }

  async getAdminStats(): Promise<{
    total_singers: number;
    founding_count: number;
    total_orgs: number;
    total_searches: number;
    total_contact_reveals: number;
  }> {
    const [singerCount] = await db.select({ value: count() }).from(singers);
    const [foundingCount] = await db.select({ value: count() }).from(singers).where(eq(singers.subscription_tier, 'founding'));
    const [orgCount] = await db.select({ value: count() }).from(organizations);
    const [searchCount] = await db.select({ value: count() }).from(searchLogs);
    const [revealCount] = await db.select({ value: count() }).from(contactReveals);
    return {
      total_singers: singerCount.value,
      founding_count: foundingCount.value,
      total_orgs: orgCount.value,
      total_searches: searchCount.value,
      total_contact_reveals: revealCount.value,
    };
  }

  async submitEngagementFeedback(feedback: InsertEngagementFeedback): Promise<EngagementFeedback> {
    const [created] = await db.insert(engagementFeedback).values(feedback).returning();
    return created;
  }

  async checkDuplicateFeedback(singerId: number, orgId: number, engagementDate: string): Promise<boolean> {
    const [existing] = await db.select({ id: engagementFeedback.id })
      .from(engagementFeedback)
      .where(and(
        eq(engagementFeedback.singer_id, singerId),
        eq(engagementFeedback.org_id, orgId),
        eq(engagementFeedback.engagement_date, engagementDate),
      ));
    return !!existing;
  }

  async recalculateReliabilityScore(singerId: number): Promise<void> {
    const feedback = await db.select().from(engagementFeedback).where(eq(engagementFeedback.singer_id, singerId));
    const totalGigs = feedback.length;
    const totalPossible = totalGigs * 3;
    const totalTrue = feedback.reduce((acc, f) =>
      acc + (f.was_prepared ? 1 : 0) + (f.was_professional ? 1 : 0) + (f.was_accurate ? 1 : 0), 0);
    const score = totalPossible > 0 ? Math.round((totalTrue / totalPossible) * 100) : 0;
    await db.update(singers).set({ reliability_score: score, total_gigs: totalGigs }).where(eq(singers.id, singerId));
  }

  async getFeedbackByOrg(orgId: number): Promise<EngagementFeedback[]> {
    return db.select().from(engagementFeedback).where(eq(engagementFeedback.org_id, orgId));
  }

  async searchSingers(filters: {
    voiceType?: string;
    startDate?: string;
    endDate?: string;
    composer?: string;
    roleOrWork?: string;
    workTitle?: string;
    role?: string;
    roleNames?: string[];
    workTitleForWorks?: string;
    roleVoiceType?: string;
    unionStatus?: string;
    represented?: string;
    emergencyMode?: boolean;
    performanceTypes?: string[];
    city?: string;
    searchLat?: number;
    searchLng?: number;
    radiusMiles?: number;
    language?: string;
    experienceLevel?: string;
    managedOnly?: string;
  }): Promise<(Singer & { roles: SingerRole[]; works: SingerWork[]; availabilities: Availability[]; distance_miles?: number | null })[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let index = 1;

    conditions.push(`s.admin_approved = true`);
    conditions.push(`s.subscription_status = 'active'`);

    if (filters.voiceType) {
      conditions.push(`LOWER(s.primary_voice_type) = LOWER($${index++})`);
      values.push(filters.voiceType);
    }

    if (filters.emergencyMode) {
      conditions.push(`s.is_emergency_ready = true`);
    }

    if (filters.unionStatus) {
      conditions.push(`s.union_status = $${index++}`);
      values.push(filters.unionStatus);
    }

    if (filters.represented) {
      conditions.push(`s.represented = $${index++}`);
      values.push(filters.represented === "true");
    }

    if (filters.managedOnly === "managed") {
      conditions.push(`s.is_managed = true`);
    } else if (filters.managedOnly === "unmanaged") {
      conditions.push(`(s.is_managed = false OR s.is_managed IS NULL)`);
    }

    const useGeo =
      typeof filters.searchLat === "number" &&
      typeof filters.searchLng === "number" &&
      Number.isFinite(filters.searchLat) &&
      Number.isFinite(filters.searchLng);
    let distanceExpr: string | null = null;
    if (useGeo) {
      const latIdx = index++;
      const lngIdx = index++;
      values.push(filters.searchLat);
      values.push(filters.searchLng);
      // Haversine, miles. 3959 = Earth radius in miles. Clamp acos arg to avoid NaN at antipode rounding.
      distanceExpr = `(3959 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians($${latIdx})) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians($${lngIdx})) + sin(radians($${latIdx})) * sin(radians(s.latitude))))))`;
      conditions.push(`s.latitude IS NOT NULL AND s.longitude IS NOT NULL`);
      const radius = typeof filters.radiusMiles === "number" && filters.radiusMiles > 0
        ? filters.radiusMiles
        : 50;
      conditions.push(`${distanceExpr} <= $${index++}`);
      values.push(radius);
    } else if (filters.city) {
      conditions.push(`s.city ILIKE $${index++}`);
      values.push(`%${filters.city}%`);
    }

    if (filters.language) {
      conditions.push(`$${index++} = ANY(s.languages_sung)`);
      values.push(filters.language);
    }

    if (filters.experienceLevel) {
      const depthValues = filters.experienceLevel === '1-2' ? ['1-2', '3-5', '6-10', '10+']
        : filters.experienceLevel === '3-5' ? ['3-5', '6-10', '10+']
        : filters.experienceLevel === '6-10' ? ['6-10', '10+']
        : ['10+'];
      conditions.push(`
        EXISTS (
          SELECT 1 FROM singer_roles r
          WHERE r.singer_id = s.id
          AND r.experience_depth = ANY($${index++}::text[])
        )
      `);
      values.push(depthValues);
    }

    if (filters.performanceTypes && filters.performanceTypes.length > 0) {
      conditions.push(`s.performance_types && $${index++}::text[]`);
      values.push(filters.performanceTypes);
    }

    if (filters.startDate && filters.endDate) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM availabilities a
          WHERE a.singer_id = s.id
          AND a.start_date <= $${index++}
          AND a.end_date >= $${index++}
        )
      `);
      values.push(filters.endDate);
      values.push(filters.startDate);
    }

    if (filters.roleOrWork) {
      const pattern = `%${filters.roleOrWork}%`;
      conditions.push(`
        (
          EXISTS (
            SELECT 1 FROM singer_roles r
            WHERE r.singer_id = s.id
            AND (r.role_name ILIKE $${index} OR r.work_title ILIKE $${index})
          )
          OR
          EXISTS (
            SELECT 1 FROM singer_works w
            WHERE w.singer_id = s.id
            AND w.work_title ILIKE $${index}
          )
        )
      `);
      values.push(pattern);
      index++;
    }

    if (filters.workTitle) {
      const pattern = `%${filters.workTitle}%`;
      conditions.push(`
        (
          EXISTS (
            SELECT 1 FROM singer_roles r
            WHERE r.singer_id = s.id
            AND r.work_title ILIKE $${index}
          )
          OR
          EXISTS (
            SELECT 1 FROM singer_works w
            WHERE w.singer_id = s.id
            AND w.work_title ILIKE $${index}
          )
        )
      `);
      values.push(pattern);
      index++;
    }

    if (filters.role) {
      const pattern = `%${filters.role}%`;
      conditions.push(`
        EXISTS (
          SELECT 1 FROM singer_roles r
          WHERE r.singer_id = s.id
          AND r.role_name ILIKE $${index}
        )
      `);
      values.push(pattern);
      index++;
    }

    if (filters.roleNames && filters.roleNames.length > 0) {
      if (filters.workTitleForWorks) {
        const rnIdx = index++;
        const wtIdx = index++;
        values.push(filters.roleNames);
        values.push(`%${filters.workTitleForWorks}%`);
        conditions.push(`
          (
            EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND LOWER(r.role_name) = ANY($${rnIdx}::text[]))
            OR EXISTS (SELECT 1 FROM singer_works w WHERE w.singer_id = s.id AND w.work_title ILIKE $${wtIdx})
          )
        `);
      } else {
        conditions.push(`
          EXISTS (
            SELECT 1 FROM singer_roles r
            WHERE r.singer_id = s.id
            AND LOWER(r.role_name) = ANY($${index++}::text[])
          )
        `);
        values.push(filters.roleNames);
      }
    }

    if (filters.composer) {
      const composerPattern = `%${filters.composer}%`;
      conditions.push(`
        (
          EXISTS (
            SELECT 1 FROM singer_roles r
            WHERE r.singer_id = s.id
            AND r.composer ILIKE $${index}
          )
          OR
          EXISTS (
            SELECT 1 FROM singer_works w
            WHERE w.singer_id = s.id
            AND w.composer ILIKE $${index}
          )
        )
      `);
      values.push(composerPattern);
      index++;
    }

    let orderClause: string;
    const orderValues: any[] = [];

    if (filters.emergencyMode) {
      orderClause = useGeo
        ? `ORDER BY is_emergency_ready DESC, distance_miles ASC NULLS LAST, emergency_lead_time_hours ASC, is_trending DESC, viewed_count DESC`
        : `ORDER BY is_emergency_ready DESC, emergency_lead_time_hours ASC, is_trending DESC, viewed_count DESC`;
    } else if (useGeo) {
      orderClause = `ORDER BY distance_miles ASC NULLS LAST, last_updated DESC NULLS LAST, total_gigs DESC, is_pro_verified DESC, last_name ASC, first_name ASC`;
    } else if (filters.roleVoiceType) {
      const rvIdx = index;
      orderValues.push(filters.roleVoiceType);
      orderClause = `ORDER BY CASE WHEN LOWER(primary_voice_type) = LOWER($${rvIdx}) THEN 0 ELSE 1 END, last_updated DESC NULLS LAST, total_gigs DESC, last_name ASC, first_name ASC`;
    } else {
      orderClause = `ORDER BY last_updated DESC NULLS LAST, total_gigs DESC, is_pro_verified DESC, last_name ASC, first_name ASC`;
    }

    const distanceSelect = useGeo ? `, ${distanceExpr} AS distance_miles` : `, NULL::double precision AS distance_miles`;

    const query = `
      SELECT * FROM (
        SELECT DISTINCT s.*${distanceSelect}
        FROM singers s
        WHERE ${conditions.join(" AND ")}
      ) AS matched
      ${orderClause}
      LIMIT 100
    `;

    const result = await pool.query(query, [...values, ...orderValues]);
    const singersFound = result.rows;
    if (singersFound.length === 0) return [];

    const ids = singersFound.map((s: any) => s.id);

    const [rolesResult, worksResult, availsResult] = await Promise.all([
      pool.query(`SELECT * FROM singer_roles WHERE singer_id = ANY($1::int[]) ORDER BY id ASC`, [ids]),
      pool.query(`SELECT * FROM singer_works WHERE singer_id = ANY($1::int[]) ORDER BY id ASC`, [ids]),
      pool.query(`SELECT * FROM availabilities WHERE singer_id = ANY($1::int[])`, [ids]),
    ]);

    const rolesBySinger: Record<number, SingerRole[]> = {};
    const worksBySinger: Record<number, SingerWork[]> = {};
    const availsBySinger: Record<number, Availability[]> = {};

    for (const r of rolesResult.rows) {
      if (!rolesBySinger[r.singer_id]) rolesBySinger[r.singer_id] = [];
      rolesBySinger[r.singer_id].push(r as SingerRole);
    }
    for (const w of worksResult.rows) {
      if (!worksBySinger[w.singer_id]) worksBySinger[w.singer_id] = [];
      worksBySinger[w.singer_id].push(w as SingerWork);
    }
    for (const a of availsResult.rows) {
      if (!availsBySinger[a.singer_id]) availsBySinger[a.singer_id] = [];
      availsBySinger[a.singer_id].push(a as Availability);
    }

    return singersFound.map((singer: any) => ({
      ...singer,
      distance_miles:
        singer.distance_miles != null ? Number(singer.distance_miles) : null,
      roles: rolesBySinger[singer.id] || [],
      works: worksBySinger[singer.id] || [],
      availabilities: availsBySinger[singer.id] || [],
    }));
  }

  async countSingers(filters: {
    voiceType?: string;
    startDate?: string;
    endDate?: string;
    composer?: string;
    roleOrWork?: string;
    workTitle?: string;
    role?: string;
    roleNames?: string[];
    workTitleForWorks?: string;
    roleVoiceType?: string;
    unionStatus?: string;
    represented?: string;
    emergencyMode?: boolean;
    performanceTypes?: string[];
    city?: string;
    language?: string;
    experienceLevel?: string;
    managedOnly?: string;
  }): Promise<number> {
    const conditions: string[] = [];
    const values: any[] = [];
    let index = 1;

    conditions.push(`s.admin_approved = true`);
    conditions.push(`s.subscription_status = 'active'`);

    if (filters.voiceType) {
      conditions.push(`LOWER(s.primary_voice_type) = LOWER($${index++})`);
      values.push(filters.voiceType);
    }
    if (filters.emergencyMode) {
      conditions.push(`s.is_emergency_ready = true`);
    }
    if (filters.unionStatus) {
      conditions.push(`s.union_status = $${index++}`);
      values.push(filters.unionStatus);
    }
    if (filters.represented) {
      conditions.push(`s.represented = $${index++}`);
      values.push(filters.represented === "true");
    }
    if (filters.managedOnly === "managed") {
      conditions.push(`s.is_managed = true`);
    } else if (filters.managedOnly === "unmanaged") {
      conditions.push(`(s.is_managed = false OR s.is_managed IS NULL)`);
    }
    if (filters.city) {
      conditions.push(`s.city ILIKE $${index++}`);
      values.push(`%${filters.city}%`);
    }
    if (filters.language) {
      conditions.push(`$${index++} = ANY(s.languages_sung)`);
      values.push(filters.language);
    }
    if (filters.experienceLevel) {
      const depthValues = filters.experienceLevel === '1-2' ? ['1-2', '3-5', '6-10', '10+']
        : filters.experienceLevel === '3-5' ? ['3-5', '6-10', '10+']
        : filters.experienceLevel === '6-10' ? ['6-10', '10+']
        : ['10+'];
      conditions.push(`
        EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND r.experience_depth = ANY($${index++}::text[]))
      `);
      values.push(depthValues);
    }
    if (filters.performanceTypes && filters.performanceTypes.length > 0) {
      conditions.push(`s.performance_types && $${index++}::text[]`);
      values.push(filters.performanceTypes);
    }
    if (filters.startDate && filters.endDate) {
      conditions.push(`
        EXISTS (SELECT 1 FROM availabilities a WHERE a.singer_id = s.id AND a.start_date <= $${index++} AND a.end_date >= $${index++})
      `);
      values.push(filters.endDate, filters.startDate);
    }
    if (filters.roleOrWork) {
      const pattern = `%${filters.roleOrWork}%`;
      conditions.push(`
        (EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND (r.role_name ILIKE $${index} OR r.work_title ILIKE $${index}))
        OR EXISTS (SELECT 1 FROM singer_works w WHERE w.singer_id = s.id AND w.work_title ILIKE $${index}))
      `);
      values.push(pattern);
      index++;
    }
    if (filters.workTitle) {
      const pattern = `%${filters.workTitle}%`;
      conditions.push(`
        (EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND r.work_title ILIKE $${index})
        OR EXISTS (SELECT 1 FROM singer_works w WHERE w.singer_id = s.id AND w.work_title ILIKE $${index}))
      `);
      values.push(pattern);
      index++;
    }
    if (filters.role) {
      const pattern = `%${filters.role}%`;
      conditions.push(`EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND r.role_name ILIKE $${index++})`);
      values.push(pattern);
    }
    if (filters.roleNames && filters.roleNames.length > 0) {
      if (filters.workTitleForWorks) {
        const rnIdx = index++;
        const wtIdx = index++;
        values.push(filters.roleNames);
        values.push(`%${filters.workTitleForWorks}%`);
        conditions.push(`
          (EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND LOWER(r.role_name) = ANY($${rnIdx}::text[]))
          OR EXISTS (SELECT 1 FROM singer_works w WHERE w.singer_id = s.id AND w.work_title ILIKE $${wtIdx}))
        `);
      } else {
        conditions.push(`EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND LOWER(r.role_name) = ANY($${index++}::text[]))`);
        values.push(filters.roleNames);
      }
    }
    if (filters.composer) {
      const cp = `%${filters.composer}%`;
      conditions.push(`
        (EXISTS (SELECT 1 FROM singer_roles r WHERE r.singer_id = s.id AND r.composer ILIKE $${index})
        OR EXISTS (SELECT 1 FROM singer_works w WHERE w.singer_id = s.id AND w.composer ILIKE $${index}))
      `);
      values.push(cp);
      index++;
    }

    const query = `SELECT COUNT(DISTINCT s.id) AS cnt FROM singers s WHERE ${conditions.join(" AND ")}`;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].cnt, 10) || 0;
  }

  async searchRepertoire(query: string, limit: number = 10, type?: 'work' | 'role', categories?: string[], workTitleFilter?: string, composerFilter?: string): Promise<RepertoireReference[]> {
    const q = (query || "").trim();
    const composer = (composerFilter || "").trim();
    if (q.length < 2 && composer.length < 2) return [];
    const pattern = q.length >= 2 ? `%${q}%` : `%`;
    const prefix = q.length >= 2 ? `${q}%` : `%`;
    const hasCategoryFilter = Array.isArray(categories) && categories.length > 0;
    const hasComposerFilter = composer.length >= 2;
    const composerPattern = `%${composer}%`;

    if (type === 'work') {
      const params: any[] = [pattern, limit];
      let composerClause = '';
      let categoryClause = '';
      if (hasComposerFilter) {
        params.push(composerPattern);
        composerClause = ` AND composer ILIKE $${params.length}`;
      }
      if (hasCategoryFilter) {
        params.push(categories);
        categoryClause = ` AND category = ANY($${params.length}::text[])`;
      }
      const sql = `SELECT DISTINCT ON (work_title, composer) id, work_title, composer, part_name, voice_type_primary, specialization, part_tier, category, created_at
         FROM repertoire_reference
         WHERE work_title ILIKE $1${composerClause}${categoryClause}
         ORDER BY work_title ASC, composer ASC
         LIMIT $2`;
      const result = await pool.query(sql, params);
      return result.rows as RepertoireReference[];
    }

    if (type === 'role') {
      const params: any[] = [pattern, prefix, limit];
      let workClause = '';
      let composerClause = '';
      let categoryClause = '';
      if (workTitleFilter && workTitleFilter.length > 0) {
        params.push(`%${workTitleFilter}%`);
        workClause = ` AND work_title ILIKE $${params.length}`;
      }
      if (hasComposerFilter) {
        params.push(composerPattern);
        composerClause = ` AND composer ILIKE $${params.length}`;
      }
      if (hasCategoryFilter) {
        params.push(categories);
        categoryClause = ` AND category = ANY($${params.length}::text[])`;
      }
      const sql = `SELECT id, work_title, composer, part_name, voice_type_primary, specialization, part_tier, category, created_at
         FROM repertoire_reference
         WHERE part_name ILIKE $1${workClause}${composerClause}${categoryClause}
         ORDER BY
           CASE WHEN part_name ILIKE $2 THEN 0 ELSE 1 END,
           part_name ASC,
           work_title ASC
         LIMIT $3`;
      const result = await pool.query(sql, params);
      return result.rows as RepertoireReference[];
    }

    const params: any[] = [pattern, prefix, limit];
    let composerClause = '';
    let categoryClause = '';
    if (hasComposerFilter) {
      params.push(composerPattern);
      composerClause = ` AND composer ILIKE $${params.length}`;
    }
    if (hasCategoryFilter) {
      params.push(categories);
      categoryClause = ` AND category = ANY($${params.length}::text[])`;
    }
    const sql = `SELECT id, work_title, composer, part_name, voice_type_primary, specialization, part_tier, category, created_at
       FROM repertoire_reference
       WHERE (work_title ILIKE $1 OR part_name ILIKE $1)${composerClause}${categoryClause}
       ORDER BY
         CASE
           WHEN work_title ILIKE $2 THEN 0
           WHEN part_name ILIKE $2 THEN 1
           WHEN work_title ILIKE $1 THEN 2
           ELSE 3
         END,
         work_title ASC,
         part_name ASC
       LIMIT $3`;
    const result = await pool.query(sql, params);
    return result.rows as RepertoireReference[];
  }

  async countSearchAppearances(singerId: number, days: number = 30): Promise<number> {
    const singer = await this.getSinger(singerId);
    if (!singer) return 0;
    const voiceType = singer.primary_voice_type || null;
    const city = singer.city || null;

    const rolesRes = await pool.query(
      `SELECT role_name, work_title FROM singer_roles WHERE singer_id = $1`,
      [singerId]
    );
    const worksRes = await pool.query(
      `SELECT work_title FROM singer_works WHERE singer_id = $1`,
      [singerId]
    );
    const roleNames = Array.from(new Set(
      rolesRes.rows.map((r: any) => (r.role_name || "").trim().toLowerCase()).filter(Boolean)
    ));
    const workTitles = Array.from(new Set([
      ...rolesRes.rows.map((r: any) => (r.work_title || "").trim().toLowerCase()),
      ...worksRes.rows.map((r: any) => (r.work_title || "").trim().toLowerCase()),
    ].filter(Boolean)));

    const result = await pool.query(
      `SELECT COUNT(*)::int AS cnt
       FROM search_logs
       WHERE created_at >= NOW() - ($1 || ' days')::interval
         AND (
           NULLIF(search_filters->>'voiceType', '') IS NULL
           OR ($2::text IS NOT NULL AND LOWER(search_filters->>'voiceType') = LOWER($2))
         )
         AND (
           NULLIF(search_filters->>'city', '') IS NULL
           OR ($3::text IS NOT NULL AND POSITION(LOWER($3) IN LOWER(search_filters->>'city')) > 0
               OR POSITION(LOWER(search_filters->>'city') IN LOWER($3)) > 0)
         )
         AND (
           (NULLIF(search_filters->>'role', '') IS NULL AND NULLIF(search_filters->>'workTitle', '') IS NULL AND NULLIF(search_filters->>'roleOrWork', '') IS NULL)
           OR ($4::text[] IS NOT NULL AND LOWER(COALESCE(search_filters->>'role', '')) = ANY($4))
           OR ($5::text[] IS NOT NULL AND LOWER(COALESCE(search_filters->>'workTitle', '')) = ANY($5))
           OR ($4::text[] IS NOT NULL AND LOWER(COALESCE(search_filters->>'roleOrWork', '')) = ANY($4))
           OR ($5::text[] IS NOT NULL AND LOWER(COALESCE(search_filters->>'roleOrWork', '')) = ANY($5))
         )`,
      [String(days), voiceType, city, roleNames.length ? roleNames : null, workTitles.length ? workTitles : null]
    );
    return Number(result.rows[0]?.cnt) || 0;
  }

  async createRepertoireSuggestion(data: InsertRepertoireSuggestion & { singer_id: number }): Promise<RepertoireSuggestion> {
    const [created] = await db.insert(repertoireSuggestions).values(data).returning();
    return created;
  }

  async listRepertoireSuggestions(): Promise<(RepertoireSuggestion & { singer_first_name: string | null; singer_last_name: string | null })[]> {
    const result = await pool.query(`
      SELECT rs.*, s.first_name AS singer_first_name, s.last_name AS singer_last_name
      FROM repertoire_suggestions rs
      LEFT JOIN singers s ON s.id = rs.singer_id
      ORDER BY rs.created_at DESC
    `);
    return result.rows as any;
  }
}

export const storage = new DatabaseStorage();
