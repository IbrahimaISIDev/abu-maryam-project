import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_URL_TTL_SECONDS = 600; // 10 min — largement suffisant pour l'upload d'un fichier audio/vidéo

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} n'est pas défini (voir .env.example)`);
  return value;
}

function getClient(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${getEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
}

/** Génère une URL PUT signée pour un upload direct navigateur → R2, sans transiter par notre serveur. */
export async function createPresignedUpload(key: string, contentType: string): Promise<PresignedUpload> {
  const client = getClient();
  const bucket = getEnv("R2_BUCKET_NAME");
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });
  const publicBase = getEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  return { uploadUrl, publicUrl: `${publicBase}/${key}` };
}
