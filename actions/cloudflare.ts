"use server";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env
    .CLOUDFLARE_R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const getEgressSignedUrl = async (fileName: string) => {
  const url = await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_EGRESS_BUCKET,
      Key: fileName,
    }),
    { expiresIn: 24 * 60 * 60 }
  );
  return {
    fileName,
    url,
  };
};