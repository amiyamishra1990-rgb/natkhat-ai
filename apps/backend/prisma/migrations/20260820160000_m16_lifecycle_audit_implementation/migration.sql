-- M16 — Data Lifecycle & Auditability Implementation
-- (docs/sprints/sprint-03.md, §4; ADR-0015; docs/architecture/data-lifecycle.md;
-- docs/architecture/audit-logging.md).
--
-- Part 1 (below, unmodified): schema DDL generated directly from
-- prisma/schema.prisma via `prisma migrate dev --create-only` against
-- the live local dev database (no shadow-DB diff-from-empty this time,
-- since the M14/M15 migrations must already be applied) -- adds
-- Parent/Family/Child's deleted_at/hard_deleted_at columns (ADR-0015
-- §4's flagged gap) and the new audit_event table
-- (docs/architecture/audit-logging.md §3).
--
-- Part 2 (this file's own addition, mirroring the M14 migration's
-- structure): grants and Row-Level Security for audit_event. Parts 2/3
-- of the M14 migration already created natkhat_app_role and enabled
-- RLS on the six M14 tables -- this file only adds the one new table's
-- grant and policy, it does not recreate the role or touch the
-- existing six tables' policies.

-- ============================================================
-- Part 1 — Schema (generated from prisma/schema.prisma)
-- ============================================================

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('conversation_message_accessed', 'leo_memory_viewed', 'leo_memory_corrected', 'leo_memory_vaulted', 'leo_memory_deleted', 'conversation_deleted', 'data_export_requested', 'child_deleted', 'family_deleted', 'account_deleted', 'deletion_completed', 'coparent_invited', 'coparent_revoked', 'family_switch', 'share_link_created', 'share_link_revoked', 'share_link_accessed');

-- CreateEnum
CREATE TYPE "AuditActorRole" AS ENUM ('owner', 'co_parent', 'child');

-- CreateEnum
CREATE TYPE "AuditTargetType" AS ENUM ('Conversation', 'Message', 'LeoMemory', 'Child', 'Family', 'Parent', 'CoParentAssignment', 'ShareLink', 'Export');

-- AlterTable
ALTER TABLE "child" ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "hard_deleted_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "family" ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "hard_deleted_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "parent" ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "hard_deleted_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL,
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" "AuditEventType" NOT NULL,
    "actor_principal_id" UUID,
    "actor_principal_type" "SessionPrincipalType",
    "actor_role_at_time" "AuditActorRole",
    "family_id" UUID,
    "child_id" UUID,
    "target_type" "AuditTargetType" NOT NULL,
    "target_id" UUID,
    "metadata" JSONB,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_event_family_id_idx" ON "audit_event"("family_id");

-- CreateIndex
CREATE INDEX "audit_event_actor_principal_id_idx" ON "audit_event"("actor_principal_id");

-- CreateIndex
CREATE INDEX "audit_event_occurred_at_idx" ON "audit_event"("occurred_at");

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_principal_id_fkey" FOREIGN KEY ("actor_principal_id") REFERENCES "parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Part 2 — Grants for the existing request-serving role (ADR-0010 §7.4)
-- ============================================================
-- natkhat_app_role already exists (created by the M14 migration) --
-- this only extends its grants to the one new table. Deliberately
-- SELECT + INSERT only, no UPDATE, no DELETE: Tier 5 is append-only
-- and never mutated/deleted by application-layer logic (ADR-0006 §22;
-- data-lifecycle.md §11) -- withholding UPDATE/DELETE at the grant
-- level enforces that structurally for whatever future code path ends
-- up serving real requests through this role, not merely by service-
-- code convention. The retention-expiry purge
-- (audit/audit.service.ts's purgeExpiredEvents) is a cross-tenant
-- system sweep with no single family_id/principal_id claim to scope
-- it to -- like lifecycle/lifecycle.service.ts's hard-delete sweep, it
-- runs via the trusted admin connection (DATABASE_URL), the same
-- connection every M14/M15/M16 service already uses, not through this
-- RLS-bound role.
GRANT SELECT, INSERT ON "audit_event" TO "natkhat_app_role";

-- ============================================================
-- Part 3 — Row-Level Security for audit_event
-- ============================================================
-- audit-logging.md §8.2 explicitly takes "no position" between a
-- principal_id-based partition and a family_id-based partition for
-- Tier 5, and records the exact tension: a pure principal_id partition
-- (like Device/Session) cannot satisfy §7's share_link_accessed
-- requirement ("the creating parent must see another party's access,
-- not their own"), while a pure family_id partition cannot show a
-- family-less event like account_deleted to anyone. This is recorded
-- there as an open *engineering* question (§12, item 3 -- "left to a
-- future implementation-stage design," explicitly not a founder/legal
-- gate) -- this migration is that implementation-stage resolution,
-- made and documented here rather than silently assumed, per this
-- repository's flag-don't-silently-resolve discipline (the same
-- discipline the M15 co-parent permission-scope correction followed).
--
-- Resolution: a hybrid policy, OR-ing both candidates the doc names --
-- visible if EITHER the row's family_id matches the caller's current
-- family claim OR the row's actor_principal_id matches the caller's
-- own principal claim. This satisfies both real requirements at once:
-- a parent scoped to a family can see every family-scoped event for
-- it (including another principal's share_link_accessed against that
-- family, per §7), and a parent can always see their own actions even
-- when an event has no single family (account_deleted spans every
-- family they own/co-parent, so it is deliberately stored with
-- family_id = NULL -- see lifecycle/lifecycle.service.ts). No third
-- column or hybrid partition scheme is introduced; this is the same
-- two claims (app.current_family_id, app.current_principal_id) M14
-- already established, combined with OR rather than a new concept.
--
-- Same text-comparison convention as the M14 migration (never casts
-- the claim to uuid, so an absent/invalid claim fails closed with zero
-- rows rather than throwing -- see that migration's Part 3 header for
-- the full rationale).

ALTER TABLE "audit_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_event" FORCE ROW LEVEL SECURITY;

CREATE POLICY "family_or_actor_scoped_isolation" ON "audit_event"
  FOR ALL
  USING (
    "family_id"::text = current_setting('app.current_family_id', true)
    OR "actor_principal_id"::text = current_setting('app.current_principal_id', true)
  )
  WITH CHECK (
    "family_id"::text = current_setting('app.current_family_id', true)
    OR "actor_principal_id"::text = current_setting('app.current_principal_id', true)
  );
