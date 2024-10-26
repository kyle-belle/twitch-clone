import { DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogClose, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { createIngress } from "@/actions/ingress";
import { IngressInput } from "livekit-server-sdk";
import { ElementRef, useRef, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  url: string | null;
  onClose: () => void;
};

const UrlStreamDialog = ({ open, url, onClose }: Props) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const [isPending, startTransition] = useTransition();

  const streamRecording = async (url: string) => {
    await createIngress(IngressInput.URL_INPUT, url).catch((e) => {
      console.error(e);
      toast.error("Something went wrong");
    });
  };

  const onSubmit = () => {
    if (url) {
      startTransition(() => {
        streamRecording(url);
        closeRef.current?.click();
      });
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(_open) => {
        if (!_open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-400">Stream Recording</DialogTitle>
        </DialogHeader>
        <div className="">
          After streaming a recording, you will need to generate new stream keys
          to live stream from obs (or other RTMP/WHIP source)
        </div>
        <div className="flex justify-between">
          <DialogClose ref={closeRef} asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={onSubmit} variant="primary">
            Stream
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UrlStreamDialog;
