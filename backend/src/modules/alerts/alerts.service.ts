import { prisma } from '../../database/prisma.js';
import { AlertStatus } from '../../common/types.js';
import { NotFoundError } from '../../common/errors.js';

export class AlertsService {
  async getAlerts(filter?: { status?: AlertStatus; locationId?: string }) {
    return prisma.alert.findMany({
      where: {
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.locationId ? { locationId: filter.locationId } : {}),
      },
      include: {
        location: {
          select: { id: true, name: true, state: true, latitude: true, longitude: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async updateAlertStatus(id: string, status: AlertStatus) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundError(`Alert with ID ${id} not found`);
    }

    return prisma.alert.update({
      where: { id },
      data: { status },
    });
  }
}

export const alertsService = new AlertsService();
