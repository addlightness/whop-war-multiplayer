import { Button } from "@whop/react/components";
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