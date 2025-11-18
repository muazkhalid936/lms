"use client";
import React, { useState, useEffect } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ZoomIntegrationSettings = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [zoomStatus, setZoomStatus] = useState(null);

  useEffect(() => {
    // Check URL for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const zoomSuccess = urlParams.get('zoom_success');
    const zoomError = urlParams.get('zoom_error');

    if (zoomSuccess) {
      toast.success('Zoom account connected successfully!');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh user data
      if (onUpdate) onUpdate();
    } else if (zoomError) {
      let errorMessage = 'Failed to connect Zoom account';
      switch (zoomError) {
        case 'access_denied':
          errorMessage = 'Zoom connection was cancelled';
          break;
        case 'invalid_user':
          errorMessage = 'Invalid user for Zoom connection';
          break;
        case 'connection_failed':
          errorMessage = 'Failed to establish Zoom connection';
          break;
        default:
          errorMessage = `Zoom connection error: ${zoomError}`;
      }
      toast.error(errorMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Set initial zoom status
    updateZoomStatus();
  }, [user, onUpdate]);

  const updateZoomStatus = () => {
    if (user?.zoomIntegration?.accessToken) {
      const expiresAt = new Date(user.zoomIntegration.expiresAt);
      const now = new Date();
      
      if (expiresAt > now) {
        setZoomStatus({
          connected: true,
          displayName: user.zoomIntegration.zoomDisplayName,
          email: user.zoomIntegration.zoomEmail,
          connectedAt: new Date(user.zoomIntegration.connectedAt),
          expiresAt
        });
      } else {
        setZoomStatus({
          connected: false,
          expired: true
        });
      }
    } else {
      setZoomStatus({
        connected: false,
        expired: false
      });
    }
  };

  const handleConnectZoom = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/zoom/oauth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.oauthUrl) {
        // Redirect to Zoom OAuth
        window.location.href = data.oauthUrl;
      } else {
        throw new Error(data.message || 'Failed to initiate Zoom connection');
      }
    } catch (error) {
      console.error('Error connecting Zoom:', error);
      toast.error('Failed to initiate Zoom connection');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectZoom = async () => {
    try {
      setDisconnecting(true);
      
      const response = await fetch('/api/zoom/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Zoom account disconnected successfully');
        setZoomStatus({ connected: false, expired: false });
        if (onUpdate) onUpdate();
      } else {
        throw new Error(data.message || 'Failed to disconnect Zoom account');
      }
    } catch (error) {
      console.error('Error disconnecting Zoom:', error);
      toast.error('Failed to disconnect Zoom account');
    } finally {
      setDisconnecting(false);
    }
  };

  if (!zoomStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Loading Zoom Integration...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.5 6A4.5 4.5 0 016 1.5h12A4.5 4.5 0 0122.5 6v12a4.5 4.5 0 01-4.5 4.5H6A4.5 4.5 0 011.5 18V6zM6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6z"/>
            <path d="M8.5 8.5a1 1 0 011-1h5a1 1 0 011 1v7a1 1 0 01-1 1h-5a1 1 0 01-1-1v-7z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Zoom Integration</h3>
          <p className="text-sm text-gray-600">
            Connect your Zoom account to host meetings with your own identity
          </p>
        </div>
      </div>

      {zoomStatus.connected ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Zoom account connected</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Display Name:</span>
              <span className="text-sm text-gray-900">{zoomStatus.displayName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="text-sm text-gray-900">{zoomStatus.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Connected:</span>
              <span className="text-sm text-gray-900">
                {zoomStatus.connectedAt.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDisconnectZoom}
              disabled={disconnecting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
            >
              {disconnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              <span>{disconnecting ? 'Disconnecting...' : 'Disconnect Zoom'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {zoomStatus.expired ? (
            <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <X className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Zoom connection expired</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <X className="w-5 h-5 text-gray-600" />
              <span className="text-gray-800 font-medium">No Zoom account connected</span>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Benefits of connecting your Zoom account:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your name appears as the meeting host</li>
              <li>• Better branding and professional appearance</li>
              <li>• Full control over your meeting settings</li>
              <li>• Meeting recordings saved to your Zoom account</li>
            </ul>
          </div>

          <button
            onClick={handleConnectZoom}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            <span>{loading ? 'Connecting...' : 'Connect Zoom Account'}</span>
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Click "Connect Zoom Account" to authorize access</li>
          <li>2. Sign in to your Zoom account and grant permissions</li>
          <li>3. Future meetings will be created under your Zoom account</li>
          <li>4. Students will see you as the meeting host</li>
        </ol>
      </div>
    </div>
  );
};

export default ZoomIntegrationSettings;