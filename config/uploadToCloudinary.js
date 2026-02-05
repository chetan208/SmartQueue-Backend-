import streamifier from "streamifier";
import cloudinary from "./cloudinary.js";

const uploadBufferToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Pipe the buffer to Cloudinary stream
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export default uploadBufferToCloudinary;
