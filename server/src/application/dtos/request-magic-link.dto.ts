import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
