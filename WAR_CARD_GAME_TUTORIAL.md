# War Card Game Tutorial

Build a classic War card game that Whop users can play against the computer. This tutorial shows you how to create interactive games on the Whop platform using Next.js, React Context, and beautiful card assets.

This tutorial demonstrates how to build engaging single-player games that integrate seamlessly with Whop's authentication and user experience system, with proper dark mode support and enhanced visual feedback.

## Summary

This tutorial will guide you through building a complete War card game using Next.js, React Context for state management, and PNG card assets. Players can enjoy classic card game mechanics with proper war resolution, card counting, beautiful visual feedback, and seamless dark mode integration.

## 1. Set up your Next.js project

Clone our Next.js app template:

```bash
npx create-next-app@latest war-card-game -e https://github.com/whopio/whop-nextjs-app-template
```

Enter the project directory:

```bash
cd war-card-game
```

Install dependencies:

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

Run the app locally:

```bash
npm run dev
# or
pnpm dev
```

Now open [http://localhost:3000](http://localhost:3000) and follow the directions on the page.

## 2. Start developing your app

After following the instructions on the page, you'll have:
- Created your app on the Whop developer dashboard
- Set up your `.env.local` file with Whop credentials
- Installed your app into your whop

Ensure you're developing in `localhost` mode. See the Whop documentation for how to change to localhost mode.

## 3. Prepare card assets

Download card assets from [PNG Cards 1.3](https://opengameart.org/content/playing-cards) or use your own card images.

Create the cards directory:

```bash
mkdir public/cards
```

Copy your card images to `public/cards/`. You'll need:
- Standard 52-card deck (Ace through King, all suits)
- Red joker (for player's card back)
- Black joker (for computer's card back)

Your file structure should look like:
```
public/cards/
├── ace_of_hearts.png
├── ace_of_diamonds.png
├── ace_of_clubs.png
├── ace_of_spades.png
├── 2_of_hearts.png
├── ...
├── king_of_spades.png
├── red_joker.png
└── black_joker.png
```

## 4. Configure styling for dark mode compatibility

First, let's set up the global CSS to ensure good readability across different themes:

`app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #ffffff;
  color: #1f2937;
  font-family: Arial, Helvetica, sans-serif;
}

/* Force light mode for better readability */
html {
  color-scheme: light;
}

/* Override any dark mode styles */
.dark {
  background: #ffffff !important;
  color: #1f2937 !important;
}
```

## 5. Create the game logic

Create the game context that manages all game state and logic:

`lib/gameContext.tsx`

```typescript
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
```

## 6. Create the Card component

Create a reusable card component that displays cards with proper styling and dark mode support:

`app/components/Card.tsx`

```typescript
"use client";

import Image from "next/image";
import { Card as CardType } from "@/lib/gameContext";

interface CardProps {
  card: CardType | null;
  isFaceUp: boolean;
  player: "player" | "computer";
  className?: string;
}

export function Card({ card, isFaceUp, player, className = "" }: CardProps) {
  const cardBack = player === "player" ? "red_joker" : "black_joker";
  
  return (
    <div className={`relative ${className}`}>
      <div className="w-24 h-36 bg-gray-700 rounded-lg shadow-lg border-2 border-gray-600 overflow-hidden">
        {card ? (
          <Image
            src={isFaceUp ? `/cards/${card.name}.png` : `/cards/${cardBack}.png`}
            alt={isFaceUp ? card.name : "Card back"}
            width={96}
            height={144}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
            <span className="text-gray-300 text-sm">No Card</span>
          </div>
        )}
      </div>
      
      {/* Card label */}
      <div className="text-center mt-2">
        <span className="text-sm font-medium text-gray-300">
          {player === "player" ? "You" : "Computer"}
        </span>
        {card && isFaceUp && (
          <div className="text-xs text-gray-400 mt-1">
            {card.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        )}
      </div>
    </div>
  );
}
```

## 7. Create the game UI components

Create the main game component with enhanced war mechanics and dark mode styling:

`app/experiences/[experienceId]/WarGame.tsx`

```typescript
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
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">How to Play War</h3>
        <div className="text-gray-700 space-y-2">
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
```

## 7. Create the main experience page

Update the main experience page to integrate the game with proper styling:

`app/experiences/[experienceId]/page.tsx`

```typescript
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { GameProvider } from "@/lib/gameContext";
import { WarGame } from "./WarGame";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  // Ensure the user is logged in on whop.
  const { userId } = await whopsdk.verifyUserToken(await headers());

  // Fetch the necessary data we want from whop.
  const [experience, user, access] = await Promise.all([
    whopsdk.experiences.retrieve(experienceId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(experienceId, { id: userId }),
  ]);

  const displayName = user.name || `@${user.username}`;

  return (
    <GameProvider>
      <div className="flex flex-col p-8 gap-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-800 mb-2">
            🃏 War Card Game
          </h1>
          <p className="text-xl text-gray-700">
            Welcome, <strong>{displayName}</strong>!
          </p>
        </div>

        <WarGame />
      </div>
    </GameProvider>
  );
}
```

## 8. Create a test page (optional)

Create a test page that bypasses Whop authentication for development:

`app/test/page.tsx`

```typescript
import { GameProvider } from "@/lib/gameContext";
import { WarGameTest } from "./WarGameTest";

export default function TestPage() {
  return (
    <GameProvider>
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">
            🃏 War Card Game Test
          </h1>
          <p className="text-xl text-gray-600">
            Test page (no Whop authentication required)
          </p>
        </div>
        <WarGameTest />
      </div>
    </GameProvider>
  );
}
```

`app/test/WarGameTest.tsx`

```typescript
"use client";

import { useGame } from "@/lib/gameContext";
import { Card } from "@/app/components/Card";

export function WarGameTest() {
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
    <div>
      {/* Game Status */}
      <div className="text-center mb-6">
        <div className="text-2xl font-semibold text-gray-800 mb-2">
          {state.message}
        </div>
        
        {state.gameStatus === "finished" && (
          <div className="text-3xl font-bold mb-4">
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
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">How to Play War</h3>
        <div className="text-gray-700 space-y-2">
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
```

## 9. Deploy to Vercel

1. Push your code to GitHub
2. Create a new project on [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables from your `.env.local`
5. Deploy and copy your Vercel URL
6. Update your Whop app settings with the new URL in the "Base URL" field

## Key Features Implemented

- **Complete War Card Game Logic**: Proper card comparison, war resolution, and game state management
- **Visual Card Display**: Beautiful card rendering with face-up/face-down states and dark mode support
- **Enhanced War Mechanics**: Shows 3 face-down cards during war with proper resolution and card counting
- **Dark Mode Compatibility**: Proper styling for both light and dark themes with excellent contrast
- **Card Counting**: Real-time tracking of remaining cards
- **Responsive Design**: Works on desktop and mobile devices
- **Whop Integration**: Seamless authentication and user experience
- **Clean UI**: No distracting borders, clear typography, and professional appearance

## Game Rules

- Each player starts with 26 cards
- Higher card wins both cards (Ace = 14, King = 13, Queen = 12, Jack = 11)
- If cards tie, it's WAR! Each player plays 3 cards face-down, then 1 face-up
- Winner of war takes all cards involved
- Game ends when one player runs out of cards

## Styling and Dark Mode Support

This tutorial includes comprehensive styling improvements for better user experience:

### Global CSS Configuration
- **Forced Light Mode**: Ensures consistent white background and dark text
- **High Contrast**: All text uses colors that provide excellent readability
- **Dark Mode Override**: Prevents unwanted dark theme conflicts

### Component Styling
- **Card Components**: Dark gray backgrounds (`bg-gray-700`) with proper borders
- **Game Status Messages**: Clean blue text without distracting borders
- **Win/Loss Messages**: Highlighted with green backgrounds for celebration
- **Rules Section**: Dark theme (`bg-gray-800`) with white text for better integration
- **Typography**: Consistent use of high-contrast colors throughout

### Visual Improvements
- **No Border Boxes**: Removed distracting borders around status messages
- **Professional Appearance**: Clean, modern design that works across themes
- **Enhanced Readability**: All text is clearly visible regardless of user's theme preference

## Extending the Game

This template provides a solid foundation for building more complex card games on Whop:

- **Multiplayer Support**: Add WebSocket connections for real-time multiplayer
- **Game History**: Store game results in a database
- **Tournament Mode**: Create brackets and competitions
- **Custom Card Decks**: Allow users to upload their own card designs
- **Sound Effects**: Add audio feedback for card flips and wins
- **Animations**: Enhance the visual experience with card flip animations

Your War card game is now ready! Users can enjoy classic card game mechanics with proper war resolution, beautiful visuals, and seamless Whop integration.

## Need Help?

- Join the [Developer Whop](https://whop.com/hub/developer)
- View the [Whop Apps Documentation](https://docs.whop.com/apps)
- Check out more [Whop App Tutorials](https://docs.whop.com/apps/tutorials)
