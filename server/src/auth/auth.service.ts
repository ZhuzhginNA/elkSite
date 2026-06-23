import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(login: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { login } });

    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid login or password");
    }

    return {
      id: user.id,
      login: user.login,
      role: user.role,
    };
  }

  async createToken(user: { id: string; login: string; role: string }) {
    return this.jwtService.signAsync({
      sub: user.id,
      login: user.login,
      role: user.role,
    });
  }
}
