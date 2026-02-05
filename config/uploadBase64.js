const uploadBase64 = async (base64, folder) => {
  const result = await cloudinary.v2.uploader.upload(base64, {
    folder,
  });
  return result;
};
export default uploadBase64;