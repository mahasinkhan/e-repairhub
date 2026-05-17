import httpClient from "./httpClient.js";

/**
 * Upload an image to Cloudinary via backend (signed server upload).
 * @param {File} file
 * @param {string} [folder] — Cloudinary sub-folder under `erepairhub/` (e.g. catalog, cms, profiles)
 */
export async function uploadImage(file, folder = "catalog") {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const { data } = await httpClient.post("/media/upload", form);
  if (!data?.success) throw new Error(data?.message || "Upload failed");
  return data.data;
}

/**
 * Delete image from Cloudinary (admin token only).
 * @param {string} publicId — e.g. erepairhub/catalog/xyz
 */
export async function deleteCloudinaryAsset(publicId) {
  const { data } = await httpClient.delete("/media/asset", { data: { publicId } });
  if (!data?.success) throw new Error(data?.message || "Delete failed");
  return data;
}
