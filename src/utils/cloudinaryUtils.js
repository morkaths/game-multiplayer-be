// src/utils/cloudinaryUtils.js
import cloudinary from '../config/cloudinary.js';

// Xóa ảnh theo public_id
export const deleteImageOnCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

// Hàm tách public_id từ URL Cloudinary (nếu chỉ lưu URL)
export const getPublicIdFromUrl = (url) => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
};