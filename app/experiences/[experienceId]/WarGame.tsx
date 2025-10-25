"use client";

import { useGame } from "@/lib/gameContext";
import { Card } from "@/app/components/Card";

export function WarGame() {
	const { state, dispatch } = useGame();

	const handleStartGame = () => {
		dispatch({ type: "START_GAME" });
	};

	const handleDrawCards = () => {
		dispatch({ type: "DRAW_CARDS" });
	};

	const handleResolveWar = () => {
		dispatch({ type: "RESOLVE_WAR" });
	};

	const handleResetGame = () => {
		dispatch({ type: "RESET_GAME" });
	};

	return (
		<div className="max-w-4xl mx-auto">
			{/* Game Status */}
			<div className="text-center mb-6">
				<div className="text-2xl font-bold text-blue-600 mb-2">
					{state.message}
				</div>

				{state.gameStatus === "finished" && (
					<div className="text-3xl font-bold mb-4 text-green-600 bg-green-50 px-6 py-3 rounded-lg border-2 border-green-200">
						{state.winner === "player" ? "🎉 You Won!" : "💻 Computer Won!"}
					</div>
				)}
			</div>

			{/* Score Board */}
			<div className="flex justify-center gap-8 mb-8">
				<div className="text-center">
					<div className="text-2xl font-bold text-blue-600">You</div>
					<div className="text-lg">{state.playerDeck.length} cards</div>
				</div>
				<div className="text-center">
					<div className="text-2xl font-bold text-red-600">Computer</div>
					<div className="text-lg">{state.computerDeck.length} cards</div>
				</div>
			</div>

			{/* Game Board */}
			<div className="flex justify-center items-center gap-12 mb-8">
				<div className="flex flex-col items-center gap-4">
					{/* Player's main card */}
					<Card
						card={state.playerCard}
						isFaceUp={state.gameStatus !== "waiting"}
						player="player"
						className="transform hover:scale-105 transition-transform"
					/>

					{/* Player's war cards (face-down) */}
					{state.gameStatus === "war" && state.playerWarCards.length > 0 && (
						<div className="flex gap-2">
							{state.playerWarCards.map((card, index) => (
								<Card
									key={`player-war-${index}`}
									card={card}
									isFaceUp={false}
									player="player"
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

				<div className="flex flex-col items-center gap-4">
					{/* Computer's main card */}
					<Card
						card={state.computerCard}
						isFaceUp={state.gameStatus !== "waiting"}
						player="computer"
						className="transform hover:scale-105 transition-transform"
					/>

					{/* Computer's war cards (face-down) */}
					{state.gameStatus === "war" && state.computerWarCards.length > 0 && (
						<div className="flex gap-2">
							{state.computerWarCards.map((card, index) => (
								<Card
									key={`computer-war-${index}`}
									card={card}
									isFaceUp={false}
									player="computer"
									className="w-16 h-24"
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-center gap-4">
				{state.gameStatus === "waiting" && (
					<button
						onClick={handleStartGame}
						className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg rounded-lg"
					>
						🚀 Start Game
					</button>
				)}

				{state.gameStatus === "playing" && (
					<button
						onClick={handleDrawCards}
						className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg"
					>
						🎯 Draw Cards
					</button>
				)}

				{state.gameStatus === "war" && (
					<button
						onClick={handleResolveWar}
						className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-lg animate-pulse"
					>
						⚔️ Resolve War
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

			{/* Game Rules */}
			<div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
				<h3 className="text-xl font-bold text-white mb-4">How to Play War</h3>
				<div className="text-gray-300 space-y-2">
					<p>• Each player starts with 26 cards</p>
					<p>• Click "Draw Cards" to reveal your top card</p>
					<p>• Higher card wins both cards (Ace is highest)</p>
					<p>• If cards are equal, it's WAR! Each player plays 3 cards face-down, then 1 face-up</p>
					<p>• Winner of war takes all cards</p>
					<p>• Game ends when one player runs out of cards</p>
				</div>
			</div>
		</div>
	);
}
