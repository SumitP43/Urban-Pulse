import { FastifyRequest, FastifyReply } from 'fastify';
import { weatherService } from './weather.service.js';
import { currentWeatherQuerySchema, forecastWeatherQuerySchema } from './weather.schema.js';
import { sendSuccess } from '../../common/response.js';
import { ValidationError } from '../../common/errors.js';

export class WeatherController {
  async getCurrent(request: FastifyRequest, reply: FastifyReply) {
    const parsed = currentWeatherQuerySchema.safeParse(request.query || {});
    if (!parsed.success) {
      throw new ValidationError('Invalid weather query parameters', parsed.error.format());
    }

    const data = await weatherService.getCurrentWeather(parsed.data);
    return sendSuccess(reply, data);
  }

  async getForecast(request: FastifyRequest, reply: FastifyReply) {
    const parsed = forecastWeatherQuerySchema.safeParse(request.query || {});
    if (!parsed.success) {
      throw new ValidationError('Invalid weather forecast parameters', parsed.error.format());
    }

    const data = await weatherService.getWeatherForecast(parsed.data);
    return sendSuccess(reply, data);
  }
}

export const weatherController = new WeatherController();
