"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  AgoraRTCProvider,
  useRTCClient,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useRemoteUsers,
  useJoin,
  usePublish,
  LocalVideoTrack,
  RemoteUser,
} from "agora-rtc-react";

// Inner component that uses Agora hooks
function AgoraVideoHooks({
  channelName,
  token,
  appId,
  uid,
  userRole = "student",
  classTitle = "Live Class",
  instructorName = "Instructor",
}) {
  const router = useRouter();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Get the client from the provider context
  const agoraEngine = useRTCClient();

  // Initialize local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(!isAudioMuted);
  const { localCameraTrack } = useLocalCameraTrack(!isVideoMuted);
  const remoteUsers = useRemoteUsers();

  // Sanitize and validate UID to ensure it's a valid 32-bit unsigned integer
  // Agora supports UIDs in range [0, 2^32-1] for integer mode
  const sanitizedUid = (() => {
    console.log(
      "[AgoraVideoClient] Original UID received:",
      uid,
      "Type:",
      typeof uid
    );

    if (!uid && uid !== 0) {
      console.log(
        "[AgoraVideoClient] No UID provided, using 0 (Agora will auto-assign)"
      );
      return 0;
    }

    const parsedUid = typeof uid === "number" ? uid : parseInt(uid, 10);
    console.log("[AgoraVideoClient] Parsed UID:", parsedUid);

    // Ensure UID is within valid range for 32-bit unsigned integer [0, 2^32-1]
    const MAX_UID = 4294967295; // 2^32 - 1
    if (isNaN(parsedUid) || parsedUid < 0 || parsedUid > MAX_UID) {
      console.error(
        `[AgoraVideoClient] Invalid UID ${uid} (parsed: ${parsedUid}), using 0 instead`
      );
      return 0;
    }

    console.log("[AgoraVideoClient] Using sanitized UID:", parsedUid);
    return parsedUid;
  })();

  console.log(
    "[AgoraVideoClient] Joining channel:",
    channelName,
    "with UID:",
    sanitizedUid
  );

  // Join the channel
  useJoin({
    appid: appId,
    channel: channelName,
    token: token,
    uid: sanitizedUid,
  });

  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  const toggleAudio = async () => {
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localCameraTrack) {
      await localCameraTrack.setEnabled(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const leaveCall = () => {
    router.push("/dashboard/student/live-classes");
  };

  const participants = remoteUsers.length + 1; // +1 for local user

  return (
    <div className="h-[500px] bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-lg font-semibold">{classTitle}</h2>
          <p className="text-sm text-gray-300">{instructorName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm">
            👥 {participants} participant{participants !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center space-x-2">
            {isAudioMuted ? (
              <button
                onClick={toggleAudio}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
              >
                🔇
              </button>
            ) : (
              <button
                onClick={toggleAudio}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
              >
                🎤
              </button>
            )}

            {isVideoMuted ? (
              <button
                onClick={toggleVideo}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
              >
                📹
              </button>
            ) : (
              <button
                onClick={toggleVideo}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
              >
                📷
              </button>
            )}

            <button
              onClick={leaveCall}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
              You
            </div>
            <div
              className={`w-full h-full flex items-center justify-center ${
                isVideoMuted ? "bg-gray-700" : ""
              }`}
            >
              {isVideoMuted ? (
                <div className="text-white text-6xl">👤</div>
              ) : (
                localCameraTrack && (
                  <LocalVideoTrack
                    track={localCameraTrack}
                    play={true}
                    className="w-full h-full object-cover"
                  />
                )
              )}
            </div>
          </div>

          {/* Remote Users */}
          {remoteUsers.map((user, index) => (
            <div
              key={user.uid}
              className="bg-gray-800 rounded-lg overflow-hidden relative h-full"
            >
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
                Participant {index + 1}
              </div>
              <RemoteUser
                user={user}
                playVideo={true}
                playAudio={true}
                cover="https://via.placeholder.com/400x300?text=Loading..."
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ))}

          {/* Empty slots */}
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

// Wrapper component that creates the client and provides the Agora context
export default function AgoraVideoClient(props) {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Create Agora client
    const agoraClient = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    setClient(agoraClient);

    // Cleanup on unmount
    return () => {
      agoraClient.leave();
    };
  }, []);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Initializing Agora client...</p>
        </div>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client}>
      <AgoraVideoHooks {...props} />
    </AgoraRTCProvider>
  );
}
