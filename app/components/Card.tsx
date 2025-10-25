"use client";

import Image from "next/image";
import { Card as CardType } from "@/lib/gameContext";

interface CardProps {
	card: CardType | null;
	isFaceUp: boolean;
	player: "player1" | "player2" | "player" | "computer";
	playerName?: string;
	className?: string;
}

export function Card({ card, isFaceUp, player, playerName, className = "" }: CardProps) {
	const cardBack = (player === "player" || player === "player1") ? "red_joker" : "black_joker";

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
					{playerName || (player === "player" ? "You" : player === "computer" ? "Computer" : player)}
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
