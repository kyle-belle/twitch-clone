import { getSignedUploadUrl } from "@/actions/cloudflare";
import { Film, Video } from "lucide-react";
import { ChangeEvent, useState } from "react";
import axios from "axios";
import { addUserUpload } from "@/actions/user";
type Props = {
  onUpload?: () => Promise<void> | void;
};
const UploadRecording = ({ onUpload }: Props) => {
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [currentlyUploadingFile, setCurrentlyUploadingFile] =
    useState<File | null>(null);

  const onSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];

      const { url, fileName } = await getSignedUploadUrl(file.name, "write");
      setCurrentlyUploadingFile(file);

      await axios
        .put(url, file, {
          onUploadProgress: (p) => {
            if (p.total) {
              setFileUploadProgress(Math.min(p.loaded / p.total, 0.99));
            }
          },
        })
        .then(() => {
          setFileUploadProgress(1);
          return addUserUpload(fileName);
        })
        .then(() => {
          onUpload?.();
        })
        .finally(() => {
          setCurrentlyUploadingFile(null);
          setFileUploadProgress(0);
        });

      //   await fetch(url, { body: file, method: "PUT" })
      //     .then(() => {
      //       setFileUploadProgress(1);
      //       return addUserUpload(fileName);
      //     })
      //     .finally(() => {
      //       //   setCurrentlyUploadingFile(null);
      //       //   setFileUploadProgress(0);
      //     });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative min-h-[150px] py-8 w-full text-gray-600">
      {!currentlyUploadingFile ? (
        <div className="flex flex-col items-center gap-1 text-sm">
          <p>Drag and drop or click</p>
          <h3>Upload a recording</h3>
          <div className="flex gap-2 items-center text-2xl">
            <Video size={30} /> <Film size={25} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p>
            {currentlyUploadingFile.name}{" "}
            {(fileUploadProgress * 100).toFixed(0)}%
          </p>
        </div>
      )}
      <input
        onChange={onSelectFile}
        type="file"
        accept="video/*"
        className="absolute inset-0 rounded-md border-2 border-dashed border-gray-600 cursor-pointer file:hidden text-transparent"
      />
    </div>
  );
};

export default UploadRecording;
