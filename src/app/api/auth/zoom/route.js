// Zoom OAuth initiation endpoint
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    const clientId = process.env.ZOOM_OAUTH_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`;
    
    // Store instructor ID in state parameter for callback
    const state = Buffer.from(JSON.stringify({ instructorId })).toString('base64');
    
    const zoomAuthUrl = new URL('https://zoom.us/oauth/authorize');
    zoomAuthUrl.searchParams.append('response_type', 'code');
    zoomAuthUrl.searchParams.append('client_id', clientId);
    zoomAuthUrl.searchParams.append('redirect_uri', redirectUri);
    zoomAuthUrl.searchParams.append('scope', 'meeting:write meeting:read user:read');
    zoomAuthUrl.searchParams.append('state', state);

    return NextResponse.redirect(zoomAuthUrl.toString());
  } catch (error) {
    console.error('Error initiating Zoom OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Zoom authorization' },
      { status: 500 }
    );
  }
}