import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';

class EnhancedZoomService {
  constructor() {
    this.baseUrl = 'https://api.zoom.us/v2';
    // Keep fallback credentials for system-wide operations
    this.fallbackAccountId = process.env.ZOOM_ACCOUNT_ID;
    this.fallbackClientId = process.env.ZOOM_CLIENT_ID;
    this.fallbackClientSecret = process.env.ZOOM_SECRET_KEY;
  }

  // Decrypt stored tokens
  decryptToken(encryptedToken) {
    const key = process.env.ENCRYPTION_KEY;
    const textParts = encryptedToken.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Refresh access token if expired
  async refreshAccessToken(instructor) {
    try {
      const refreshToken = this.decryptToken(instructor.zoomRefreshToken);
      
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_OAUTH_CLIENT_ID}:${process.env.ZOOM_OAUTH_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await response.json();
      
      // Update instructor with new tokens
      instructor.zoomAccessToken = this.encryptToken(tokens.access_token);
      if (tokens.refresh_token) {
        instructor.zoomRefreshToken = this.encryptToken(tokens.refresh_token);
      }
      instructor.zoomTokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);
      await instructor.save();

      return tokens.access_token;
    } catch (error) {
      console.error('Error refreshing Zoom token:', error);
      throw error;
    }
  }

  // Encrypt token for storage
  encryptToken(token) {
    const key = process.env.ENCRYPTION_KEY;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Get valid access token for instructor
  async getInstructorAccessToken(instructorId) {
    try {
      await dbConnect();
      const instructor = await User.findById(instructorId);
      
      if (!instructor || !instructor.isZoomConnected) {
        throw new Error('Instructor Zoom account not connected');
      }

      // Check if token is expired
      if (new Date() >= instructor.zoomTokenExpiry) {
        return await this.refreshAccessToken(instructor);
      }

      return this.decryptToken(instructor.zoomAccessToken);
    } catch (error) {
      console.error('Error getting instructor access token:', error);
      throw error;
    }
  }

  // Make authenticated API request with instructor's token
  async makeInstructorZoomRequest(instructorId, endpoint, method = 'GET', body = null) {
    try {
      const accessToken = await this.getInstructorAccessToken(instructorId);
      
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const config = {
        method,
        headers
      };

      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Zoom API error: ${response.status} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Instructor Zoom API request error:', error);
      throw error;
    }
  }

  // Create meeting using instructor's account
  async createInstructorMeeting(instructorId, meetingData) {
    try {
      const {
        title,
        description = '',
        scheduledDate,
        duration = 60,
        timezone = 'UTC',
        password,
        waitingRoom = true,
        joinBeforeHost = false,
        muteParticipants = true,
        approval_type = 0, // 0: Automatically approve, 1: Manually approve, 2: No registration required
        registration_type = 1, // 1: Attendees register once, 2: Attendees register for each occurrence, 3: Attendees register once for all occurrences
        meeting_authentication = false,
        waiting_room = true
      } = meetingData;

      const meetingPayload = {
        topic: title,
        type: 2, // Scheduled meeting
        start_time: this.formatDateForZoom(new Date(scheduledDate)),
        duration: duration,
        timezone: timezone,
        password: password,
        agenda: description,
        settings: {
          host_video: true,
          participant_video: false,
          cn_meeting: false,
          in_meeting: false,
          join_before_host: joinBeforeHost,
          mute_participants_upon_entry: muteParticipants,
          watermark: false,
          use_pmi: false,
          approval_type: approval_type,
          registration_type: registration_type,
          audio: 'both',
          auto_recording: 'none',
          enforce_login: false,
          enforce_login_domains: '',
          alternative_hosts: '',
          close_registration: false,
          show_share_button: true,
          allow_multiple_devices: true,
          meeting_authentication: meeting_authentication,
          waiting_room: waiting_room
        }
      };

      console.log('Creating Zoom meeting for instructor:', instructorId, 'with data:', meetingPayload);
      
      const meeting = await this.makeInstructorZoomRequest(instructorId, '/users/me/meetings', 'POST', meetingPayload);
      
      return {
        success: true,
        meeting: {
          id: meeting.id,
          uuid: meeting.uuid,
          topic: meeting.topic,
          start_time: meeting.start_time,
          duration: meeting.duration,
          timezone: meeting.timezone,
          join_url: meeting.join_url,
          start_url: meeting.start_url,
          password: meeting.password,
          host_email: meeting.host_email,
          host_id: meeting.host_id
        }
      };
    } catch (error) {
      console.error('Error creating instructor Zoom meeting:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Zoom meeting'
      };
    }
  }

  // Update meeting using instructor's account
  async updateInstructorMeeting(instructorId, meetingId, updateData) {
    try {
      const meeting = await this.makeInstructorZoomRequest(instructorId, `/meetings/${meetingId}`, 'PATCH', updateData);
      return {
        success: true,
        meeting: meeting
      };
    } catch (error) {
      console.error('Error updating instructor Zoom meeting:', error);
      return {
        success: false,
        error: error.message || 'Failed to update Zoom meeting'
      };
    }
  }

  // Delete meeting using instructor's account
  async deleteInstructorMeeting(instructorId, meetingId) {
    try {
      await this.makeInstructorZoomRequest(instructorId, `/meetings/${meetingId}`, 'DELETE');
      return {
        success: true,
        message: 'Meeting deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting instructor Zoom meeting:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete Zoom meeting'
      };
    }
  }

  // Get meeting details using instructor's account
  async getInstructorMeeting(instructorId, meetingId) {
    try {
      const meeting = await this.makeInstructorZoomRequest(instructorId, `/meetings/${meetingId}`, 'GET');
      return {
        success: true,
        meeting: meeting
      };
    } catch (error) {
      console.error('Error getting instructor Zoom meeting:', error);
      return {
        success: false,
        error: error.message || 'Failed to get Zoom meeting'
      };
    }
  }

  // Check if instructor has Zoom connected
  async isInstructorZoomConnected(instructorId) {
    try {
      await dbConnect();
      const instructor = await User.findById(instructorId);
      return instructor && instructor.isZoomConnected && instructor.zoomTokenExpiry > new Date();
    } catch (error) {
      console.error('Error checking instructor Zoom connection:', error);
      return false;
    }
  }

  // Disconnect instructor's Zoom account
  async disconnectInstructorZoom(instructorId) {
    try {
      await dbConnect();
      const instructor = await User.findById(instructorId);
      
      if (instructor) {
        instructor.zoomUserId = null;
        instructor.zoomAccessToken = null;
        instructor.zoomRefreshToken = null;
        instructor.zoomTokenExpiry = null;
        instructor.zoomConnectedAt = null;
        instructor.isZoomConnected = false;
        instructor.zoomUserEmail = null;
        instructor.zoomUserName = null;
        
        await instructor.save();
      }

      return { success: true };
    } catch (error) {
      console.error('Error disconnecting instructor Zoom:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility function to format date for Zoom API
  formatDateForZoom(date) {
    return date.toISOString().replace('.000Z', 'Z');
  }

  // Fallback methods using your original service for system operations
  // Keep your existing methods here as fallback...
}

const enhancedZoomService = new EnhancedZoomService();
export default enhancedZoomService;