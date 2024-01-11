import {
  BadGatewayException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import Axios from 'axios';

import { AppService } from './app.service';
import { WeatherQueryDto } from './models/weather-query.dto';

@Controller('/weather')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findWeatherByCityName(@Query() queryDto: WeatherQueryDto) {
    try {
      return await this.appService.findWeatherByCityName(queryDto.query);
    } catch (error) {
      if (Axios.isAxiosError(error)) {
        if (error.status > 500 && error.status < 600) {
          throw new BadGatewayException('Weather API is down');
        }

        throw new HttpException(error.response?.data?.message ?? error.message, error.response.status ?? error.status);
      }

      // I don't want to throw internal errors to the client for a security reason, so I'd implement some logger like f.e. Sentry
      const internalErrorNames = ['SyntaxError', 'ReferenceError', 'TypeError', 'RangeError', 'URIError', 'EvalError'];
      if (!internalErrorNames.includes(error.name)) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new InternalServerErrorException('Internal server implementation error');
      }
    }
  }
}
