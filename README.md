# Ekalavya Sports Training Platform

A modern web application for connecting athletes with coaches for sports training, performance analysis, and skill development.

## Features

- User authentication for coaches and athletes
- Dashboard with performance metrics and upcoming sessions
- Coach profiles and discovery
- Session scheduling and management
- Analytics for tracking athlete performance
- Training session planning and recording
- AR (Augmented Reality) tools for technique improvement
- Responsive design for mobile and desktop

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **UI Components**: Custom components built with Radix UI primitives and Tailwind CSS
- **State Management**: React Context and React Query
- **Routing**: React Router
- **Backend**: Express.js with TypeScript
- **Data Storage**: PostgreSQL with Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/debashis65/EkkalavyaAI.git
   cd EkkalavyaAI
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5000

## Demo Accounts

- **Coach**: coach@example.com / password123
- **Athlete**: athlete@example.com / password123

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/context` - React context providers
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions and configurations
  - `/src/pages` - Main application pages
  - `/src/types` - TypeScript type definitions
- `/server` - Backend Express application
- `/shared` - Shared types and schemas between frontend and backend