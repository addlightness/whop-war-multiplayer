"use client";

import { useState } from "react";
import { useMultiplayerGame } from "@/lib/multiplayerGameContext";
import { Card } from "@/app/components/Card";

export function MultiplayerWarGame() {
	const { state, sendMessage } = useMultiplayerGame();
	const [joinCodeInput, setJoinCodeInput] = useState("");

	const handleQuickMatch = () => {
		sendMessage({
			type: 'join_queue',
			data: {
				playerId: state.playerId,
				name: state.playerName
			}
		});
	};

	const handleCreateGame = () => {
		sendMessage({
			type: 'create_game',
			data: {
				playerId: state.playerId,
				name: state.playerName
			}
		});
	};

	const handleJoinGame = () => {
		if (joinCodeInput.trim()) {
			sendMessage({
				type: 'join_game',
				data: {
					playerId: state.playerId,
					name: state.playerName,
					joinCode: joinCodeInput.trim().toUpperCase()
				}
			});
		}
	};

	const handleDrawCard = () => {
		sendMessage({
			type: 'game_action',
			data: {
				action: 'draw_card'
			}
		});
	};

	const handleResetGame = () => {
		sendMessage({
			type: 'reset_game',
			data: {}
		});
	};

	const isMyTurn = () => {
		if (!state.currentPlayer || !state.playerId) return false;

		// Determine if current player is "me" based on player names
		// This is a simple heuristic - in a real app you'd track this more precisely
		const isPlayer1Turn = state.currentPlayer === 'player1';
		const isMyTurnResult = isPlayer1Turn ? state.player1Name === state.playerName : state.player2Name === state.playerName;

		// Debug logging
		console.log('Turn check:', {
			currentPlayer: state.currentPlayer,
			playerId: state.playerId,
			playerName: state.playerName,
			player1Name: state.player1Name,
			player2Name: state.player2Name,
			isPlayer1Turn,
			isMyTurnResult
		});

		return isMyTurnResult;
	};

	const getMyCards = () => {
		if (state.currentPlayer === 'player1') {
			return {
				deck: state.player1Deck,
				card: state.player1Card,
				warCards: state.player1WarCards
			};
		} else {
			return {
				deck: state.player2Deck,
				card: state.player2Card,
				warCards: state.player2WarCards
			};
		}
	};

	const getOpponentCards = () => {
		if (state.currentPlayer === 'player1') {
			return {
				deck: state.player2Deck,
				card: state.player2Card,
				warCards: state.player2WarCards
			};
		} else {
			return {
				deck: state.player1Deck,
				card: state.player1Card,
				warCards: state.player1WarCards
			};
		}
	};

	const myCards = getMyCards();
	const opponentCards = getOpponentCards();

	// Lobby screen
	if (state.gameStatus === "lobby") {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-blue-800 mb-4">
						🃏 Multiplayer War
					</h1>
					<p className="text-xl text-gray-700 mb-6">
						{state.message}
					</p>

					{!state.isConnected && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
							Disconnected from server. Please refresh the page.
						</div>
					)}
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Quick Match */}
					<div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
						<h3 className="text-2xl font-bold text-blue-800 mb-4">⚡ Quick Match</h3>
						<p className="text-gray-700 mb-6">
							Join the matchmaking queue and play against a random opponent.
						</p>
						<button
							onClick={handleQuickMatch}
							disabled={!state.isConnected}
							className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 text-lg rounded-lg"
						>
							Find Match
						</button>
					</div>

					{/* Private Game */}
					<div className="bg-green-50 rounded-lg p-6 border border-green-200">
						<h3 className="text-2xl font-bold text-green-800 mb-4">🔒 Private Game</h3>
						<p className="text-gray-700 mb-4">
							Create a private game and share the code with a friend.
						</p>
						<button
							onClick={handleCreateGame}
							disabled={!state.isConnected}
							className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 text-lg rounded-lg mb-4"
						>
							Create Game
						</button>

						<div className="border-t border-green-300 pt-4">
							<p className="text-gray-700 mb-2">Or join with a code:</p>
							<div className="flex gap-2">
								<input
									type="text"
									value={joinCodeInput}
									onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
									placeholder="Enter code"
									className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
									maxLength={6}
								/>
								<button
									onClick={handleJoinGame}
									disabled={!state.isConnected || !joinCodeInput.trim()}
									className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
								>
									Join
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Game Rules */}
				<div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
					<h3 className="text-xl font-bold text-white mb-4">How to Play War</h3>
					<div className="text-gray-300 space-y-2">
						<p>• Each player starts with 26 cards</p>
						<p>• Players take turns drawing cards</p>
						<p>• Higher card wins both cards (Ace is highest)</p>
						<p>• If cards are equal, it's WAR! Each player plays 3 cards face-down, then 1 face-up</p>
						<p>• Winner of war takes all cards</p>
						<p>• Game ends when one player runs out of cards</p>
					</div>
				</div>
			</div>
		);
	}

	// Waiting screen
	if (state.gameStatus === "waiting") {
		return (
			<div className="max-w-4xl mx-auto text-center">
				<div className="text-4xl font-bold text-blue-800 mb-4">
					🃏 Multiplayer War
				</div>

				<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-6">
					<div className="text-xl font-bold mb-2">⏳ {state.message}</div>
					{state.joinCode && (
						<div className="text-lg">
							Share this code: <span className="font-mono font-bold text-2xl">{state.joinCode}</span>
						</div>
					)}
				</div>

				<div className="animate-pulse">
					<div className="text-2xl">🔄 Waiting for opponent...</div>
				</div>
			</div>
		);
	}

	// Game screen
	return (
		<div className="max-w-6xl mx-auto">
			{/* Game Status */}
			<div className="text-center mb-6">
				<div className="text-2xl font-bold text-blue-600 mb-2">
					{state.message}
				</div>

				{state.gameStatus === "finished" && (
					<div className="text-3xl font-bold mb-4 text-green-600 bg-green-50 px-6 py-3 rounded-lg border-2 border-green-200">
						🎉 {state.winner === 'player1' ? state.player1Name : state.player2Name} Won!
					</div>
				)}

				{/* Turn Indicator */}
				{state.gameStatus === "playing" && (
					<div className={`text-xl font-bold mb-4 px-4 py-2 rounded-lg ${isMyTurn()
						? 'bg-green-100 text-green-800 border border-green-300'
						: 'bg-gray-100 text-gray-600 border border-gray-300'
						}`}>
						{isMyTurn() ? '🎯 Your Turn' : '⏳ Waiting for opponent'}
					</div>
				)}

				{state.gameStatus === "war" && (
					<div className="text-xl font-bold mb-4 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-300">
						⚔️ WAR! {isMyTurn() ? 'Your turn to resolve' : 'Waiting for opponent'}
					</div>
				)}
			</div>

			{/* Score Board */}
			<div className="flex justify-center gap-8 mb-8">
				<div className="text-center">
					<div className="text-2xl font-bold text-blue-600">{state.player1Name}</div>
					<div className="text-lg">{state.player1Deck} cards</div>
				</div>
				<div className="text-center">
					<div className="text-2xl font-bold text-red-600">{state.player2Name}</div>
					<div className="text-lg">{state.player2Deck} cards</div>
				</div>
			</div>

			{/* Game Board */}
			<div className="flex justify-center items-center gap-12 mb-8">
				{/* Player 1 */}
				<div className="flex flex-col items-center gap-4">
					<div className="text-lg font-bold text-blue-600">{state.player1Name}</div>
					<Card
						card={state.player1Card}
						isFaceUp={state.gameStatus !== "waiting"}
						player="player1"
						playerName={state.player1Name}
						className="transform hover:scale-105 transition-transform"
					/>
					{state.gameStatus === "war" && state.player1WarCards.length > 0 && (
						<div className="flex gap-2">
							{state.player1WarCards.map((card, index) => (
								<Card
									key={`player1-war-${index}`}
									card={card}
									isFaceUp={false}
									player="player1"
									playerName={state.player1Name}
									className="w-16 h-24"
								/>
							))}
						</div>
					)}
				</div>

				<div className="text-center">
					<div className="text-3xl font-bold text-gray-700 mb-4">VS</div>
					{state.gameStatus === "war" && (
						<div className="text-xl font-bold text-red-600 animate-pulse">
							⚔️ WAR! ⚔️
						</div>
					)}
				</div>

				{/* Player 2 */}
				<div className="flex flex-col items-center gap-4">
					<div className="text-lg font-bold text-red-600">{state.player2Name}</div>
					<Card
						card={state.player2Card}
						isFaceUp={state.gameStatus !== "waiting"}
						player="player2"
						playerName={state.player2Name}
						className="transform hover:scale-105 transition-transform"
					/>
					{state.gameStatus === "war" && state.player2WarCards.length > 0 && (
						<div className="flex gap-2">
							{state.player2WarCards.map((card, index) => (
								<Card
									key={`player2-war-${index}`}
									card={card}
									isFaceUp={false}
									player="player2"
									playerName={state.player2Name}
									className="w-16 h-24"
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-center gap-4">
				{(state.gameStatus === "playing" || state.gameStatus === "war") && isMyTurn() && (
					<button
						onClick={handleDrawCard}
						className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg"
					>
						{state.gameStatus === "war" ? "⚔️ Resolve War" : "🎯 Draw Card"}
					</button>
				)}

				{state.gameStatus === "finished" && (
					<button
						onClick={handleResetGame}
						className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-lg"
					>
						🔄 Play Again
					</button>
				)}
			</div>

			{/* Connection Status */}
			<div className="mt-8 text-center">
				<div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${state.isConnected
					? 'bg-green-100 text-green-800'
					: 'bg-red-100 text-red-800'
					}`}>
					<div className={`w-2 h-2 rounded-full mr-2 ${state.isConnected ? 'bg-green-500' : 'bg-red-500'
						}`}></div>
					{state.isConnected ? 'Connected' : 'Disconnected'}
				</div>
			</div>
		</div>
	);
}
