const fs = require('fs');
const path = require('path');

// Simple abstraction layer for Storage.
// In dev, defaults to 'local'. In prod, can be 's3'.
const DRIVER = process.env.STORAGE_DRIVER || 'local';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

class StorageService {
  static async uploadFile(fileBuffer, originalName, mimeType) {
    const ext = path.extname(originalName) || '';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    if (DRIVER === 's3') {
      // Mocking the S3 SDK integration for now.
      // In a real scenario, we would use @aws-sdk/client-s3 
      // e.g., const client = new S3Client({...});
      // await client.send(new PutObjectCommand({...}));
      
      console.log(`[Storage] Uploading ${filename} to S3 bucket ${process.env.S3_BUCKET}`);
      // return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${filename}`;
      throw new Error("S3 SDK not wired up yet. Use 'local' driver.");
    } else {
      // Default local disk storage
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, fileBuffer);
      return `/uploads/${filename}`;
    }
  }
}

module.exports = StorageService;
