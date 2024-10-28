"use client";

import { getSignedUploadUrl } from "@/actions/cloudflare";
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
import UploadRecording from "./UploadRecording";
import { getUserUploads } from "@/actions/user";

dayjs.extend(advancedFormatDayjs);

const Uploads = () => {
  const [hideUploads, setHideUploads] = useState(false);

  const [uploads, setUploads] = useState<
    (Awaited<ReturnType<typeof getUserUploads>>[number] & { url: string })[]
  >([]);

  const [urlToStream, setUrlToStream] = useState<string | null>(null);

  const getUploads = async () => {
    console.log("Get Uploads");
    const uploads = await getUserUploads();
    console.log("Got User Uploads", uploads);
    // filter unique filepaths
    const uniqueUploads = uploads.filter(
      ({ filepath }, i, a) => a.findIndex((f) => f.filepath === filepath) === i
    );

    const newUploads = await Promise.all(
      uniqueUploads.map(async (u) => {
        console.log("Getting signed upload url");
        const url = (await getSignedUploadUrl(u.filepath)).url;
        console.log("Got signed upload url", url);

        return { ...u, url };
      })
    );

    console.log("Got New Uploads");

    console.log({ newUploads });

    setUploads((u) =>
      [...u, ...newUploads].filter(
        (r, i, a) => a.findIndex((rr) => rr.url === r.url) === i
      )
    );
  };

  useEffect(() => {
    getUploads();
  }, []);

  const downloadUpload = async (url: string) => {
    downloadFromExternalUrl(url, getFilename(url));
  };

  const toggleUploads = () => {
    setHideUploads((h) => !h);
  };

  return (
    <div className="w-full flex flex-col gap-3 px-5">
      <UploadRecording onUpload={getUploads} />
      <div className="flex gap-3 justify-between items-center">
        <h2 className="sm:text-2xl font-semibold">Uploads</h2>{" "}
        <button
          className="p-0 border-none text-sm"
          title={hideUploads ? "Show upload" : "Hide Uploads"}
          onClick={toggleUploads}
        >
          {hideUploads ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
        </button>
      </div>
      {!hideUploads &&
        (uploads.length ? (
          <ul className="flex flex-col gap-3 w-full px-4">
            {uploads.map(({ url, filepath }) => {
              return (
                <li className="flex flex-col gap-2" key={url}>
                  <div className="flex justify-between gap-3 items-center">
                    <h3 className="text-lg font-semibold flex-1">
                      {getFilename(filepath)}
                    </h3>

                    <Dropdown>
                      <DropdownTrigger>
                        <Ellipsis className="text-xl" />
                      </DropdownTrigger>

                      <DropdownContent>
                        <DropdownItem
                          onClick={() => {
                            setUrlToStream(url);
                          }}
                        >
                          Stream
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            downloadUpload(url);
                          }}
                        >
                          Download
                        </DropdownItem>
                      </DropdownContent>
                    </Dropdown>
                  </div>
                  <a href={url} target="_blank" key={url}>
                    <video
                      onError={(e) => {
                        console.error("Video Error: ", e);
                      }}
                      className="w-[400px] aspect-video rounded-md"
                      preload="metadata"
                    >
                      <source src={url} />
                    </video>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center opacity-50">No uploads</div>
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

export default Uploads;
