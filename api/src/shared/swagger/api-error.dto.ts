import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorBodyDto {
  @ApiProperty({ example: 'INVALID_REQUEST' })
  code!: string;

  @ApiProperty({ example: 'Invalid request' })
  message!: string;

  @ApiProperty({ example: null, nullable: true })
  detail!: string | null;
}

export function apiErrorExample(
  code: string,
  message: string,
  detail: string | null = null,
) {
  return {
    success: false,
    data: null,
    error: { code, message, detail },
  };
}
