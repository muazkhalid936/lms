import { NextResponse } from 'next/server';
import cleanupService from '@/lib/services/cleanupService';
import { verifyToken } from '@/lib/utils/auth';

// GET - Check cleanup service status
export async function GET(request) {
  try {
    // Verify admin access (optional - you can remove this if you want it public)
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = cleanupService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        service: status,
        message: status.isRunning ? 'Cleanup service is running' : 'Cleanup service is stopped'
      }
    });
  } catch (error) {
    console.error('Error getting cleanup status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Manually trigger cleanup or control service
export async function POST(request) {
  try {
    // Verify admin access (optional - you can remove this if you want it public)
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, intervalMinutes } = body;

    switch (action) {
      case 'start':
        cleanupService.start();
        return NextResponse.json({
          success: true,
          message: 'Cleanup service started',
          data: cleanupService.getStatus()
        });

      case 'stop':
        cleanupService.stop();
        return NextResponse.json({
          success: true,
          message: 'Cleanup service stopped',
          data: cleanupService.getStatus()
        });

      case 'manual':
        const result = await cleanupService.manualCleanup();
        return NextResponse.json({
          success: true,
          message: `Manual cleanup completed. ${result.deletedCount} classes removed.`,
          data: result
        });

      case 'setInterval':
        if (!intervalMinutes || intervalMinutes < 1) {
          return NextResponse.json(
            { success: false, message: 'Invalid interval. Must be at least 1 minute.' },
            { status: 400 }
          );
        }
        
        cleanupService.setCleanupInterval(intervalMinutes);
        return NextResponse.json({
          success: true,
          message: `Cleanup interval set to ${intervalMinutes} minutes`,
          data: cleanupService.getStatus()
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action. Use: start, stop, manual, or setInterval' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in cleanup control:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}