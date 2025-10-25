import { GameProvider } from "@/lib/gameContext";
import { WarGameTest } from "./WarGameTest";

export default function TestPage() {
	return (
		<GameProvider>
			<div className="max-w-4xl mx-auto p-8">
				<div className="text-center mb-6">
					<h1 className="text-6xl font-bold text-blue-800 mb-2">
						🃏 War Card Game Test
					</h1>
					<p className="text-xl text-gray-700">
						Test page (no Whop authentication required)
					</p>
				</div>
				<WarGameTest />
			</div>
		</GameProvider>
	);
}
