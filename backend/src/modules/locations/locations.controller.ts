import { FastifyRequest, FastifyReply } from 'fastify';
import { locationsService } from './locations.service.js';
import {
  createLocationSchema,
  updateLocationSchema,
  nearbyQuerySchema,
  bboxQuerySchema,
  nearestQuerySchema,
  listLocationsQuerySchema,
} from './locations.schema.js';
import { sendSuccess } from '../../common/response.js';
import { ValidationError } from '../../common/errors.js';

export class LocationsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createLocationSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid location creation data', parsed.error.format());
    }

    const created = await locationsService.createLocation(parsed.data);
    return sendSuccess(reply, created, undefined, 201);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const location = await locationsService.getLocationById(id);
    return sendSuccess(reply, location);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = updateLocationSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid location update data', parsed.error.format());
    }

    const updated = await locationsService.updateLocation(id, parsed.data);
    return sendSuccess(reply, updated);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await locationsService.deleteLocation(id);
    return sendSuccess(reply, { message: `Location ${id} soft-deleted successfully` });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const parsed = listLocationsQuerySchema.safeParse(request.query || {});
    if (!parsed.success) {
      throw new ValidationError('Invalid query parameters', parsed.error.format());
    }

    const result = await locationsService.listLocations(parsed.data);
    return sendSuccess(reply, result.locations, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  async nearby(request: FastifyRequest, reply: FastifyReply) {
    const parsed = nearbyQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid nearby coordinates or radius', parsed.error.format());
    }

    const geoJson = await locationsService.findNearbyGeoJson(
      parsed.data.latitude,
      parsed.data.longitude,
      parsed.data.radiusMeters
    );
    return sendSuccess(reply, geoJson);
  }

  async bbox(request: FastifyRequest, reply: FastifyReply) {
    const parsed = bboxQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid bounding box envelope', parsed.error.format());
    }

    const geoJson = await locationsService.findInBBoxGeoJson(
      parsed.data.minLng,
      parsed.data.minLat,
      parsed.data.maxLng,
      parsed.data.maxLat
    );
    return sendSuccess(reply, geoJson);
  }

  async nearest(request: FastifyRequest, reply: FastifyReply) {
    const parsed = nearestQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid nearest query coordinates', parsed.error.format());
    }

    const nearest = await locationsService.findNearest(
      parsed.data.latitude,
      parsed.data.longitude,
      parsed.data.limit
    );
    return sendSuccess(reply, nearest);
  }
}

export const locationsController = new LocationsController();
