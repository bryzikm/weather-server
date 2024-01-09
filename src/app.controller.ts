import { Controller, Get, Query } from '@nestjs/common';

import { AppService } from './app.service';
import { WeatherQueryDto } from './models/weather-query.dto';

@Controller('/weather')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findWeatherByCityName(@Query() queryDto: WeatherQueryDto) {
    return await this.appService.findWeatherByCityName(queryDto.query);
  }
}
