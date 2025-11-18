import jwt from 'jsonwebtoken';

class InstructorZoomService {
  constructor(instructor) {
    this.instructor = instructor;
    this.baseUrl = 'https://api.zoom.us/v2';
  }

  // Check if instructor has valid Zoom integration
  hasValidIntegration() {
    const integration = this.instructor.zoomIntegration;
    if (!integration || !integration.accessToken) {
      return false;
    }
    
    // Check if token is expired
    return new Date() < new Date(integration.expiresAt);
  }

  // Refresh access token if needed
  async refreshAccessToken() {
    const integration = this.instructor.zoomIntegration;
    if (!integration.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_SECRET_KEY}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokenData = await response.json();

    // Update integration with new tokens
    this.instructor.zoomIntegration.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      this.instructor.zoomIntegration.refreshToken = tokenData.refresh_token;
    }
    this.instructor.zoomIntegration.expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await this.instructor.save();

    return tokenData.access_token;
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken() {
    if (this.hasValidIntegration()) {
      return this.instructor.zoomIntegration.accessToken;
    }

    // Try to refresh token
    return await this.refreshAccessToken();
  }

  // Make authenticated API request to Zoom
  async makeZoomRequest(endpoint, method = 'GET', body = null) {
    const accessToken = await this.getValidAccessToken();
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zoom API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  // Create a meeting using instructor's Zoom account
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

      console.log(`Creating Zoom meeting for instructor ${this.instructor.firstName} ${this.instructor.lastName}`);

      const meeting = await this.makeZoomRequest('/users/me/meetings', 'POST', meetingPayload);
      
      console.log('Instructor Zoom meeting created successfully:', {
        instructorId: this.instructor._id,
        instructorName: `${this.instructor.firstName} ${this.instructor.lastName}`,
        meetingId: meeting.id,
        join_url: meeting.join_url,
        start_url: meeting.start_url
      });
      
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
          created_at: meeting.created_at,
          host_id: this.instructor.zoomIntegration.zoomUserId,
          host_name: this.instructor.zoomIntegration.zoomDisplayName
        }
      };
    } catch (error) {
      console.error('Error creating instructor meeting:', error);
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
      console.error('Error getting instructor meeting:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update meeting
  async updateMeeting(meetingId, updateData) {
    try {
      await this.makeZoomRequest(`/meetings/${meetingId}`, 'PATCH', updateData);
      
      return {
        success: true,
        message: 'Meeting updated successfully'
      };
    } catch (error) {
      console.error('Error updating instructor meeting:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId) {
    try {
      await this.makeZoomRequest(`/meetings/${meetingId}`, 'DELETE');
      
      return {
        success: true,
        message: 'Meeting deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting instructor meeting:', error);
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
}

export default InstructorZoomService;