import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type StoredFile = {
  url: string;
  key: string;
  provider: string;
};

export interface FileStorageProvider {
  name: string;
  upload(input: { filename: string; mimeType: string; dataUrl?: string; buffer?: Buffer }): Promise<StoredFile>;
  getPublicUrl(key: string): string;
}

class LocalFileStorage implements FileStorageProvider {
  name = "local";

  async upload(input: { filename: string; mimeType: string; dataUrl?: string; buffer?: Buffer }): Promise<StoredFile> {
    if (!input.buffer) {
      throw new Error("A file buffer is required for local uploads.");
    }

    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `local/${Date.now()}-${randomUUID()}-${safeName}`;
    const filePath = path.join(process.cwd(), "public", "uploads", key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.buffer);

    const url = `/uploads/${key}`;
    return { url, key, provider: this.name };
  }

  getPublicUrl(key: string): string {
    return `/uploads/${key}`;
  }
}

class UploadThingStorage implements FileStorageProvider {
  name = "uploadthing";

  async upload(): Promise<StoredFile> {
    throw new Error("UploadThing is not configured. Set UPLOADTHING_TOKEN and FILE_STORAGE_PROVIDER=uploadthing.");
  }

  getPublicUrl(key: string): string {
    return key;
  }
}

class S3Storage implements FileStorageProvider {
  name = "s3";

  async upload(): Promise<StoredFile> {
    throw new Error("S3 storage is not configured. Set S3_* env vars and FILE_STORAGE_PROVIDER=s3.");
  }

  getPublicUrl(key: string): string {
    return key;
  }
}

export function getFileStorage(): FileStorageProvider {
  const provider = process.env.FILE_STORAGE_PROVIDER || "local";
  if (provider === "uploadthing") return new UploadThingStorage();
  if (provider === "s3") return new S3Storage();
  return new LocalFileStorage();
}
