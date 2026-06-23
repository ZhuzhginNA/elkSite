import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { FrappeResponse } from "./catalog.types";

@Injectable()
export class FrappeClientService {
  private readonly baseUrl: string;
  private readonly methodPrefix: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly basicAuthUser: string;
  private readonly basicAuthPassword: string;
  private readonly sessionCookie: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (this.configService.get<string>("CATALOG_API_BASE") ?? "").replace(/\/+$/, "");
    this.methodPrefix =
      this.configService.get<string>("CATALOG_API_METHOD_PREFIX") ??
      "construction_repository.construction_repository.controllers.api";
    this.apiKey = this.configService.get<string>("CATALOG_API_KEY") ?? "";
    this.apiSecret = this.configService.get<string>("CATALOG_API_SECRET") ?? "";
    this.basicAuthUser = this.configService.get<string>("CATALOG_BASIC_AUTH_USER") ?? "";
    this.basicAuthPassword = this.configService.get<string>("CATALOG_BASIC_AUTH_PASSWORD") ?? "";
    this.sessionCookie = this.configService.get<string>("CATALOG_SESSION_COOKIE") ?? "";
  }

  async call<T>(method: string, params: Record<string, string | number | boolean | undefined | null> = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ServiceUnavailableException("Внешний API каталога не настроен");
    }

    const url = new URL(`${this.baseUrl}/api/method/${this.methodPrefix}.${method}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.basicAuthUser && this.basicAuthPassword) {
      const credentials = Buffer.from(`${this.basicAuthUser}:${this.basicAuthPassword}`).toString("base64");
      headers.Authorization = `Basic ${credentials}`;
    } else if (this.apiKey && this.apiSecret) {
      headers.Authorization = `token ${this.apiKey}:${this.apiSecret}`;
    } else if (this.sessionCookie) {
      headers.Cookie = this.sessionCookie.includes("=") ? this.sessionCookie : `sid=${this.sessionCookie}`;
    }

    const response = await fetch(url, { headers });
    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new ServiceUnavailableException(`Внешний API каталога вернул ${response.status}`);
    }

    return this.unwrap<T>(payload, method);
  }

  private unwrap<T>(payload: unknown, method: string): T {
    const root = payload as { message?: unknown };
    const message = root?.message ?? payload;
    const response = message as FrappeResponse<T>;

    if (response && typeof response === "object" && "success" in response && response.success === false) {
      throw new ServiceUnavailableException(response.message || `Ошибка внешнего метода ${method}`);
    }

    return message as T;
  }
}
