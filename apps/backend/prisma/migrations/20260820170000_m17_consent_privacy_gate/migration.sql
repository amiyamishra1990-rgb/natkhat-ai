-- M17 — Consent & Privacy Gate (Track A scaffold)
-- (docs/sprints/sprint-03.md, §4; ADR-0011;
-- docs/architecture/consent-architecture.md).
--
-- Part 1 (below, unmodified): schema DDL generated directly from
-- prisma/schema.prisma via `prisma migrate dev --create-only` against
-- the live local dev database (M14/M15/M16 already applied).
--
-- Part 2 (this file's own addition, mirroring the M16 migration's
-- structure): grants and Row-Level Security for consent_event.
-- natkhat_app_role already exists (created by M14); this file only
-- extends its grants to the one new table.

-- ============================================================
-- Part 1 — Schema (generated from prisma/schema.prisma)
-- ============================================================

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('child_account_creation', 'ai_companion_interaction', 'privacy_terms_update');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('granted', 'withdrawn', 'renewed');

-- CreateTable
CREATE TABLE "consent_event" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "child_id" UUID,
    "consenting_parent_id" UUID NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "privacy_terms_version" TEXT NOT NULL,
    "verification_method" TEXT,
    "verification_reference" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address_hash" TEXT,

    CONSTRAINT "consent_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_event_family_id_idx" ON "consent_event"("family_id");

-- CreateIndex
CREATE INDEX "consent_event_child_id_idx" ON "consent_event"("child_id");

-- AddForeignKey
ALTER TABLE "consent_event" ADD CONSTRAINT "consent_event_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_event" ADD CONSTRAINT "consent_event_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_event" ADD CONSTRAINT "consent_event_consenting_parent_id_fkey" FOREIGN KEY ("consenting_parent_id") REFERENCES "parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Part 2 — Grants for the existing request-serving role (ADR-0010 §7.4)
-- ============================================================
-- SELECT + INSERT only, no UPDATE, no DELETE — consent-architecture.md
-- §5.1: ConsentEvent rows are "never updated in place and never
-- deleted by a parent," the identical append-only guarantee the M16
-- migration already enforces this same way for audit_event. A change
-- in consent status is always a new row (consent.service.ts), never a
-- mutation of an existing one.
GRANT SELECT, INSERT ON "consent_event" TO "natkhat_app_role";

-- ============================================================
-- Part 3 — Row-Level Security for consent_event
-- ============================================================
-- family_id is the RLS partition key (consent-architecture.md §6.2:
-- "the RLS partition key, exactly as M3 §7 requires for every table
-- carrying child/family data — no new isolation model is introduced").
-- Same FOR ALL / family_id = current_family_claim shape as the M14
-- migration's own "child" and "co_parent_assignment" policies — see
-- that migration's Part 3 header for the full text-comparison
-- (never-cast-to-uuid) rationale, unchanged here.

ALTER TABLE "consent_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consent_event" FORCE ROW LEVEL SECURITY;

CREATE POLICY "family_tenant_isolation" ON "consent_event"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));
