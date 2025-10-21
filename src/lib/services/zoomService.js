import jwt from 'jsonwebtoken';

class ZoomService {
  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_SECRET_KEY;
    this.secretToken = process.env.ZOOM_SECRET_TOKEN;
    this.baseUrl = 'https://api.zoom.us/v2';
  }

  // Generate JWT token for Zoom API authentication
  generateJWT() {
    const payload = {
      iss: this.clientId,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    };
    
    return jwt.sign(payload, this.clientSecret);
  }

  // Get OAuth access token (Server-to-Server OAuth)
  async getAccessToken() {
    try {
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: this.accountId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get access token: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Zoom access token:', error);
      throw error;
    }
  }

  // Make authenticated API request to Zoom
  async makeZoomRequest(endpoint, method = 'GET', body = null) {
    try {
      const accessToken = await this.getAccessToken();
      
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Zoom API error: ${response.status} - ${errorData}`);
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        return {}; // Return empty object for empty responses
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', responseText);
        throw new Error(`Invalid JSON response from Zoom API: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Zoom API request error:', error);
      throw error;
    }
  }

  // Create a new Zoom meeting
  async createMeeting(meetingData) {
    try {
      const {
        topic,
        type = 2, // Scheduled meeting
        start_time,
        duration,
        timezone = 'UTC',
        password,
        agenda,
        settings = {}
      } = meetingData;

      // Default meeting settings
      const defaultSettings = {
        host_video: true,
        participant_video: true,
        cn_meeting: false,
        in_meeting: false,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: 'both',
        auto_recording: 'none',
        enforce_login: false,
        waiting_room: true,
        ...settings
      };

      const meetingPayload = {
        topic,
        type,
        start_time,
        duration,
        timezone,
        password,
        agenda,
        settings: defaultSettings
      };

      const meeting = await this.makeZoomRequest('/users/me/meetings', 'POST', meetingPayload);
      
      return {
        success: true,
        meeting: {
          id: meeting.id.toString(),
          topic: meeting.topic,
          start_time: meeting.start_time,
          duration: meeting.duration,
          join_url: meeting.join_url,
          start_url: meeting.start_url,
          password: meeting.password,
          timezone: meeting.timezone,
          created_at: meeting.created_at
        }
      };
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update an existing Zoom meeting
  async updateMeeting(meetingId, updateData) {
    try {
      const meeting = await this.makeZoomRequest(`/meetings/${meetingId}`, 'PATCH', updateData);
      
      return {
        success: true,
        meeting
      };
    } catch (error) {
      console.error('Error updating Zoom meeting:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete a Zoom meeting
  async deleteMeeting(meetingId) {
    try {
      await this.makeZoomRequest(`/meetings/${meetingId}`, 'DELETE');
      
      return {
        success: true,
        message: 'Meeting deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting Zoom meeting:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get meeting details
  async getMeeting(meetingId) {
    try {
      const meeting = await this.makeZoomRequest(`/meetings/${meetingId}`);
      
      return {
        success: true,
        meeting
      };
    } catch (error) {
      console.error('Error getting Zoom meeting:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get meeting participants
  async getMeetingParticipants(meetingId) {
    try {
      const participants = await this.makeZoomRequest(`/report/meetings/${meetingId}/participants`);
      
      return {
        success: true,
        participants: participants.participants || []
      };
    } catch (error) {
      console.error('Error getting meeting participants:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get meeting recordings
  async getMeetingRecordings(meetingId) {
    try {
      const recordings = await this.makeZoomRequest(`/meetings/${meetingId}/recordings`);
      
      return {
        success: true,
        recordings
      };
    } catch (error) {
      console.error('Error getting meeting recordings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List user's meetings
  async listMeetings(userId = 'me', type = 'scheduled') {
    try {
      const meetings = await this.makeZoomRequest(`/users/${userId}/meetings?type=${type}`);
      
      return {
        success: true,
        meetings: meetings.meetings || []
      };
    } catch (error) {
      console.error('Error listing meetings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature, timestamp) {
    try {
      const message = `v0:${timestamp}:${payload}`;
      const hashForVerify = crypto
        .createHmac('sha256', this.secretToken)
        .update(message, 'utf8')
        .digest('hex');
      const hashToCompare = `v0=${hashForVerify}`;
      
      return hashToCompare === signature;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  // Format date for Zoom API (ISO 8601 format)
  formatDateForZoom(date) {
    return new Date(date).toISOString();
  }

  // Generate meeting password
  generateMeetingPassword(length = 6) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

// Export singleton instance
const zoomService = new ZoomService();
export default zoomService;