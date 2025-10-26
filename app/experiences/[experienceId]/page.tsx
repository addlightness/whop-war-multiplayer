import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { MultiplayerGameProvider } from "@/lib/multiplayerGameContext";
import { MultiplayerWarGame } from "./MultiplayerWarGame";

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
		<MultiplayerGameProvider userId={userId} userName={displayName}>
			<div className="min-h-screen py-8">
				<MultiplayerWarGame />
			</div>
		</MultiplayerGameProvider>
	);
}