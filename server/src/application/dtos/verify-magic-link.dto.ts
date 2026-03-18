import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyMagicLinkDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}
