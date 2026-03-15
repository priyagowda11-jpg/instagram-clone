/**
 * ════════════════════════════════════════════
 * config/cloudinary.js — MEDIA STORAGE CONFIG
 * ════════════════════════════════════════════
 *
 * WHY CLOUDINARY?
 * - Free CDN for images/videos
 * - Auto-optimization (WebP conversion, compression)
 * - We don't store files on our server (stateless)
 *
 * HOW IT WORKS:
 * 1. User uploads file → Multer reads it into memory
 * 2. We stream buffer → Cloudinary
 * 3. Cloudinary returns a URL
 * 4. We store that URL in MongoDB
 */

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * uploadToCloudinary
 * @param {Buffer} fileBuffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - "image" or "video"
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const streamifier = require("streamifier");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `instagram-clone/${folder}`,
        resource_type: resourceType,
        // Auto-format + quality compression
        transformation:
          resourceType === "image"
            ? [{ quality: "auto", fetch_format: "auto" }]
            : [],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
