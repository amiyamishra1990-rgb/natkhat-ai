import { Inject, Injectable } from '@nestjs/common';
import { Device } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.6. No API surface (M14 exclusion) — repository-layer
// only. deviceType/status are plain strings, not enums (see
// prisma/schema.prisma's comment — the module doc names these fields
// without an enumerated value set).
@Injectable()
export class DeviceRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    parentId: string;
    deviceLabel: string;
    deviceType: string;
    status: string;
  }): Promise<Device> {
    return this.prisma.device.create({ data });
  }

  findMany(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  // M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §7.3) — account
  // deletion's "this Parent's own Device inventory — soft-deleted/
  // removed entirely" step.
  findByParentId(parentId: string): Promise<Device[]> {
    return this.prisma.device.findMany({ where: { parentId } });
  }

  // Device.status is a plain string (schema.prisma's own comment — no
  // enumerated value set given by the module doc), so this sets the
  // same 'deleted' convention Parent/Family/Child's status enums
  // already use, rather than inventing a different value for this one
  // table.
  markDeleted(id: string): Promise<Device> {
    return this.prisma.device.update({ where: { id }, data: { status: 'deleted' } });
  }
}
