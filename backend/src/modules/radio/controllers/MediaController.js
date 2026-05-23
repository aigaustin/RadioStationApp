const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.resolve(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

class MediaController {
  
  static getUploadMiddleware() {
    return upload.single('file');
  }

  static async uploadMedia(req, res, prisma) {
    try {
      const { radioStationId, title, artist, album } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ ok: false, error: 'No audio file provided' });
      }
      if (!radioStationId) {
        // cleanup
        fs.unlinkSync(file.path);
        return res.status(400).json({ ok: false, error: 'radioStationId is required' });
      }

      // In a real app we'd use fluent-ffmpeg to extract duration/metadata here
      const media = await prisma.mediaFile.create({
        data: {
          radioStationId,
          title: title || file.originalname,
          artist,
          album,
          filePath: file.filename,
          fileSize: file.size,
          duration: 0 // Stub
        }
      });

      res.json({ ok: true, data: media });
    } catch (e) {
      console.error('[MediaController]', e);
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async listMedia(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      if (!radioStationId) {
        return res.status(400).json({ ok: false, error: 'radioStationId required' });
      }
      
      const media = await prisma.mediaFile.findMany({
        where: { radioStationId },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({ ok: true, data: media });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = MediaController;
