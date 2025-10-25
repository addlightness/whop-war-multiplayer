"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from "react";
import { Card } from "./gameContext";

// Multiplayer game state
interface MultiplayerGameState {
	// Connection state
	isConnected: boolean;
	playerId: string | null;
	playerName: string | null;
	gameId: string | null;

	// Game state
	player1Deck: number; // Just count for UI
	player2Deck: number; // Just count for UI
	player1Card: Card | null;
	player2Card: Card | null;
	player1WarCards: Card[];
	player2WarCards: Card[];
	gameStatus: "lobby" | "waiting" | "playing" | "war" | "finished";
	currentPlayer: "player1" | "player2" | null;
	winner: "player1" | "player2" | null;
	message: string;

	// Player info
	player1Name: string;
	player2Name: string;

	// Lobby state
	joinCode: string | null;
	isWaitingForOpponent: boolean;
}

// Game actions
type MultiplayerGameAction =
	| { type: "CONNECT"; payload: { playerId: string; playerName: string } }
	| { type: "DISCONNECT" }
	| { type: "JOIN_QUEUE" }
	| { type: "CREATE_GAME"; payload: { joinCode: string } }
	| { type: "JOIN_GAME"; payload: { joinCode: string } }
	| { type: "GAME_UPDATE"; payload: any }
	| { type: "OPPONENT_DISCONNECTED" }
	| { type: "DRAW_CARD" }
	| { type: "RESOLVE_WAR" }
	| { type: "RESET_GAME" };

// Initial state
const initialState: MultiplayerGameState = {
	isConnected: false,
	playerId: null,
	playerName: null,
	gameId: null,
	player1Deck: 0,
	player2Deck: 0,
	player1Card: null,
	player2Card: null,
	player1WarCards: [],
	player2WarCards: [],
	gameStatus: "lobby",
	currentPlayer: null,
	winner: null,
	message: "Welcome to Multiplayer War!",
	player1Name: "",
	player2Name: "",
	joinCode: null,
	isWaitingForOpponent: false,
};

// Game reducer
function multiplayerGameReducer(state: MultiplayerGameState, action: MultiplayerGameAction): MultiplayerGameState {
	switch (action.type) {
		case "CONNECT":
			return {
				...state,
				isConnected: true,
				playerId: action.payload.playerId,
				playerName: action.payload.playerName,
				message: "Connected! Choose how to play.",
			};

		case "DISCONNECT":
			return {
				...state,
				isConnected: false,
				gameStatus: "lobby",
				message: "Disconnected from server.",
				isWaitingForOpponent: false,
			};

		case "JOIN_QUEUE":
			return {
				...state,
				gameStatus: "waiting",
				message: "Waiting for opponent...",
				isWaitingForOpponent: true,
			};

		case "CREATE_GAME":
			return {
				...state,
				gameStatus: "waiting",
				joinCode: action.payload.joinCode,
				message: `Game created! Share code: ${action.payload.joinCode}`,
				isWaitingForOpponent: true,
			};

		case "JOIN_GAME":
			return {
				...state,
				gameStatus: "waiting",
				message: `Joining game with code: ${action.payload.joinCode}`,
			};

		case "GAME_UPDATE":
			const gameData = action.payload;
			return {
				...state,
				gameId: gameData.gameId,
				player1Deck: gameData.player1Deck,
				player2Deck: gameData.player2Deck,
				player1Card: gameData.player1Card,
				player2Card: gameData.player2Card,
				player1WarCards: gameData.player1WarCards || [],
				player2WarCards: gameData.player2WarCards || [],
				gameStatus: gameData.gameStatus,
				currentPlayer: gameData.currentPlayer,
				winner: gameData.winner,
				message: gameData.message,
				player1Name: gameData.player1Name,
				player2Name: gameData.player2Name,
				isWaitingForOpponent: false,
			};

		case "OPPONENT_DISCONNECTED":
			return {
				...state,
				gameStatus: "lobby",
				message: "Your opponent has disconnected. Returning to lobby.",
				isWaitingForOpponent: false,
				gameId: null,
			};

		case "RESET_GAME":
			return {
				...initialState,
				isConnected: state.isConnected,
				playerId: state.playerId,
				playerName: state.playerName,
			};

		default:
			return state;
	}
}

// Context
const MultiplayerGameContext = createContext<{
	state: MultiplayerGameState;
	dispatch: React.Dispatch<MultiplayerGameAction>;
	ws: WebSocket | null;
	sendMessage: (message: any) => void;
} | null>(null);

// Provider component
export function MultiplayerGameProvider({
	children,
	userId,
	userName
}: {
	children: ReactNode;
	userId?: string;
	userName?: string;
}) {
	const [state, dispatch] = useReducer(multiplayerGameReducer, initialState);
	const wsRef = useRef<WebSocket | null>(null);

	const sendMessage = (message: any) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
		}
	};

	useEffect(() => {
		// Connect to WebSocket server
		const ws = new WebSocket('ws://localhost:3001');
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('Connected to WebSocket server');
			// Generate unique player IDs even for the same Whop user for local testing
			const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const playerId = userId ? `${userId}_${uniqueId}` : `player_${uniqueId}`;
			const playerName = userName ? `${userName}_${Date.now().toString().slice(-4)}` : `Player_${Date.now().toString().slice(-4)}`;
			console.log('Generated unique player:', { playerId, playerName, originalUserId: userId, originalUserName: userName });
			dispatch({ type: "CONNECT", payload: { playerId, playerName } });
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);

				switch (message.type) {
					case 'pong':
						// Handle ping/pong for connection health
						break;
					case 'queue_joined':
						dispatch({ type: "JOIN_QUEUE" });
						break;
					case 'game_created':
						dispatch({ type: "CREATE_GAME", payload: { joinCode: message.data.joinCode } });
						break;
					case 'game_update':
						dispatch({ type: "GAME_UPDATE", payload: message.data });
						break;
					case 'opponent_disconnected':
						dispatch({ type: "OPPONENT_DISCONNECTED" });
						break;
					case 'error':
						console.error('Server error:', message.data.message);
						break;
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		ws.onclose = () => {
			console.log('Disconnected from WebSocket server');
			dispatch({ type: "DISCONNECT" });
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			dispatch({ type: "DISCONNECT" });
		};

		// Cleanup on unmount
		return () => {
			ws.close();
		};
	}, []);

	// Ping server every 30 seconds to keep connection alive
	useEffect(() => {
		if (state.isConnected) {
			const interval = setInterval(() => {
				sendMessage({ type: 'ping' });
			}, 30000);

			return () => clearInterval(interval);
		}
	}, [state.isConnected]);

	return (
		<MultiplayerGameContext.Provider value={{ state, dispatch, ws: wsRef.current, sendMessage }}>
			{children}
		</MultiplayerGameContext.Provider>
	);
}

// Hook to use multiplayer game context
export function useMultiplayerGame() {
	const context = useContext(MultiplayerGameContext);
	if (!context) {
		throw new Error("useMultiplayerGame must be used within a MultiplayerGameProvider");
	}
	return context;
}
