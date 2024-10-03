"use client";

import { toast } from "sonner";
import { Heart, Video, VideoOff } from "lucide-react";
import { useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { onFollow, onUnfollow } from "@/actions/follow";
import { startEgress, stopEgress } from "@/actions/egress";
import {
  useRemoteParticipant,
  useRoomInfo,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

interface ActionsProps {
  hostIdentity: string;
  isFollowing: boolean;
  isHost: boolean;
  isRecording: boolean;
  activeEgressId: string | null;
}

export const Actions = ({
  hostIdentity,
  isFollowing,
  isRecording,
  activeEgressId,
  isHost,
}: ActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { userId } = useAuth();

  const roomInfo = useRoomInfo();
  const participant = useRemoteParticipant(hostIdentity);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === hostIdentity);

  if (!participant) {
    return null;
  }

  const handleStartRecording = () => {
    const audioTracks = [...participant.audioTracks.entries()];
    const videoTracks = [...participant.videoTracks.entries()];
    const mainAudioTrack = audioTracks[0];
    const mainVideoTrack = videoTracks[0];
    if (roomInfo.name && mainAudioTrack && mainVideoTrack) {
      startTransition(() => {
        startEgress(roomInfo.name, mainVideoTrack[0], mainAudioTrack[0]);
      });
    }
  };

  const handleStopRecording = () => {
    if (activeEgressId) {
      stopEgress(activeEgressId);
    }
  };

  const handleFollow = () => {
    startTransition(() => {
      onFollow(hostIdentity)
        .then((data) =>
          toast.success(`You are now following ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const handleUnfollow = () => {
    startTransition(() => {
      onUnfollow(hostIdentity)
        .then((data) =>
          toast.success(`You have unfollowed ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const toggleFollow = () => {
    if (!userId) {
      return router.push("/sign-in");
    }

    if (isHost) return;

    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  const toggleRecord = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div className="flex gap-3">
      {isHost && (
        <Button
          disabled={!participant || isPending}
          onClick={toggleRecord}
          variant="primary"
          size="sm"
          className="w-full lg:w-auto"
        >
          {isRecording ? (
            <VideoOff className={"h-4 w-4 mr-2"} />
          ) : (
            <Video className={"h-4 w-4 mr-2"} />
          )}
          {isRecording ? "Stop Recording" : "Record Stream"}
        </Button>
      )}
      <Button
        disabled={isPending || isHost}
        onClick={toggleFollow}
        variant="primary"
        size="sm"
        className="w-full lg:w-auto"
      >
        <Heart
          className={cn(
            "h-4 w-4 mr-2",
            isFollowing ? "fill-white" : "fill-none"
          )}
        />
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
};

export const ActionsSkeleton = () => {
  return <Skeleton className="h-10 w-full lg:w-24" />;
};
