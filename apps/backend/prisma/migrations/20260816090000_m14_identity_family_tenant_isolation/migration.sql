-- M14 — Identity, Family & Tenant-Isolation Implementation
-- (docs/sprints/sprint-03.md, §4; ADR-0008; ADR-0010).
--
-- Part 1 (below, unmodified): schema DDL generated directly from
-- prisma/schema.prisma via `prisma migrate diff --from-empty
-- --to-schema-datamodel=prisma/schema.prisma --script` (no live
-- database connection required or used to produce it).
--
-- Part 2 (this file's own addition, ADR-0010 §7): Row-Level Security.
-- Prisma has no schema-language construct for RLS policies or
-- non-superuser roles, so this part is hand-authored raw SQL appended
-- to the same migration, applied atomically with the schema it
-- protects -- per M14's own header note in docs/sprints/sprint-03.md,
-- §4: "RLS ... ship[s] in the same change as the schema, not after."

-- ============================================================
-- Part 1 — Schema (generated from prisma/schema.prisma)
-- ============================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ParentStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "ChildStatus" AS ENUM ('active', 'deleted');

-- CreateEnum
CREATE TYPE "CoParentAssignmentStatus" AS ENUM ('active', 'revoked');

-- CreateEnum
CREATE TYPE "SessionPrincipalType" AS ENUM ('Parent', 'Child');

-- CreateTable
CREATE TABLE "parent" (
    "id" UUID NOT NULL,
    "auth_identity_ref" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ParentStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family" (
    "id" UUID NOT NULL,
    "owning_parent_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FamilyStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "avatar_ref" TEXT,
    "created_by_parent_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ChildStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_parent_assignment" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "invited_by_parent_id" UUID NOT NULL,
    "permission_scope" TEXT NOT NULL,
    "status" "CoParentAssignmentStatus" NOT NULL DEFAULT 'active',
    "revoked_at" TIMESTAMPTZ,
    "revoked_by_parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "co_parent_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "device_label" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "first_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "principal_id" UUID NOT NULL,
    "principal_type" "SessionPrincipalType" NOT NULL,
    "family_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ,
    "end_reason" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "family_owning_parent_id_idx" ON "family"("owning_parent_id");

-- CreateIndex
CREATE INDEX "child_family_id_idx" ON "child"("family_id");

-- CreateIndex
CREATE INDEX "co_parent_assignment_family_id_idx" ON "co_parent_assignment"("family_id");

-- CreateIndex
CREATE INDEX "co_parent_assignment_parent_id_idx" ON "co_parent_assignment"("parent_id");

-- CreateIndex
CREATE INDEX "device_parent_id_idx" ON "device"("parent_id");

-- CreateIndex
CREATE INDEX "session_principal_id_idx" ON "session"("principal_id");

-- CreateIndex
CREATE INDEX "session_family_id_idx" ON "session"("family_id");

-- AddForeignKey
ALTER TABLE "family" ADD CONSTRAINT "family_owning_parent_id_fkey" FOREIGN KEY ("owning_parent_id") REFERENCES "parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child" ADD CONSTRAINT "child_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child" ADD CONSTRAINT "child_created_by_parent_id_fkey" FOREIGN KEY ("created_by_parent_id") REFERENCES "parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_parent_assignment" ADD CONSTRAINT "co_parent_assignment_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_parent_assignment" ADD CONSTRAINT "co_parent_assignment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_parent_assignment" ADD CONSTRAINT "co_parent_assignment_invited_by_parent_id_fkey" FOREIGN KEY ("invited_by_parent_id") REFERENCES "parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_parent_assignment" ADD CONSTRAINT "co_parent_assignment_revoked_by_parent_id_fkey" FOREIGN KEY ("revoked_by_parent_id") REFERENCES "parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Part 2 — Request-serving application role (ADR-0010, §7.4)
-- ============================================================
-- PostgreSQL superusers always bypass RLS regardless of FORCE ROW
-- LEVEL SECURITY (this is not configurable). The only connection role
-- configured anywhere in this repository today (`postgres`, per
-- apps/backend/.env.example and .github/workflows/ci.yml's Postgres
-- service container) is that superuser. ADR-0010 §7.4 requires "no
-- request-serving database role may hold BYPASSRLS" -- satisfying
-- that requirement, and making RLS enforcement provable at all,
-- requires a second, non-superuser, non-BYPASSRLS role distinct from
-- the admin/migration role. This is that role. Local-development-only
-- placeholder credential, matching this repository's existing
-- `postgres`/`postgres` local-dev convention (apps/backend/.env.example)
-- -- not a production secret.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'natkhat_app_role') THEN
    CREATE ROLE "natkhat_app_role"
      LOGIN
      PASSWORD 'natkhat_app_role'
      NOSUPERUSER
      NOBYPASSRLS
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO "natkhat_app_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON
  "parent", "family", "child", "co_parent_assignment", "device", "session"
  TO "natkhat_app_role";

-- ============================================================
-- Part 3 — Row-Level Security (ADR-0010, §7; data-classification-and-
-- isolation.md, §7.2)
-- ============================================================
-- FORCE (not only ENABLE) is required on every table per §7.4 -- FORCE
-- additionally applies RLS to the table's own owning role, closing the
-- misconfiguration where an application's database role is also the
-- table owner and therefore silently exempt from its own policies.
--
-- Every policy compares its partition/principal column to the claim
-- as TEXT (`column::text = current_setting(..., true)`), never by
-- casting the claim itself to uuid. This is a deliberate fix (found
-- via a live-Postgres CI integration run, not a hypothetical): a
-- pooled/reused connection's custom GUC placeholder (app.current_*)
-- resets to '' -- not NULL -- once any earlier transaction on that
-- same connection has set it, even under SET LOCAL/set_config(...,
-- true) scoping. Casting an absent/invalid claim to uuid
-- (`current_setting(...)::uuid`) then throws `invalid input syntax
-- for type uuid`, turning "no valid claim" into a hard error instead
-- of the required zero-row result. Text comparison never throws for
-- any input -- NULL, '', or garbage text all simply fail to equal a
-- real row's id/family_id/parent_id (all NOT NULL UUID columns, so
-- '' can never legitimately match) -- so an absent/invalid claim
-- fails closed with zero rows, exactly matching
-- data-classification-and-isolation.md, §8, Scenario 2's specified
-- behavior ("returns zero rows by default"), not a thrown error.
--
-- `app.current_principal_id` / `app.current_family_id` are the two
-- session-scoped claims this design consumes. §7.3 names
-- `current_family_claim` (mapped here to `app.current_family_id`,
-- matching the illustrative example in data-classification-and-
-- isolation.md, §7.2 verbatim) as "the active family context of the
-- caller's current, already-authorized Session," sourced from
-- whichever mechanism the ADR-0005/M15 implementation ultimately uses
-- (JWT claim or an application-issued `SET LOCAL`/`set_config`) --
-- that wiring is M15's scope, not M14's. `app.current_principal_id`
-- (the authenticated principal's own id) is this document's own
-- naming, applying the same session-GUC pattern §7.3 already
-- established for `current_family_claim` to the doc's separate,
-- already-named `current_principal` concept (§7.2's Family/Device/
-- Session policy rows) -- no new isolation concept is introduced,
-- only a concrete session-variable name for one already-specified.

ALTER TABLE "parent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parent" FORCE ROW LEVEL SECURITY;

ALTER TABLE "family" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family" FORCE ROW LEVEL SECURITY;

ALTER TABLE "child" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "child" FORCE ROW LEVEL SECURITY;

ALTER TABLE "co_parent_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "co_parent_assignment" FORCE ROW LEVEL SECURITY;

ALTER TABLE "device" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "device" FORCE ROW LEVEL SECURITY;

ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" FORCE ROW LEVEL SECURITY;

-- `parent`: not Family-partitioned (data-classification-and-isolation.md,
-- §6.2 -- "standard principal-ownership access control... a Parent may
-- read/update their own row, matched against their authenticated
-- identity... not designed further in this document"). This policy is
-- the direct, minimal translation of that stated intent.
CREATE POLICY "self_row_access" ON "parent"
  FOR ALL
  USING ("id"::text = current_setting('app.current_principal_id', true))
  WITH CHECK ("id"::text = current_setting('app.current_principal_id', true));

-- `family`: §7.2 -- owner OR an active co-parent assignment for this
-- family. WITH CHECK is owner-only: family creation/ownership mutation
-- is not a co-parent-permitted action anywhere in the approved design
-- (ADR-0008 Decision item 3 -- ownership is non-transferable).
CREATE POLICY "family_tenant_isolation" ON "family"
  FOR ALL
  USING (
    "owning_parent_id"::text = current_setting('app.current_principal_id', true)
    OR EXISTS (
      SELECT 1 FROM "co_parent_assignment" cpa
      WHERE cpa."family_id" = "family"."id"
        AND cpa."parent_id"::text = current_setting('app.current_principal_id', true)
        AND cpa."status" = 'active'
    )
  )
  WITH CHECK ("owning_parent_id"::text = current_setting('app.current_principal_id', true));

-- `child`: §7.2's own worked/illustrative example, applied verbatim.
CREATE POLICY "family_tenant_isolation" ON "child"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));

-- `co_parent_assignment`: §7.2 -- family_id = current_family_claim.
-- Fine-grained "can this co-parent see other co-parents' rows" is
-- explicitly an application-layer, permission_scope-level concern
-- (§7.1) -- not filtered further here.
CREATE POLICY "family_tenant_isolation" ON "co_parent_assignment"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));

-- `device`: §6.1 -- Parent-scoped, not Family-scoped (module doc, §3.6:
-- "a co-parent's device list is theirs to manage, not shared inventory").
CREATE POLICY "parent_scoped_isolation" ON "device"
  FOR ALL
  USING ("parent_id"::text = current_setting('app.current_principal_id', true))
  WITH CHECK ("parent_id"::text = current_setting('app.current_principal_id', true));

-- `session`: §6.1 -- row *visibility* is Parent-scoped via principal_id,
-- not family_id, even though family_id remains present as a plain
-- column for the future M15 authorization check to consume (§7.2).
CREATE POLICY "principal_scoped_isolation" ON "session"
  FOR ALL
  USING ("principal_id"::text = current_setting('app.current_principal_id', true))
  WITH CHECK ("principal_id"::text = current_setting('app.current_principal_id', true));

-- Every table above has exactly one FOR ALL policy, so SELECT/INSERT/
-- UPDATE/DELETE are all covered (§7.4) -- no command is left to the
-- fail-closed "RLS enabled, no policy, deny everything" default,
-- which is itself correct behavior but not the intended one here.
