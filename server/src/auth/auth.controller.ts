import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

const COOKIE_NAME = "elk_admin_token";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { login?: string; password?: string }, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(body.login ?? "", body.password ?? "");
    const token = await this.authService.createToken(user);

    response.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 1000 * 60 * 60 * 8,
    });

    return user;
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@Req() request: Request & { user?: unknown }) {
    return request.user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, { path: "/" });
    return { ok: true };
  }
}
