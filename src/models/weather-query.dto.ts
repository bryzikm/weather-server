import { IsString, Length } from 'class-validator';

export class WeatherQueryDto {
  @IsString()
  @Length(3)
  query: string;
}
