import { IsEmail, IsNotEmpty, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageErrorDto {
  code: number;
  message: string;
}

export class ClientLoginParamsDto {
  @IsNotEmpty({ message: 'email field required' })
  @IsEmail({ message: 'please write a correct e-mail address' })
  email: string;
  @IsNotEmpty({ message: 'password field required' })
  @Length(6, 100)
  password: string;
}

export class ClientRegisterParamDto extends ClientLoginParamsDto {
  @IsNotEmpty({ message: 'name field required' })
  @Length(2, 100, {
    message: 'please enter 2 or more characters for your name',
  })
  name: string;
}

export class ClientMessageParamsDto {
  @IsNotEmpty({ message: 'token field required' })
  token: string;
  @IsNotEmpty({ message: 'message field required' })
  message: string;
}

export class ClientGlobalParamsDto {
  @IsNotEmpty({ message: 'token field required' })
  token: string;
  message?: string;
  id?: string;
  page?: number;
  limit?: number;
}

export class ClientGlobalDto {
  @IsNotEmpty({ message: 'method field required' })
  method: string;
  @ValidateNested({ each: true })
  @Type(() => ClientGlobalParamsDto)
  params: ClientGlobalParamsDto;
  @IsNotEmpty({ message: 'id field required' })
  id: string;
}

export class ClientMessageDto {
  @IsNotEmpty({ message: 'method field required' })
  method: string;
  @ValidateNested({ each: true })
  @Type(() => ClientMessageParamsDto)
  params: ClientMessageParamsDto;
  @IsNotEmpty({ message: 'id field required' })
  id: string;
}

export class ClientLoginDto {
  @IsNotEmpty({ message: 'method field required' })
  method: string;
  @ValidateNested({ each: true })
  @Type(() => ClientLoginParamsDto)
  params: ClientLoginParamsDto;
  @IsNotEmpty({ message: 'id field required' })
  id: string;
}

export class UserCreateDto {
  @IsNotEmpty({ message: 'method field required' })
  method: string;
  @ValidateNested({ each: true })
  @Type(() => ClientRegisterParamDto)
  params: ClientRegisterParamDto;
  @IsNotEmpty({ message: 'id field required' })
  id: string;
}

export class ListRequestDto {
  @IsNotEmpty({ message: 'method field required' })
  method: string;
  @ValidateNested({ each: true })
  @Type(() => ClientGlobalParamsDto)
  params: ClientGlobalParamsDto;
  @IsNotEmpty({ message: 'id field required' })
  id: string;
}

export class ServerMessageDto {
  @IsNotEmpty({ message: 'method field required' })
  method: string;
  @IsNotEmpty({ message: 'id field required' })
  id: string;
  error?: MessageErrorDto;
  result?: object;
}
