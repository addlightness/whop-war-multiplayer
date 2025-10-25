import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { playerId, playerName } = await request.json();

    if (!playerId || !playerName) {
      return NextResponse.json(
        { error: 'Player ID and name are required' },
        { status: 400 }
      );
    }

    // Generate a 6-character join code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let joinCode = '';
    for (let i = 0; i < 6; i++) {
      joinCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // In a real implementation, you'd store this in a database
    // For now, we'll just return the join code
    return NextResponse.json({
      success: true,
      joinCode,
      message: 'Game created successfully'
    });

  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
