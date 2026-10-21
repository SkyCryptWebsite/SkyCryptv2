import { createUpload } from "./posts.remote";

/** Uploads straight to R2 through a signed URL and returns the public URL. */
export async function uploadFile(file: File) {
  const { uploadUrl, publicUrl } = await createUpload({ type: file.type, size: file.size });
  const response = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "content-type": file.type } });
  if (!response.ok) throw new Error(`Upload failed with status ${response.status}.`);
  return publicUrl;
}

/** Uploads an image along with its dimensions, measured before upload so pages can reserve space. */
export async function uploadImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { url: await uploadFile(file), width, height };
}
