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

// Vercel Blob adapter — active when BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID is set.
// Uses BLOB_READ_WRITE_TOKEN when available; falls back to OIDC (VERCEL_OIDC_TOKEN,
// auto-injected by Vercel runtime) with BLOB_STORE_ID for passwordless server auth.
class VercelBlobStorage implements StorageProvider {
  publicUrl(key: string) {
    return key;
  }

  async putObject(key: string, body: Buffer, mimeType = "application/octet-stream") {
    const { put } = await import("@vercel/blob");
    const base = { access: "public" as const, contentType: mimeType };
    const { url } = process.env.BLOB_READ_WRITE_TOKEN
      ? await put(key, body, { ...base, token: process.env.BLOB_READ_WRITE_TOKEN })
      // OIDC path: Vercel injects VERCEL_OIDC_TOKEN at runtime; storeId selects the store.
      : await put(key, body, { ...base, storeId: process.env.BLOB_STORE_ID });
    return url;
  }
}

let provider: StorageProvider | null = null;
export function getStorage(): StorageProvider {
  if (!provider) {
    provider =
      process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
        ? new VercelBlobStorage()
        : new MinioStorage();
  }
  return provider;
}
