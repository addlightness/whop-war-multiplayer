import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { playerId, playerName, joinCode } = await request.json();

    if (!playerId || !playerName || !joinCode) {
      return NextResponse.json(
        { error: 'Player ID, name, and join code are required' },
        { status: 400 }
      );
    }

    // Validate join code format
    if (joinCode.length !== 6 || !/^[A-Z0-9]+$/.test(joinCode)) {
      return NextResponse.json(
        { error: 'Invalid join code format' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd check if the game exists and is waiting for a player
    // For now, we'll just validate the format and return success
    return NextResponse.json({
      success: true,
      message: 'Join code validated successfully'
    });

  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
