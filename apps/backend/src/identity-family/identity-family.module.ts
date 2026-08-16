import { Module } from '@nestjs/common';
import { prismaClientProvider } from './prisma-client.provider';
import { ParentRepository } from './repositories/parent.repository';
import { FamilyRepository } from './repositories/family.repository';
import { ChildRepository } from './repositories/child.repository';
import { CoParentAssignmentRepository } from './repositories/co-parent-assignment.repository';
import { DeviceRepository } from './repositories/device.repository';
import { SessionRepository } from './repositories/session.repository';

// M14 — Identity, Family & Tenant-Isolation Implementation
// (docs/sprints/sprint-03.md, §4). Repository-layer providers only —
// no controller, no HTTP surface (explicit M14 exclusion).
@Module({
  providers: [
    prismaClientProvider,
    ParentRepository,
    FamilyRepository,
    ChildRepository,
    CoParentAssignmentRepository,
    DeviceRepository,
    SessionRepository,
  ],
  exports: [
    ParentRepository,
    FamilyRepository,
    ChildRepository,
    CoParentAssignmentRepository,
    DeviceRepository,
    SessionRepository,
  ],
})
export class IdentityFamilyModule {}
