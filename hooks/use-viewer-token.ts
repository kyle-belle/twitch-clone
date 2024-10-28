import { toast } from "sonner";
import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";

import { createViewerToken } from "@/actions/token";

export const useViewerToken = (
  hostIdentity: string,
  onError?: (e: Error) => void
) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);

  const forceUpdateFunc = () => {
    setForceUpdate((i) => i + 1);
  };

  const createToken = async () => {
    try {
      const viewerToken = await createViewerToken(hostIdentity);
      setToken(viewerToken);

      const decodedToken = jwtDecode(viewerToken) as JwtPayload & {
        name?: string;
      };
      const name = decodedToken?.name;
      const identity = decodedToken.jti;

      if (identity) {
        setIdentity(identity);
      }

      if (name) {
        setName(name);
      }
    } catch (e) {
      onError?.(e as Error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    createToken();
  }, [hostIdentity, forceUpdate]);

  return {
    token,
    name,
    identity,
    refresh: forceUpdateFunc,
  };
};
