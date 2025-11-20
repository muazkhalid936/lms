"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function AgoraVideoClient({
  channelName,
  token,
  appId,
  uid,
  userRole = "student",
  classTitle = "Live Class",
  instructorName = "Instructor",
}) {
  const router = useRouter();

  const [client] = useState(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );

  const [localMic, setLocalMic] = useState(null);
  const [localCam, setLocalCam] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Handle Remote Users
  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        user.videoTrack?.play(`remote-${user.uid}`);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }

      setRemoteUsers([...client.remoteUsers]);
    });

    client.on("user-unpublished", () => {
      setRemoteUsers([...client.remoteUsers]);
    });
  }, [client]);

  // Join Channel + Create Local Tracks
  useEffect(() => {
    async function joinAgora() {
      await client.join(appId, channelName, token, uid);

      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      const cam = await AgoraRTC.createCameraVideoTrack();

      setLocalMic(mic);
      setLocalCam(cam);

      await client.publish([mic, cam]);

      cam.play("local-video");
    }

    joinAgora();

    return () => {
      client.leave();
      localCam?.stop();
      localCam?.close();
      localMic?.stop();
      localMic?.close();
    };
  }, []);

  const toggleAudio = async () => {
    if (!localMic) return;
    await localMic.setEnabled(isAudioMuted);
    setIsAudioMuted((prev) => !prev);
  };

  const toggleVideo = async () => {
    if (!localCam) return;
    await localCam.setEnabled(isVideoMuted);
    setIsVideoMuted((prev) => !prev);

    if (isVideoMuted) localCam.play("local-video");
  };

  const leaveCall = () => {
    router.push("/dashboard/student/live-classes");
  };

  const participants = remoteUsers.length + 1;

  return (
    <div className="h-[500px] bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-lg font-semibold">{classTitle}</h2>
          <p className="text-sm text-gray-300">{instructorName}</p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-white text-sm">
            👥 {participants} participants
          </span>

          <button
            onClick={toggleAudio}
            className={`${
              isAudioMuted ? "bg-red-600" : "bg-gray-600"
            } text-white p-2 rounded`}
          >
            {isAudioMuted ? "🔇" : "🎤"}
          </button>

          <button
            onClick={toggleVideo}
            className={`${
              isVideoMuted ? "bg-red-600" : "bg-gray-600"
            } text-white p-2 rounded`}
          >
            {isVideoMuted ? "📹" : "📷"}
          </button>

          <button
            onClick={leaveCall}
            className="bg-red-600 text-white px-4 py-2 rounded font-medium"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You
            </div>

            <div
              id="local-video"
              className={`w-full h-full flex items-center justify-center ${
                isVideoMuted ? "bg-gray-700" : ""
              }`}
            >
              {isVideoMuted && <div className="text-white text-6xl">👤</div>}
            </div>
          </div>

          {/* Remote Users */}
          {remoteUsers.map((user, index) => (
            <div
              key={user.uid}
              className="bg-gray-800 rounded-lg overflow-hidden relative"
            >
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Participant {index + 1}
              </div>

              <div
                id={`remote-${user.uid}`}
                className="w-full h-full bg-gray-700"
              ></div>
            </div>
          ))}

          {remoteUsers.length === 0 && (
            <div className="bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-4xl mb-2">👥</div>
                <p>Waiting for participants...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
