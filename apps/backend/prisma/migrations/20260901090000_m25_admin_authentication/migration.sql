-- M25 — Admin Authentication for Audit-Log Endpoint
-- (docs/sprints/sprint-05.md, §4; Founder Decision G.2).
--
-- Adds the admin_user table backing the distinct admin-principal type
-- (schema.prisma's own AdminUser comment) admin-auth/admin-auth.service.ts
-- resolves a verified Firebase ID token against. Deliberately no grant
-- to natkhat_app_role and no Row-Level Security: this table is never
-- read through that RLS-subject role — admin-auth/prisma-client.provider.ts
-- uses the same non-RLS admin/migration connection (DATABASE_URL)
-- audit/prisma-client.provider.ts already established for
-- AuditController's reads, for the same reason (see that file's own
-- comment) — and admin_user carries no family_id to partition on in
-- the first place, so no family-scoped isolation concept applies here.

-- CreateTable
CREATE TABLE "admin_user" (
    "id" UUID NOT NULL,
    "auth_identity_ref" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_auth_identity_ref_key" ON "admin_user"("auth_identity_ref");
