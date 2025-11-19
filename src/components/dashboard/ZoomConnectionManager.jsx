"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, CheckCircle, AlertCircle, Unlink } from 'lucide-react';
import toast from 'react-hot-toast';

const ZoomConnectionManager = ({ instructorId, initialConnectionStatus = null }) => {
  const [isConnected, setIsConnected] = useState(initialConnectionStatus?.isConnected || false);
  const [connectionData, setConnectionData] = useState(initialConnectionStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, [instructorId]);

  // Check URL params for OAuth callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const zoomConnected = urlParams.get('zoom_connected');
    const zoomError = urlParams.get('zoom_error');

    if (zoomConnected === 'success') {
      toast.success("Zoom Connected Successfully! Your account has been linked.");
      checkConnectionStatus();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (zoomError) {
      toast.error(`Zoom Connection Failed: ${getErrorMessage(zoomError)}`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const getErrorMessage = (error) => {
    const errorMessages = {
      'access_denied': 'You denied access to your Zoom account.',
      'missing_parameters': 'Missing required parameters from Zoom.',
      'token_exchange_failed': 'Failed to exchange authorization code.',
      'user_info_failed': 'Failed to retrieve your Zoom user information.',
      'instructor_not_found': 'Instructor account not found.',
      'server_error': 'An unexpected error occurred. Please try again.'
    };
    return errorMessages[error] || 'An unknown error occurred.';
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/instructor/zoom-status?instructorId=${instructorId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(data.isConnected);
        setConnectionData(data.connectionData);
      }
    } catch (error) {
      console.error('Error checking Zoom connection status:', error);
    }
  };

  const handleConnectZoom = () => {
    setIsLoading(true);
    // Redirect to Zoom OAuth
    window.location.href = `/api/auth/zoom?instructorId=${instructorId}`;
  };

  const handleDisconnectZoom = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/instructor/zoom-disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructorId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setConnectionData(null);
        toast.success("Zoom account disconnected successfully.");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(error.message || "Failed to disconnect your Zoom account.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/logo/zoom-logo.png" 
            alt="Zoom" 
            className="w-6 h-6"
            onError={(e) => e.target.style.display = 'none'}
          />
          Zoom Integration
        </CardTitle>
        <CardDescription>
          Connect your Zoom account to host meetings with your own credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <Badge variant="success" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            
            {connectionData && (
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Account:</strong> {connectionData.zoomUserName}</p>
                <p><strong>Email:</strong> {connectionData.zoomUserEmail}</p>
                <p><strong>Connected:</strong> {new Date(connectionData.connectedAt).toLocaleDateString()}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-green-600">
                ✓ You can now create meetings using your own Zoom account
              </p>
              <p className="text-sm text-green-600">
                ✓ Meetings will show your name as the host
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleDisconnectZoom}
              disabled={isDisconnecting}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect Zoom
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <Badge variant="secondary">Not Connected</Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>• Connect your Zoom account to host meetings</p>
              <p>• Meetings will use your own Zoom credentials</p>
              <p>• Students will see your name as the meeting host</p>
            </div>

            <Button
              onClick={handleConnectZoom}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect to Zoom
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You'll be redirected to Zoom to authorize the connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZoomConnectionManager;