# SwiftLing - Language Learning App

## Overview

SwiftLing is a modern, interactive language learning web application built with React and Express. The app helps users learn new languages through phrase management, adaptive quizzes, and progress tracking. It features a responsive design that works seamlessly across desktop, tablet, and mobile devices.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom theme configuration and Shadcn UI components
- **State Management**: React Context for quiz state, React Query for server state
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL session store for user authentication
- **API Design**: RESTful API architecture with `/api` prefix
- **Development**: Hot module replacement and runtime error overlays

### Environment Configuration
- **Multi-Environment Support**: Local, dev, prod environments with automatic detection
- **Hostname Management**: Environment-based backend URL configuration
  - Local: `localhost:5000` (HTTP)
  - Dev: `cundi.onthewifi.com` (HTTPS)
  - Prod: `swiftlingapp.com` (HTTPS)
  - Other: Public IP fallback for custom deployments
- **Frontend Detection**: Browser-based environment detection using current hostname
- **Server Configuration**: Platform-specific networking (localhost for Windows/macOS, 0.0.0.0 for Linux)

### Database Schema
The application uses PostgreSQL as the primary database with the following main entities:
- **Users**: Stores user account information, learning preferences, and progress tracking
- **Phrases**: Manages user-created phrases with translations, categories, and proficiency levels

## Key Components

### Authentication System
- User registration and login with password validation
- Password reset functionality with email verification
- Protected routes with authentication guards
- Session-based authentication using PostgreSQL store

### Phrase Management
- Add, edit, and organize phrases with detailed metadata
- Tag system for categorizing phrases (up to 3 tags per phrase)
- Multi-language support with source and target language selection
- Notes and context fields for additional learning aids

### Quiz System
- Multiple quiz types: Multiple Choice, Spelling, and Flashcards
- Adaptive timing system with customizable presets
- Quiz navigation protection to prevent accidental data loss
- Progress tracking and performance analytics
- Real-time quiz state management using React Context

### User Interface
- Responsive design with mobile-first approach
- Dark/light mode support through CSS custom properties
- Accessible components using Radix UI primitives
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

### Client-Side Data Management
1. **React Query** manages server state with automatic caching and synchronization
2. **React Context** handles quiz state and navigation guards
3. **React Hook Form** manages form state with real-time validation
4. **Local Storage** persists UI preferences and theme settings

### Server-Side Data Flow
1. **Express middleware** handles request parsing and session management
2. **Drizzle ORM** provides type-safe database queries and migrations
3. **Validation schemas** ensure data integrity using Zod
4. **Memory storage** fallback for development without database setup

## External Dependencies

### Frontend Libraries
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom theme plugin
- **Forms**: React Hook Form with Zod resolvers
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation

### Backend Libraries
- **Database**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Session Store**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution, esbuild for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: Replit environment with PostgreSQL module
- **Hot Reloading**: Vite dev server with Express API proxy
- **Database**: Replit PostgreSQL instance or memory storage fallback

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Deployment**: Replit autoscale deployment with port configuration
- **Environment**: Production mode with optimized assets and error handling

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Connection**: Environment variable configuration for database URL
- **Fallback**: Memory storage implementation for development without database

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
- June 23, 2025. Fixed cross-platform compatibility issues for Windows, macOS, and Linux
  - Updated vite.config.ts to use __dirname instead of import.meta.dirname
  - Updated server/vite.ts with proper path resolution
  - Added cross-env dependency for Windows environment variable support
  - Fixed networking issues with platform-specific host binding: localhost for Windows/macOS, 0.0.0.0 for Linux
  - Configured reusePort option to work only on Linux where properly supported
- June 28, 2025. Implemented environment-based backend configuration system
  - Added multi-environment support (local/dev/prod/other) with automatic detection
  - Created hostname management for different deployment environments
  - Implemented browser-based environment detection using current hostname
  - Added environment info display component on dashboard
  - Updated query client to use environment-specific backend URLs
- June 28, 2025. Completed Keycloak authentication integration and route optimization
  - Fixed mixed content issues with backend authentication proxy at /api/auth/login
  - Implemented HTTPS auto-detection for seamless authentication across environments
  - Removed /app prefix from all frontend routes per user preference
  - Updated login redirects to use direct routes (/dashboard instead of /app/dashboard)
  - All app routes now use clean URLs: /dashboard, /my-phrases, /add-phrase, /quiz, /quiz-history, /settings
- January 4, 2025. Updated authentication system with new Keycloak client secret
  - Replaced client secret with: nImkIhxLdG0NKrvAkxBFBk88t7r08ltD
  - Updated both frontend and backend configurations
  - Implemented comprehensive logout system with /logout endpoint and quiz protection bypass
- January 4, 2025. Implemented backend integration for user signup functionality
  - Added quiz service URL configuration for all environments (local/dev/prod)
  - Created environment-specific signup endpoints with proper request format
  - Implemented loading states, error handling, and success notifications
  - Added toast notifications for API errors and connection issues
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```