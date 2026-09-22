import fs from "fs/promises";
import path from "path";

export interface StorageResult {
  url: string;
  key: string;
  size: number;
}

export interface IStorageProvider {
  uploadFile(file: Buffer, filename: string, mimeType: string): Promise<StorageResult>;
  deleteFile(key: string): Promise<boolean>;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir = path.join(process.cwd(), "public", "uploads");

  constructor() {
    this.ensureDir();
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // dir exists
    }
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<StorageResult> {
    await this.ensureDir();
    const ext = path.extname(filename);
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    await fs.writeFile(filePath, file);

    return {
      url: `/uploads/${uniqueName}`,
      key: uniqueName,
      size: file.length,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, key);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageProvider = new LocalStorageProvider();
