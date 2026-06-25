import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Gracias por el aviso' })
  @IsString()
  @MinLength(1)
  text!: string;
}
