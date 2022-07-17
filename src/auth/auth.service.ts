import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';

import { AuthDTO } from "./dto";

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async signup(dto: AuthDTO) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    // save new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;

      // return the saved user
      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken!')
        }
      }

      throw err;
    }
  }

  signin() {
    return { msg: 'I have signed in' };
  }
}
