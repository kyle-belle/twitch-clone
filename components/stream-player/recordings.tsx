import { getStreamEgresses } from "@/actions/egress";
import { getEgressSignedUrl } from "@/actions/cloudflare";
import { EgressInfo } from "livekit-server-sdk";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import advancedFormatDayjs from "dayjs/plugin/advancedFormat";
import { Ellipsis, MinusCircle, PlusCircle } from "lucide-react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../ui/dropdown-menu";
import { downloadFromExternalUrl } from "@/lib/dom";
import { getFilename } from "@/lib/utils";
import UrlStreamDialog from "./UrlStreamDialog";

dayjs.extend(advancedFormatDayjs);

const Recordings = (props: { streamId: string }) => {
  const [hideRecordings, setHideRecordings] = useState(false);
  const [recordings, setRecordings] = useState<
    {
      egress: Awaited<ReturnType<typeof getStreamEgresses>>[number];
      urls: string[];
    }[]
  >([]);

  const [urlToStream, setUrlToStream] = useState<string | null>(null);

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

      setRecordings((r) =>
        [...r, ...newRecordings].filter(
          (r, i, a) =>
            a.findIndex((rr) => rr.egress.egressId === r.egress.egressId) === i
        )
      );
    };

    getRecordings();
  }, [props.streamId]);

  const downloadRecording = async (url: string) => {
    downloadFromExternalUrl(url, getFilename(url));
  };

  const toggleRecordings = () => {
    setHideRecordings((h) => !h);
  };

  return (
    <div className="px-5 w-full flex flex-col gap-3">
      <div className="flex gap-3 justify-between items-center">
        <h2 className="sm:text-2xl font-semibold">Recordings</h2>{" "}
        <button
          className="p-0 border-none text-sm"
          title={hideRecordings ? "Show upload" : "Hide Uploads"}
          onClick={toggleRecordings}
        >
          {hideRecordings ? (
            <PlusCircle size={20} />
          ) : (
            <MinusCircle size={20} />
          )}
        </button>
      </div>
      {!hideRecordings &&
        (recordings.length ? (
          <ul className="flex flex-col gap-3 w-full">
            {recordings.map(({ urls, egress }) => {
              const { id, createdAt } = egress;
              const mainUrl = urls[0];

              return urls.length ? (
                <li className="flex flex-col gap-2" key={id}>
                  <div className="flex justify-between gap-3 items-center">
                    <h3 className="text-lg font-semibold flex-1">
                      {dayjs(createdAt).format(
                        "MMM Do YYYY HH:mm a [Recording(s)]"
                      )}
                    </h3>

                    <Dropdown>
                      <DropdownTrigger>
                        <Ellipsis className="text-xl" />
                      </DropdownTrigger>

                      <DropdownContent>
                        <DropdownItem
                          onClick={() => {
                            if (mainUrl) {
                              setUrlToStream(mainUrl);
                            }
                          }}
                        >
                          Stream
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            if (mainUrl) {
                              downloadRecording(mainUrl);
                            }
                          }}
                        >
                          Download
                        </DropdownItem>
                      </DropdownContent>
                    </Dropdown>
                  </div>
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
        ) : (
          <div className="text-center opacity-50">No Recordings</div>
        ))}
      <UrlStreamDialog
        open={!!urlToStream}
        onClose={() => {
          setUrlToStream(null);
        }}
        url={urlToStream}
      />
    </div>
  );
};

export default Recordings;
