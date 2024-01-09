import { plainToClass } from 'class-transformer';
import { IsEnum, IsPort, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsPort()
  PORT = '3000';

  @IsEnum(Environment)
  NODE_ENV = Environment.Development;

  // API_KEY stored here only for demo purposes
  @IsString()
  WEATHER_API_KEY = '940cd8d7ac9737568d4081e5cc909ec3';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
