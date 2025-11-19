// Zoom OAuth callback endpoint
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User'; // Adjust import based on your model structure

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_error=${encodeURIComponent(error)}`;
      return NextResponse.redirect(errorRedirectUrl);
    }

    if (!code || !state) {
      const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_error=missing_parameters`;
      return NextResponse.redirect(errorRedirectUrl);
    }

    // Decode state to get instructor ID
    const { instructorId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for tokens
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_OAUTH_CLIENT_ID}:${process.env.ZOOM_OAUTH_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_error=token_exchange_failed`;
      return NextResponse.redirect(errorRedirectUrl);
    }

    const tokens = await tokenResponse.json();

    // Get user info from Zoom
    const userInfoResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from Zoom');
      const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_error=user_info_failed`;
      return NextResponse.redirect(errorRedirectUrl);
    }

    const zoomUser = await userInfoResponse.json();

    // Save tokens to database (encrypt them)
    await dbConnect();
    
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_error=instructor_not_found`;
      return NextResponse.redirect(errorRedirectUrl);
    }

    // Update instructor with Zoom credentials
    instructor.zoomUserId = zoomUser.id;
    instructor.zoomAccessToken = encryptToken(tokens.access_token);
    instructor.zoomRefreshToken = encryptToken(tokens.refresh_token);
    instructor.zoomTokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);
    instructor.zoomConnectedAt = new Date();
    instructor.isZoomConnected = true;
    instructor.zoomUserEmail = zoomUser.email;
    instructor.zoomUserName = `${zoomUser.first_name} ${zoomUser.last_name}`;

    await instructor.save();

    // Redirect to success page
    const successRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_connected=success`;
    return NextResponse.redirect(successRedirectUrl);

  } catch (error) {
    console.error('Error in Zoom OAuth callback:', error);
    const errorRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor?zoom_error=server_error`;
    return NextResponse.redirect(errorRedirectUrl);
  }
}

// Encryption functions (move these to a utility file)
const crypto = require('crypto');

const encryptToken = (token) => {
  const key = process.env.ENCRYPTION_KEY; // 32 bytes key
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptToken = (encryptedToken) => {
  const key = process.env.ENCRYPTION_KEY;
  const textParts = encryptedToken.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};