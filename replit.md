# Ekalavya Sports Training Platform

## Overview

Ekalavya is a comprehensive sports training platform that connects athletes with coaches. The platform provides features for scheduling sessions, analyzing performance, tracking progress, and AR (augmented reality) tools for improving techniques in various sports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture with a clear separation between frontend and backend:

1. **Frontend**: React-based SPA (Single Page Application) with TypeScript
2. **Backend**: Express.js server with TypeScript
3. **Database**: PostgreSQL with Drizzle ORM
4. **API**: REST API for communication between frontend and backend
5. **Authentication**: Custom authentication system using JWT (implied from the auth-context.tsx)

The application is structured in a way that separates concerns:
- `/client`: Contains all frontend code
- `/server`: Contains all backend code
- `/shared`: Contains schema definitions and types shared between frontend and backend

## Key Components

### Frontend

1. **UI Framework**: Uses a component library based on Radix UI primitives with a design system implemented via Tailwind CSS. The UI components are organized in the Shadcn UI style.

2. **State Management**:
   - React Context for global state (authentication, theme)
   - React Query for data fetching and server state management

3. **Routing**: React Router for navigation between pages

4. **Pages**:
   - Dashboard - Overview of sessions and performance
   - Schedule - Calendar view for booking sessions
   - Coaches - Browse and connect with coaches
   - Analytics - Performance tracking and visualization
   - Training - Track and plan training sessions
   - AR Tools - Augmented reality tools for technique improvement
   - Profile - User profile management

### Backend

1. **API Server**: Express.js for handling API requests

2. **Database Access**: Drizzle ORM for type-safe database queries

3. **Routes**:
   - User management (`/api/users`)
   - Sessions management
   - Reviews
   - Analytics
   - AR metrics

### Database

Uses PostgreSQL with the following schema structure:

1. **Users Table**: Stores user information with role-based differentiation (athlete, coach, admin)
2. **User Sports**: Links users to sports they're active in (many-to-many)
3. **Sessions**: Tracks coaching sessions between athletes and coaches
4. **Reviews**: Feedback for coaches
5. **Performance Metrics**: Tracking athlete performance
6. **Training Sessions**: Records of training activities
7. **AR Metrics**: Data from augmented reality tools

Several enums are defined for consistent data categorization:
- User roles (admin, coach, athlete)
- Sports types (archery, swimming, etc.)
- Session statuses (upcoming, completed, cancelled)
- Session types (technical, performance_review, etc.)

## Data Flow

1. **Authentication Flow**:
   - User registers or logs in through the frontend
   - Backend validates credentials and issues authentication token
   - Frontend stores token and includes it in subsequent requests

2. **Session Booking Flow**:
   - Athlete browses available coaches
   - Athlete selects time slot and session type
   - Request is sent to backend for scheduling
   - Coach receives notification
   - Session is added to calendar for both users

3. **Performance Tracking Flow**:
   - Athletes record training data or use AR tools
   - Data is sent to backend for storage
   - Analytics components visualize the data for progress tracking
   - Coaches can review and provide feedback

## External Dependencies

### Frontend Dependencies

- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Styling**: Tailwind CSS, class-variance-authority
- **Data Management**: @tanstack/react-query
- **Date Handling**: date-fns
- **Form Handling**: react-hook-form, zod for validation

### Backend Dependencies

- **ORM**: drizzle-orm
- **Database**: @neondatabase/serverless (for PostgreSQL connectivity)
- **Validation**: zod, drizzle-zod

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Environment**:
   - `npm run dev` starts the development server
   - Vite handles hot module replacement

2. **Production Build**:
   - `npm run build` creates optimized production build
   - Frontend assets are compiled and placed in the `/dist/public` directory
   - Backend is bundled with esbuild

3. **Production Deployment**:
   - `npm run start` runs the production server
   - Static assets are served by the Express server

4. **Database Setup**:
   - Uses environment variable `DATABASE_URL` for database connection
   - Can use Drizzle migrations for schema updates via `npm run db:push`

The application is optimized for deployment on Replit's infrastructure, with specific configurations in the `.replit` file for port forwarding and project setup.

## Additional Notes

1. **Authentication**: Currently uses a simplified mock authentication system for demonstration purposes. In production, this should be replaced with a secure implementation using proper JWT tokens and password hashing.

2. **Database**: The schema is defined but not fully implemented in the current codebase. The storage interface outlines the required database operations.

3. **AR Features**: The platform includes specialized tools for different sports, with current implementations for archery and swimming.