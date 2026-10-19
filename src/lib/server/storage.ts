import { R2_ACCESS_KEY_ID, R2_ACCOUNT_ID, R2_BUCKET, R2_SECRET_ACCESS_KEY } from "$app/env/private";
import { PUBLIC_MEDIA_URL } from "$app/env/public";
import { error } from "@sveltejs/kit";
import { AwsClient } from "aws4fetch";

let client: AwsClient | undefined;

/**
 * A short-lived URL the browser PUTs the file to, straight to R2. The type and size are signed, so R2 rejects any other
 * file. The bucket needs a CORS rule allowing PUT with `content-type` from the site origins.
 */
export async function presignUpload(key: string, type: string, size: number) {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !PUBLIC_MEDIA_URL) {
    error(503, "Uploads aren’t configured on this server.");
  }
  client ??= new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto"
  });
  const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`);
  url.searchParams.set("X-Amz-Expires", "600");
  const signed = await client.sign(
    new Request(url, { method: "PUT", headers: { "content-type": type, "content-length": String(size) } }),
    // Content type and length aren't signed by default.
    { aws: { signQuery: true, allHeaders: true } }
  );
  return { uploadUrl: signed.url, publicUrl: `${PUBLIC_MEDIA_URL.replace(/\/+$/, "")}/${key}` };
}
