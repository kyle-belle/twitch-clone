import { getStreamEgresses } from "@/actions/egress";
import { getEgressSignedUrl } from "@/actions/cloudflare";
import { EgressInfo } from "livekit-server-sdk";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import advancedFormatDayjs from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormatDayjs);

const Recordings = (props: { streamId: string }) => {
  const [recordings, setRecordings] = useState<
    {
      egress: Awaited<ReturnType<typeof getStreamEgresses>>[number];
      urls: string[];
    }[]
  >([]);

  const removeRecordingUrl = (url: string) => {
    setRecordings((recs) =>
      recs.map((r) => ({ ...r, urls: r.urls.filter((u) => u !== url) }))
    );
  };

  useEffect(() => {
    const getRecordings = async () => {
      const recs = await getStreamEgresses(props.streamId);
      //   console.log({ recs });
      const newRecordings = await Promise.all(
        recs.map(async (e) => {
          const egressInfo = e.egressJson as unknown as EgressInfo;

          const urls = await Promise.all(
            egressInfo.fileResults.map(async ({ filename }) => {
              return (await getEgressSignedUrl(filename)).url;
            })
          );

          return { egress: e, urls };
        })
      );

      setRecordings((r) => [...r, ...newRecordings]);
    };

    getRecordings();
  }, [props.streamId]);

  //   useEffect(() => {
  //     console.log({ recordings });
  //   }, [recordings]);

  return (
    <ul className="flex flex-col gap-3 w-full px-4">
      {recordings.map(({ urls, egress }) => {
        const { id, createdAt } = egress;

        return urls.length ? (
          <li className="flex flex-col gap-2" key={id}>
            <h3 className="text-lg font-semibold">
              {dayjs(createdAt).format("MMM Do YYYY HH:mm a [Recording(s)]")}
            </h3>
            <ul className="flex gap-2 items-start overflow-auto">
              {urls.map((url) => {
                return (
                  <a href={url} target="_blank" key={url}>
                    <video
                      onError={(e) => {
                        console.error("Video Error: ", e);
                        removeRecordingUrl(url);
                      }}
                      className="w-[400px] aspect-video rounded-md"
                      preload="metadata"
                    >
                      <source src={url} />
                    </video>
                  </a>
                );
              })}
            </ul>
          </li>
        ) : null;
      })}
    </ul>
  );
};

export default Recordings;
