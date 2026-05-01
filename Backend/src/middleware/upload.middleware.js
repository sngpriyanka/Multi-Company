import fs from 'fs'
import path from 'path'
import multer from 'multer'

const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const sanitizedName = file.originalname.replace(/\s+/g, '_')
    cb(null, `${Date.now()}-${sanitizedName}`)
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})
