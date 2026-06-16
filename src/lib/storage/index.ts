// Storage abstraction (S3-compatible). MinIO adapter for dev/local.
import { Client as MinioClient } from "minio";
import { env } from "@/lib/env";

export interface StorageProvider {
  publicUrl(key: string): string;
  putObject(key: string, body: Buffer, mimeType?: string): Promise<string>;
}

class MinioStorage implements StorageProvider {
  private client: MinioClient | null = null;
  private get c() {
    if (!this.client) {
      const e = env();
      this.client = new MinioClient({
        endPoint: e.S3_ENDPOINT,
        port: e.S3_PORT,
        useSSL: e.S3_USE_SSL,
        accessKey: e.S3_ACCESS_KEY,
        secretKey: e.S3_SECRET_KEY,
      });
    }
    return this.client;
  }

  publicUrl(key: string) {
    return `${env().S3_PUBLIC_URL}/${key.replace(/^\/+/, "")}`;
  }

  async putObject(key: string, body: Buffer, mimeType = "application/octet-stream") {
    await this.c.putObject(env().S3_BUCKET, key, body, body.length, {
      "Content-Type": mimeType,
    });
    return this.publicUrl(key);
  }
}

// Vercel Blob adapter for serverless/production. Active when BLOB_READ_WRITE_TOKEN is set.
class VercelBlobStorage implements StorageProvider {
  publicUrl(key: string) {
    // Vercel Blob returns the full URL from putObject; this is only used as a fallback.
    return key;
  }

  async putObject(key: string, body: Buffer, mimeType = "application/octet-stream") {
    const { put } = await import("@vercel/blob");
    const { url } = await put(key, body, {
      access: "public",
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return url;
  }
}

let provider: StorageProvider | null = null;
export function getStorage(): StorageProvider {
  if (!provider) {
    provider = process.env.BLOB_READ_WRITE_TOKEN
      ? new VercelBlobStorage()
      : new MinioStorage();
  }
  return provider;
}
