import "./env.js";
import { v2 as cloudinary } from "cloudinary";

const requiredConfig = {
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
};

const isPlaceholder = (value) => !value || value.startsWith("your_");

export const validateCloudinaryConfig = () => {
  const missingVars = Object.entries(requiredConfig)
    .filter(([, value]) => isPlaceholder(value))
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const err = new Error(`Cloudinary is not configured. Update backend/.env: ${missingVars.join(", ")}`);
    err.status = 500;
    throw err;
  }
};

cloudinary.config({
  cloud_name: requiredConfig.CLOUD_NAME,
  api_key: requiredConfig.API_KEY,
  api_secret: requiredConfig.API_SECRET,
});

export default cloudinary;
