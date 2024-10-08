import { headers } from "next/headers";
import { EgressInfo, WebhookReceiver } from "livekit-server-sdk";

import { db } from "@/lib/db";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = headers();
  const authorization = headerPayload.get("Authorization");

  if (!authorization) {
    return new Response("No authorization header", { status: 400 });
  }

  const event = await receiver.receive(body, authorization);

  if (event.event === "ingress_started") {
    await db.stream.update({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: true,
      },
    });
  }

  if (event.event === "ingress_ended") {
    await db.stream.update({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: false,
      },
    });
  }

  if (event.event === "egress_updated") {
    let egress = event.egressInfo as EgressInfo;
    if (egress) {
      await db.egress.update({
        where: {
          egressId: egress?.egressId,
        },
        data: {
          egressJson: JSON.parse(JSON.stringify(egress)),
        },
      });
    }
  }

  if (event.event === "egress_ended") {
    let egress = event.egressInfo as EgressInfo;
    if (egress) {
      await db.egress.update({
        where: {
          egressId: egress?.egressId,
        },
        data: {
          hasEnded: true,
          egressJson: JSON.parse(JSON.stringify(egress)),
        },
      });
    }
  }
}
