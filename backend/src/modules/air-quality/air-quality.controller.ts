import { FastifyRequest, FastifyReply } from 'fastify';
import { airQualityService } from './air-quality.service.js';
import { currentAirQualityQuerySchema, historicalAirQualityQuerySchema } from './air-quality.schema.js';
import { sendSuccess } from '../../common/response.js';
import { ValidationError } from '../../common/errors.js';

export class AirQualityController {
  async getCurrent(request: FastifyRequest, reply: FastifyReply) {
    const parsed = currentAirQualityQuerySchema.safeParse(request.query || {});
    if (!parsed.success) {
      throw new ValidationError('Invalid air quality query parameters', parsed.error.format());
    }

    const data = await airQualityService.getCurrentAirQuality(parsed.data);
    return sendSuccess(reply, data);
  }

  async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const parsed = historicalAirQualityQuerySchema.safeParse(request.query || {});
    if (!parsed.success) {
      throw new ValidationError('Invalid historical air quality query parameters', parsed.error.format());
    }

    const data = await airQualityService.getHistoricalAirQuality(parsed.data);
    return sendSuccess(reply, data);
  }
}

export const airQualityController = new AirQualityController();
