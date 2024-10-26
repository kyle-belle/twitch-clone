import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

import { UrlCard } from "./_components/url-card";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";
import DeleteAll from "./_components/DeleteAll";

const KeysPage = async () => {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("Stream not found");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Keys & URLs</h1>
        {process.env.NODE_ENV === "development" && <DeleteAll />}
        <ConnectModal />
      </div>
      <div className="space-y-4">
        <UrlCard value={stream.serverUrl} />
        <KeyCard value={stream.streamKey} />
      </div>
    </div>
  );
};

export default KeysPage;
