import { useEffect, useRef, useState } from "react";

import { Loader2, Pause, Play } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import YouTubePlayer from "youtube-player";
import {
  setCurrentPlaying,
  setMasterTime,
} from "../../store/slices/RoomsSlice";
import {
  reqNextSong,
  updateMasterTime,
  updatePlayState,
} from "../../socket/socket";
import type { NowPlaying } from "../../types/NowPlaying";
import { setLoading, setPlayingState } from "../../store/slices/PlayerSlice";

interface Props {
  nowPlaying: NowPlaying | null;
}

export default function AudioController({ nowPlaying }: Props) {
  const dispatch = useAppDispatch();
  const { playing, isLoading } = useAppSelector((state) => state.player);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubeRef = useRef<any>(null);

  const [currentTime, setCurrentTime] = useState(0);

  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const { auth0Id } = useAppSelector((state) => state.user);
  const isOwner = currentRoom ? currentRoom.owner.auth0Id === auth0Id : false;
  const isSongEnded =
    duration !== 0 &&
    currentTime !== 0 &&
    currentTime >= duration &&
    currentRoom;

  const handleUpdateMasterTime = ({
    currentTime,
    duration,
  }: {
    currentTime: number;
    duration: number;
  }) => {
    const masterTime = {
      currentTime,
      date: Date.now(),
      duration,
    };
    dispatch(setMasterTime(masterTime));
    updateMasterTime({
      roomId: currentRoom ? currentRoom.roomId : "",
      masterTime,
    });
    console.log({
      currentTime,
      date: Date.now(),
      duration,
    });
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      console.log("Component Mounted");
      if (!nowPlaying) return;

      if (isOwner) {
        if (nowPlaying.song.source === "jiosaavn") {
          const audio = audioRef.current;

          if (!audio) return;
          setLoading(false);
          audio.src = nowPlaying.song.url;

          audio.onloadedmetadata = () => {
            setDuration(audio.duration);
            audio.currentTime = nowPlaying.masterTime.currentTime;
          };
        } else {
          if (!youtubeRef.current) {
            youtubeRef.current = YouTubePlayer("youtube-player");
          }
          const waitUntilPlaying = () =>
            new Promise<void>((resolve) => {
              const handler = (event: { data: number }) => {
                if (event.data === 1) {
                  resolve();
                }
              };

              youtubeRef.current.on("stateChange", handler);
            });
          youtubeRef.current.loadVideoById(nowPlaying.song.url);
          await waitUntilPlaying();
          updatePlayState(true);
          await youtubeRef.current.seekTo(
            nowPlaying.masterTime.currentTime,
            true,
          );

          const updatedDuration = await youtubeRef.current.getDuration();
          setDuration(updatedDuration);

          dispatch(setPlayingState(true));
        }
        dispatch(setLoading(false));
        setCurrentTime(nowPlaying.masterTime.currentTime);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
    };
  }, [nowPlaying?.song.id]);
  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        !nowPlaying ||
        !audioRef.current ||
        !playing ||
        isSongEnded ||
        isLoading
      )
        return;
      if (
        currentRoom &&
        currentRoom.owner.auth0Id === auth0Id &&
        audioRef.current
      ) {
        let currentTime = 0;
        let updatedDuration = 0;
        if (nowPlaying.song.source === "jiosaavn") {
          currentTime = audioRef.current.currentTime;
          updatedDuration = audioRef.current.duration;
        } else {
          if (youtubeRef.current) {
            console.log("Youtube: ", await youtubeRef.current.getPlayerState());
            currentTime = await youtubeRef.current.getCurrentTime();
            updatedDuration = await youtubeRef.current.getDuration();
            setDuration(updatedDuration);
          }
        }
        setCurrentTime(currentTime);
        handleUpdateMasterTime({
          currentTime,
          duration: updatedDuration,
        });
        console.log("timer");
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [playing, isLoading]);
  useEffect(() => {
    if (isSongEnded) {
      setCurrentTime(0);
      setDuration(0);
      dispatch(setCurrentPlaying(null));
      dispatch(setLoading(true));
    }
    if (isSongEnded && isOwner) {
      reqNextSong(currentRoom.roomId);
    }
  }, [currentTime, duration]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  console.log("rerender");
  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const togglePlayback = async () => {
    if (nowPlaying) {
      if (nowPlaying.song.source === "jiosaavn" && audioRef.current) {
        if (playing) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
      } else if (youtubeRef.current) {
        if (playing) {
          youtubeRef.current.pauseVideo();
        } else {
          youtubeRef.current.playVideo();
        }
      }
      handleSetPlayingState(!playing);
    }
  };

  const handleSetPlayingState = (state: boolean) => {
    dispatch(setPlayingState(state));
    updatePlayState(state);
  };

  useEffect(() => {
    if (!isOwner && nowPlaying) {
      setCurrentTime(nowPlaying.masterTime.currentTime);
      setDuration(nowPlaying.masterTime.duration);
      setLoading(false);
    }
  }, [nowPlaying?.masterTime]);

  return (
    <>
      <audio
        ref={audioRef}
        onLoadStart={async () => {
          try {
            await audioRef.current?.play();
            dispatch(setPlayingState(true));
            updatePlayState(true);
          } catch (err) {
            console.error(err);
          }
        }}
        hidden
        autoPlay
      />

      <div
        id="youtube-player"
        style={{
          width: 1,
          height: 1,
          overflow: "hidden",
          position: "absolute",
        }}
      />

      <div className="mt-6">
        <div className="h-2 bg-slate-800 rounded-full">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex justify-center items-center ">
        {isLoading ? (
          <button
            className="w-14
            h-14
            rounded-full
            bg-violet-600
            hover:bg-violet-500
            transition
            flex
            items-center
            justify-center
            cursor-wait"
          >
            <Loader2 className="animate-spin" size={24} />
          </button>
        ) : (
          <button
            onClick={togglePlayback}
            disabled={!isOwner}
            className="
            w-14
            h-14
            rounded-full
            bg-violet-600
            hover:bg-violet-500
            transition
            flex
            items-center
            justify-center
            cursor-pointer
          "
          >
            {playing ? <Pause /> : <Play />}
          </button>
        )}
      </div>
    </>
  );
}
