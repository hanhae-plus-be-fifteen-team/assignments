import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common'
import { UsersServiceAdapter } from './users.service.adapter'
import { CreateUserDto } from './dto/create-user.dto'
import { UserException } from './models/user.exception.model'

@Controller('users')
export class UsersController {
  constructor(private readonly userServiceAdapter: UsersServiceAdapter) {}

  @Post()
  createUser(@Body(new ValidationPipe()) body: CreateUserDto) {
    return this.userServiceAdapter.service.createOneUser(body)
  }

  @Get(':id')
  async readOneUser(@Param('id') id: string) {
    try {
      await this.userServiceAdapter.service.readOneUser(id)
    } catch (e) {
      if (e instanceof UserException) {
        throw this.handleUserException(e)
      }

      throw new InternalServerErrorException('Internal Server Exception', {
        cause: e,
      })
    }
  }

  private handleUserException(e: UserException) {
    return new BadRequestException(e.message)
  }
}
