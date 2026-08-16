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
}
