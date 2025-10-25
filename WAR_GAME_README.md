# War Card Game MVP

A simple War card game built with the Whop Next.js template.

## Features

- 🃏 Single-player War card game against the computer
- 🎯 Simple card comparison logic (Ace high)
- ⚔️ War resolution when cards tie
- 🎨 Beautiful card display with PNG assets
- 📱 Responsive design with Tailwind CSS

## How to Play

1. Click "Start Game" to begin
2. Click "Draw Cards" to reveal your card vs computer's card
3. Higher card wins both cards (Ace = 14, King = 13, Queen = 12, Jack = 11)
4. If cards tie, it's WAR! Each player plays 3 cards face-down, then 1 face-up
5. Winner of war takes all cards
6. Game ends when one player runs out of cards

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local` with your Whop credentials:
   ```
   NEXT_PUBLIC_WHOP_APP_ID=your_app_id
   WHOP_API_KEY=your_api_key
   WHOP_WEBHOOK_SECRET=your_webhook_secret
   ```
3. Run development server: `npm run dev`
4. Access at `/experiences/[experienceId]`

## Card Assets

Uses PNG card images from `/public/cards/` directory:
- Red joker as player's card back
- Black joker as computer's card back
- Standard 52-card deck (Ace through King, all suits)

## Game Logic

Built with React Context for state management:
- `lib/gameContext.tsx` - Game state and logic
- `app/components/Card.tsx` - Card display component
- `app/experiences/[experienceId]/page.tsx` - Main game UI

## MVP Scope

This is a minimal viable product focusing on:
- ✅ Single-player gameplay
- ✅ Basic War card game rules
- ✅ Simple UI with card display
- ✅ Whop integration for user authentication

Future enhancements could include:
- Multiplayer support
- Game history
- Animations
- Sound effects
- Tournament mode
