import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import axiosRetry from 'axios-retry';
import { setupCache } from 'axios-cache-interceptor';
import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

const instance = Axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/',
  timeout: 5000,
});

const axios = setupCache(instance, {
  // cache same requests for 1 hour
  ttl: 60 * 60 * 1000,
});

// retry up to 3 times if request fails
axiosRetry(axios, { retries: 3 });

// zod keeps our data types safe, throw clear error messages if some type is wrong
const WeatherResponseSchema = z.object({
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
  }),
  visibility: z.number(),
  wind: z.object({
    speed: z.number(),
  }),
  clouds: z.object({
    all: z.number(),
  }),
});

const TEMPERATURE_FROM_KELVIN_VALUE = 273.15;

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {
    axios.interceptors.request.use((request) => {
      request.params = request.params || {};
      request.params.appid = this.configService.get('WEATHER_API_KEY');

      return request;
    });
  }

  private getTemperatureInCelsius(kelvin: number) {
    return Number((kelvin - TEMPERATURE_FROM_KELVIN_VALUE).toFixed(2));
  }

  private getTemperatureInFahrenheit(kelvin: number) {
    return Number(((kelvin - TEMPERATURE_FROM_KELVIN_VALUE) * 1.8 + 32).toFixed(2));
  }

  private getWindSpeedInKilometersPerHour(metersPerSecond: number) {
    return Number((metersPerSecond * 3.6).toFixed(2));
  }

  async findWeatherByCityName(query: string) {
    const queryURI = encodeURIComponent(query);

    const { data } = await axios.get('/weather', {
      params: {
        q: queryURI,
      },
    });

    const weatherData = WeatherResponseSchema.parse(data);

    return {
      celcius: {
        temperature: this.getTemperatureInCelsius(weatherData.main.temp),
        sensedTemperature: this.getTemperatureInCelsius(weatherData.main.feels_like),
        minTemperature: this.getTemperatureInCelsius(weatherData.main.temp_min),
        maxTemperature: this.getTemperatureInCelsius(weatherData.main.temp_max),
      },
      fahrenheit: {
        temperature: this.getTemperatureInFahrenheit(weatherData.main.temp),
        sensedTemperature: this.getTemperatureInFahrenheit(weatherData.main.feels_like),
        minTemperature: this.getTemperatureInFahrenheit(weatherData.main.temp_min),
        maxTemperature: this.getTemperatureInFahrenheit(weatherData.main.temp_max),
      },
      pressure: weatherData.main.pressure,
      humidity: weatherData.main.humidity,
      visibility: weatherData.visibility,
      windSpeedKmPerHour: this.getWindSpeedInKilometersPerHour(weatherData.wind.speed),
      cloudiness: weatherData.clouds.all,
    };
  }
}
