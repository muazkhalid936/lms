import crypto from "crypto";
import { RtcTokenBuilder, RtcRole } from "agora-token";

class AgoraService {
  constructor() {
    this.appId = process.env.AGORA_APP_ID;
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;
    this.baseUrl = "https://api.agora.io";
  }

  // Generate Agora RTC token for authentication
  generateToken(
    channelName,
    uid,
    role = "publisher",
    privilegeExpiredTs = 3600
  ) {
    try {
      if (!this.appId || !this.appCertificate) {
        throw new Error("Agora App ID and App Certificate are required");
      }

      // Calculate expiration time (current time + privilege duration in seconds)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expirationTimeInSeconds = currentTimestamp + privilegeExpiredTs;

      // Determine the role
      const agoraRole =
        role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      // Build the token using official Agora token builder
      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        agoraRole,
        expirationTimeInSeconds
      );

      return {
        success: true,
        token: token,
        channelName: channelName,
        uid: uid,
        expiresAt: expirationTimeInSeconds,
      };
    } catch (error) {
      console.error("Error generating Agora token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Build token (deprecated - use generateToken instead)
  buildToken(channelName, uid, role, privilegeExpiredTs) {
    return this.generateToken(channelName, uid, role, privilegeExpiredTs).token;
  }

  // Create a new Agora channel
  async createChannel(channelName, settings = {}) {
    try {
      // Generate unique channel name if not provided
      const finalChannelName = channelName || this.generateChannelName();

      // Generate tokens for different roles
      const instructorToken = this.generateToken(
        finalChannelName,
        0,
        "publisher"
      );
      const studentToken = this.generateToken(
        finalChannelName,
        Math.floor(Math.random() * 1000000),
        "subscriber"
      );

      if (!instructorToken.success || !studentToken.success) {
        throw new Error("Failed to generate tokens");
      }

      const channelData = {
        channelName: finalChannelName,
        instructorToken: instructorToken.token,
        studentToken: studentToken.token,
        appId: this.appId,
        settings: {
          maxParticipants: settings.maxParticipants || 100,
          isRecordingEnabled: settings.isRecordingEnabled || false,
          waitingRoomEnabled: settings.waitingRoomEnabled || true,
          ...settings,
        },
      };

      return {
        success: true,
        channel: channelData,
      };
    } catch (error) {
      console.error("Error creating Agora channel:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update channel settings
  async updateChannel(channelName, updateData) {
    try {
      // In a real implementation, you would update channel settings via Agora API
      // For now, we'll just return success

      return {
        success: true,
        message: "Channel updated successfully",
      };
    } catch (error) {
      console.error("Error updating Agora channel:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete channel (cleanup)
  async deleteChannel(channelName) {
    try {
      // In a real implementation, you would delete the channel via Agora API
      // For now, we'll just return success

      return {
        success: true,
        message: "Channel deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting Agora channel:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get channel information
  async getChannelInfo(channelName) {
    try {
      // In a real implementation, you would fetch channel info from Agora API
      // For now, we'll return basic info

      return {
        success: true,
        channel: {
          channelName: channelName,
          status: "active",
          participantCount: 0,
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error("Error getting Agora channel info:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate unique channel name
  generateChannelName() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `class_${timestamp}_${random}`;
  }

  // Generate channel name from class details
  generateChannelNameFromClass(courseId, instructorId, scheduledDate) {
    // Create a short, unique channel name that stays under 64 bytes
    // Agora requires: alphanumeric + underscore/hyphen, max 64 bytes

    const timestamp = new Date(scheduledDate).getTime();

    // Create a hash of the course and instructor IDs for uniqueness
    const combinedId = `${courseId}_${instructorId}_${timestamp}`;
    const hash = crypto
      .createHash("md5")
      .update(combinedId)
      .digest("hex")
      .substring(0, 12);

    // Format: class_<hash>_<timestamp>
    // Example: class_a1b2c3d4e5f6_1700000000000 (max ~35 chars)
    return `class_${hash}_${timestamp}`;
  }

  // Validate channel name
  validateChannelName(channelName) {
    // Agora channel names should be alphanumeric with underscores/hyphens
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(channelName) && channelName.length <= 64;
  }

  // Get recording information
  async getRecordingInfo(channelName) {
    try {
      // In a real implementation, you would fetch recording info from Agora API
      return {
        success: true,
        recordings: [],
      };
    } catch (error) {
      console.error("Error getting recording info:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate temporary token for joining
  generateJoinToken(channelName, uid = null) {
    try {
      // Ensure UID is a valid 32-bit unsigned integer [0, 2^32-1]
      const MAX_UID = 4294967295; // 2^32 - 1
      let userId;

      if (uid !== null && uid !== undefined) {
        const parsedUid = typeof uid === "number" ? uid : parseInt(uid, 10);
        // Validate the UID is within the valid range
        if (isNaN(parsedUid) || parsedUid < 0 || parsedUid > MAX_UID) {
          console.warn(`Invalid UID ${uid}, generating random UID instead`);
          userId = Math.floor(Math.random() * (MAX_UID + 1));
        } else {
          userId = parsedUid;
        }
      } else {
        // Generate random UID in valid range [0, 2^32-1]
        userId = Math.floor(Math.random() * (MAX_UID + 1));
      }

      const tokenResult = this.generateToken(
        channelName,
        userId,
        "publisher", // Changed to publisher so users can send audio/video
        3600
      ); // 1 hour

      if (!tokenResult.success) {
        throw new Error(tokenResult.error || "Failed to generate token");
      }

      return {
        success: true,
        token: tokenResult.token,
        uid: userId,
        channelName: channelName,
      };
    } catch (error) {
      console.error("Error generating join token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

const agoraService = new AgoraService();
export default agoraService;