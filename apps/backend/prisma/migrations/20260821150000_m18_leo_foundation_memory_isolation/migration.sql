-- M18 — Leo Foundation & Memory Isolation (Track A: schema, RLS,
-- cross-child application-layer isolation, and a dev-only crypto
-- stopgap; docs/sprints/sprint-03.md, §4; ADR-0012;
-- docs/architecture/ai-memory-isolation.md).
--
-- Part 1 (below, unmodified): schema DDL generated directly from
-- prisma/schema.prisma via `prisma migrate dev --create-only` against
-- the live local dev database (M14-M17 already applied).
--
-- Part 2 (this file's own addition, mirroring the M14/M16/M17
-- migrations' structure): grants for the existing request-serving
-- role. Unlike M16's audit_event/M17's consent_event (append-only,
-- SELECT/INSERT-only), conversation/message/leo_memory also need
-- UPDATE — Conversation.status/last_message_at, Message.status
-- (soft-delete), and LeoMemory.memory_class (supersession
-- reassignment, §5.1) are all updated in place by design, only the
-- Tier-3 content columns themselves are never updated after INSERT.
-- family_encryption_key gets NO grant at all — see its own comment
-- below.
--
-- Part 3: Row-Level Security, filling in the exact placeholder row
-- M14's migration (via data-classification-and-isolation.md §7.2)
-- already reserved for "Tier 3/4 tables (prospective, Milestone 6)" —
-- same family_id = current_family_claim shape as every other
-- family-partitioned table, no new isolation concept. Cross-child
-- isolation (§7.4) is NOT expressed here — per §7.6's recorded
-- residual-risk observation, no child-scoped session claim exists in
-- the current M1/M2 session model, so that boundary is enforced only
-- at the application layer, in leo/leo.service.ts — see that file's
-- comments, not this migration, for that mechanism.

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('child', 'leo');

-- CreateEnum
CREATE TYPE "LeoMemoryClass" AS ENUM ('active_relationship', 'version_history', 'permanent_vault');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'deleted');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('active', 'deleted');

-- CreateEnum
CREATE TYPE "LeoMemoryStatus" AS ENUM ('active', 'deleted');

-- CreateTable
CREATE TABLE "family_encryption_key" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "wrapped_dek" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_encryption_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ConversationStatus" NOT NULL DEFAULT 'active',
    "deleted_at" TIMESTAMPTZ,
    "hard_deleted_at" TIMESTAMPTZ,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "content" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MessageStatus" NOT NULL DEFAULT 'active',
    "deleted_at" TIMESTAMPTZ,
    "hard_deleted_at" TIMESTAMPTZ,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leo_memory" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "memory_class" "LeoMemoryClass" NOT NULL,
    "content" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supersedes_memory_id" UUID,
    "vaulted_from_memory_id" UUID,
    "vaulted_at" TIMESTAMPTZ,
    "vaulted_by_parent_id" UUID,
    "status" "LeoMemoryStatus" NOT NULL DEFAULT 'active',
    "deleted_at" TIMESTAMPTZ,
    "hard_deleted_at" TIMESTAMPTZ,

    CONSTRAINT "leo_memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "family_encryption_key_family_id_key" ON "family_encryption_key"("family_id");

-- CreateIndex
CREATE INDEX "conversation_family_id_idx" ON "conversation"("family_id");

-- CreateIndex
CREATE INDEX "conversation_child_id_idx" ON "conversation"("child_id");

-- CreateIndex
CREATE INDEX "message_conversation_id_idx" ON "message"("conversation_id");

-- CreateIndex
CREATE INDEX "message_family_id_idx" ON "message"("family_id");

-- CreateIndex
CREATE INDEX "message_child_id_idx" ON "message"("child_id");

-- CreateIndex
CREATE INDEX "leo_memory_family_id_idx" ON "leo_memory"("family_id");

-- CreateIndex
CREATE INDEX "leo_memory_child_id_idx" ON "leo_memory"("child_id");

-- AddForeignKey
ALTER TABLE "family_encryption_key" ADD CONSTRAINT "family_encryption_key_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leo_memory" ADD CONSTRAINT "leo_memory_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leo_memory" ADD CONSTRAINT "leo_memory_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leo_memory" ADD CONSTRAINT "leo_memory_vaulted_by_parent_id_fkey" FOREIGN KEY ("vaulted_by_parent_id") REFERENCES "parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leo_memory" ADD CONSTRAINT "leo_memory_supersedes_memory_id_fkey" FOREIGN KEY ("supersedes_memory_id") REFERENCES "leo_memory"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "leo_memory" ADD CONSTRAINT "leo_memory_vaulted_from_memory_id_fkey" FOREIGN KEY ("vaulted_from_memory_id") REFERENCES "leo_memory"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ============================================================
-- Part 2 — Grants for the existing request-serving role (ADR-0010 §7.4)
-- ============================================================
-- natkhat_app_role already exists (created by the M14 migration) —
-- this only extends its grants to the four new tables.
GRANT SELECT, INSERT, UPDATE ON "conversation", "message", "leo_memory" TO "natkhat_app_role";

-- family_encryption_key: deliberately NO grant of any kind to
-- natkhat_app_role. Key material (a wrapped per-Family DEK) is never
-- read or written through the RLS-bounded, request-serving role —
-- only this module's own admin-role Prisma client
-- (leo/prisma-client.provider.ts, the same self-contained-provider
-- pattern audit/consent already established) ever touches this table.
-- Withholding every grant means that even if a future application bug
-- routed a query through natkhat_app_role, Postgres itself refuses it
-- — a structural backstop, not merely a code-review convention.

-- ============================================================
-- Part 3 — Row-Level Security for conversation/message/leo_memory
-- ============================================================
-- Same text-comparison convention as every prior migration (never
-- casts the claim to uuid — see the M14 migration's Part 3 header for
-- the full fail-closed rationale, unchanged here).

ALTER TABLE "conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation" FORCE ROW LEVEL SECURITY;

ALTER TABLE "message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message" FORCE ROW LEVEL SECURITY;

ALTER TABLE "leo_memory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leo_memory" FORCE ROW LEVEL SECURITY;

CREATE POLICY "family_tenant_isolation" ON "conversation"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));

CREATE POLICY "family_tenant_isolation" ON "message"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));

CREATE POLICY "family_tenant_isolation" ON "leo_memory"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));

-- family_encryption_key: RLS is forced here too, as defense-in-depth
-- consistent with ADR-0006 §16's "every table containing child or
-- family data must carry a family/tenant identifier" — even though
-- Part 2 already withholds every grant, so no natkhat_app_role query
-- can reach this table regardless of whether a policy exists.
ALTER TABLE "family_encryption_key" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_encryption_key" FORCE ROW LEVEL SECURITY;

CREATE POLICY "family_tenant_isolation" ON "family_encryption_key"
  FOR ALL
  USING ("family_id"::text = current_setting('app.current_family_id', true))
  WITH CHECK ("family_id"::text = current_setting('app.current_family_id', true));
