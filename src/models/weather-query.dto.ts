import { IsString, MinLength } from 'class-validator';

export class WeatherQueryDto {
  @IsString()
  @MinLength(3)
  query: string;
}
