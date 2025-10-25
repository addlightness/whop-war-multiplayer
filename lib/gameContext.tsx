"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

// Card types
export interface Card {
	suit: "hearts" | "diamonds" | "clubs" | "spades";
	rank: number; // 2-14 (Ace = 14)
	name: string; // e.g., "ace_of_hearts"
}

// Game state
interface GameState {
	playerDeck: Card[];
	computerDeck: Card[];
	playerCard: Card | null;
	computerCard: Card | null;
	playerWarCards: Card[]; // 3 face-down cards during war
	computerWarCards: Card[]; // 3 face-down cards during war
	gameStatus: "waiting" | "playing" | "war" | "finished";
	winner: "player" | "computer" | null;
	playerScore: number;
	computerScore: number;
	message: string;
}

// Game actions
type GameAction =
	| { type: "START_GAME" }
	| { type: "DRAW_CARDS" }
	| { type: "RESOLVE_WAR" }
	| { type: "RESET_GAME" };

// Initial state
const initialState: GameState = {
	playerDeck: [],
	computerDeck: [],
	playerCard: null,
	computerCard: null,
	playerWarCards: [],
	computerWarCards: [],
	gameStatus: "waiting",
	winner: null,
	playerScore: 0,
	computerScore: 0,
	message: "Click 'Start Game' to begin!",
};

// Card creation helper
function createCard(name: string): Card {
	const parts = name.replace(".png", "").split("_");
	const rankStr = parts[0];
	const suit = parts[2] as Card["suit"];

	let rank: number;
	if (rankStr === "ace") rank = 14;
	else if (rankStr === "king") rank = 13;
	else if (rankStr === "queen") rank = 12;
	else if (rankStr === "jack") rank = 11;
	else rank = parseInt(rankStr);

	return { suit, rank, name };
}

// Format card name for display
function formatCardName(name: string): string {
	return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// Format card rank for war messages
function formatCardRank(name: string): string {
	const parts = name.replace(".png", "").split("_");
	const rankStr = parts[0];

	if (rankStr === "ace") return "Aces";
	else if (rankStr === "king") return "Kings";
	else if (rankStr === "queen") return "Queens";
	else if (rankStr === "jack") return "Jacks";
	else return `${rankStr}s`;
}

// Fisher-Yates shuffle
function shuffleDeck(deck: Card[]): Card[] {
	const shuffled = [...deck];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// Create full deck
function createDeck(): Card[] {
	const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
	const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];

	const deck: Card[] = [];
	suits.forEach(suit => {
		ranks.forEach(rank => {
			deck.push(createCard(`${rank}_of_${suit}`));
		});
	});

	return shuffleDeck(deck);
}

// Game reducer
function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case "START_GAME": {
			const deck = createDeck();
			const shuffledDeck = shuffleDeck(deck);

			return {
				...state,
				playerDeck: shuffledDeck.slice(0, 26),
				computerDeck: shuffledDeck.slice(26),
				gameStatus: "playing",
				message: "Game started! Click 'Draw Cards' to play.",
				playerCard: null,
				computerCard: null,
				playerWarCards: [],
				computerWarCards: [],
				winner: null,
				playerScore: 0,
				computerScore: 0,
			};
		}

		case "DRAW_CARDS": {
			if (state.gameStatus !== "playing") return state;

			const playerCard = state.playerDeck[0];
			const computerCard = state.computerDeck[0];

			if (!playerCard || !computerCard) {
				// Game over
				const winner = state.playerDeck.length > state.computerDeck.length ? "player" : "computer";
				return {
					...state,
					gameStatus: "finished",
					winner,
					message: winner === "player" ? "🎉 You won!" : "💻 Computer won!",
				};
			}

			// Remove cards from decks
			const newPlayerDeck = state.playerDeck.slice(1);
			const newComputerDeck = state.computerDeck.slice(1);

			// Compare cards
			if (playerCard.rank > computerCard.rank) {
				// Player wins
				return {
					...state,
					playerDeck: [...newPlayerDeck, playerCard, computerCard],
					computerDeck: newComputerDeck,
					playerCard,
					computerCard,
					message: `You win! ${formatCardName(playerCard.name)} beats ${formatCardName(computerCard.name)}`,
				};
			} else if (computerCard.rank > playerCard.rank) {
				// Computer wins
				return {
					...state,
					playerDeck: newPlayerDeck,
					computerDeck: [...newComputerDeck, computerCard, playerCard],
					playerCard,
					computerCard,
					message: `Computer wins! ${formatCardName(computerCard.name)} beats ${formatCardName(playerCard.name)}`,
				};
			} else {
				// War! Set up the 3 face-down cards
				const playerWarCards = newPlayerDeck.slice(0, 3);
				const computerWarCards = newComputerDeck.slice(0, 3);

				return {
					...state,
					playerDeck: newPlayerDeck.slice(3),
					computerDeck: newComputerDeck.slice(3),
					playerCard,
					computerCard,
					playerWarCards,
					computerWarCards,
					gameStatus: "war",
					message: `WAR! Both cards are ${formatCardRank(playerCard.name)}. Click to resolve the war and see the final face-down cards!`,
				};
			}
		}

		case "RESOLVE_WAR": {
			if (state.gameStatus !== "war") return state;

			// Check if we have enough cards for war resolution
			if (state.playerDeck.length < 1 || state.computerDeck.length < 1) {
				const winner = state.playerDeck.length >= 1 ? "player" : "computer";
				return {
					...state,
					gameStatus: "finished",
					winner,
					message: winner === "player" ? "🎉 You won! Computer ran out of cards during war!" : "💻 Computer won! You ran out of cards during war!",
				};
			}

			// The war cards are already set up, now we need the final war card
			const playerWarCard = state.playerDeck[0];
			const computerWarCard = state.computerDeck[0];

			// Combine all war cards (original tied cards + 3 face-down + 1 face-up from each player)
			const allWarCards = [
				state.playerCard!, // Original tied card from player
				state.computerCard!, // Original tied card from computer
				...state.playerWarCards,
				...state.computerWarCards,
				playerWarCard,
				computerWarCard,
			];

			const newPlayerDeck = state.playerDeck.slice(1);
			const newComputerDeck = state.computerDeck.slice(1);

			// Compare war cards
			if (playerWarCard.rank > computerWarCard.rank) {
				// Player wins war
				return {
					...state,
					playerDeck: [...newPlayerDeck, ...allWarCards],
					computerDeck: newComputerDeck,
					playerCard: playerWarCard,
					computerCard: computerWarCard,
					playerWarCards: [],
					computerWarCards: [],
					gameStatus: "playing",
					message: `You win the war! ${formatCardName(playerWarCard.name)} beats ${formatCardName(computerWarCard.name)}`,
				};
			} else if (computerWarCard.rank > playerWarCard.rank) {
				// Computer wins war
				return {
					...state,
					playerDeck: newPlayerDeck,
					computerDeck: [...newComputerDeck, ...allWarCards],
					playerCard: playerWarCard,
					computerCard: computerWarCard,
					playerWarCards: [],
					computerWarCards: [],
					gameStatus: "playing",
					message: `Computer wins the war! ${formatCardName(computerWarCard.name)} beats ${formatCardName(playerWarCard.name)}`,
				};
			} else {
				// Another war! Set up new war cards
				const newPlayerWarCards = newPlayerDeck.slice(0, 3);
				const newComputerWarCards = newComputerDeck.slice(0, 3);

				return {
					...state,
					playerDeck: newPlayerDeck.slice(3),
					computerDeck: newComputerDeck.slice(3),
					playerCard: playerWarCard,
					computerCard: computerWarCard,
					playerWarCards: [
						state.playerCard!, // Original tied card
						...state.playerWarCards, // Previous war cards
						...newPlayerWarCards, // New war cards
					],
					computerWarCards: [
						state.computerCard!, // Original tied card
						...state.computerWarCards, // Previous war cards
						...newComputerWarCards, // New war cards
					],
					message: `Another WAR! Both cards are ${formatCardRank(playerWarCard.name)}. Click to resolve the war.`,
				};
			}
		}

		case "RESET_GAME": {
			return initialState;
		}

		default:
			return state;
	}
}

// Context
const GameContext = createContext<{
	state: GameState;
	dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(gameReducer, initialState);

	return (
		<GameContext.Provider value={{ state, dispatch }}>
			{children}
		</GameContext.Provider>
	);
}

// Hook to use game context
export function useGame() {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context;
}
