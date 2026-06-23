import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  create(file: Express.Multer.File) {
    return this.prisma.mediaAsset.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
      },
    });
  }
}
