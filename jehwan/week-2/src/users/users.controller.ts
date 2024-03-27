import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common'
import { UsersServiceAdapter } from './users.service.adapter'
import { CreateUserDto } from './dto/create-user.dto'

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
      switch (e.message) {
        case 'User Not Found':
          throw new NotFoundException('User Not Found')
        default:
          throw new InternalServerErrorException('Internal Server Exception', {
            cause: e,
          })
      }
    }
  }
}
