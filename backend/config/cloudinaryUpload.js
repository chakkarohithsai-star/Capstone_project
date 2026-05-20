import cloudinary, { validateCloudinaryConfig } from "./cloudinary.js";

export const uploadToCloudinary = (buffer) => {
  validateCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "blog_users" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};
