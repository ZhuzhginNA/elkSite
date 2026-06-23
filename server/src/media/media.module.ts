import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma/prisma.service";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [MediaService, PrismaService],
})
export class MediaModule {}
