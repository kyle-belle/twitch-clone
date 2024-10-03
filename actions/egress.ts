"use server";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

import { EgressClient, EncodedFileType } from "livekit-server-sdk";

const egressClient = new EgressClient(process.env.LIVEKIT_API_URL!);

export const startEgress = async (
  roomName: string,
  videoTrackId: string,
  audioTrackId: string
) => {
  const self = await getSelf();

  const stream = await db.stream.findFirstOrThrow({
    where: { userId: self.id },
    include: { egresses: { where: { hasEnded: false } } },
  });

  if (stream.egresses.length) {
    throw new Error("Stream already has an active egress");
  }

  const outputs = {
    file: {
      fileType: EncodedFileType.MP4,
      filepath: "{room_name}-{time}",
      output: {
        case: "s3",
        value: {
          accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secret: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
          bucket: process.env.CLOUDFLARE_R2_EGRESS_BUCKET!,
          region: "ENAM",
          forcePathStyle: true,
        },
      },
    },
    segments: {
      filenamePrefix: "{room_name}-{time}",
      playlistName: "{room_name}-{time}.m3u8",
      segmentDuration: 2,
      output: {
        case: "s3",
        value: {
          accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secret: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
          bucket: process.env.CLOUDFLARE_R2_EGRESS_BUCKET!,
          region: "ENAM",
          forcePathStyle: true,
        },
      },
    },
  };

  const egress = await egressClient.startTrackCompositeEgress(
    roomName,
    outputs,
    { audioTrackId, videoTrackId }
  );

  if (!egress || !egress.egressId) {
    throw new Error("Failed to create ingress");
  }

  /* const newDbEgress =  */ await db.egress.create({
    data: {
      streamId: stream.id,
      egressId: egress.egressId,
      audioTrackId,
      videoTrackId,
      hasEnded: false,
      egressJson: JSON.parse(JSON.stringify(egress)),
    },
  });

  revalidatePath(`/u/${self.username}`);
  revalidatePath(`/${self.username}`);

  return egress;
};

export const stopEgress = async (egressId: string) => {
  const self = await getSelf();

  const egress = await egressClient.stopEgress(egressId);

  await db.egress.update({
    where: { egressId },
    data: { hasEnded: true, egressJson: JSON.parse(JSON.stringify(egress)) },
  });

  revalidatePath(`/u/${self.username}`);
  revalidatePath(`/${self.username}`);

  return egress;
};
