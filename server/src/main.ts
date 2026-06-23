import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import express from "express";
import { mkdirSync } from "fs";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const uploadsPath = join(process.cwd(), "uploads");
  mkdirSync(uploadsPath, { recursive: true });

  const app = await NestFactory.create(AppModule);
  const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: clientOrigins,
    credentials: true,
  });
  app.use(cookieParser());
  app.use("/uploads", express.static(uploadsPath));

  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
