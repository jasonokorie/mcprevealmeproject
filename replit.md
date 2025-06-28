# Self-Updating User Bio Chat Application

## Overview

This is a full-stack TypeScript application that demonstrates a self-updating user bio system through chat interactions. The application consists of a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration via Drizzle ORM. Users can chat with an assistant that automatically updates their bio and memory store based on conversation content using simple rule-based logic.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with custom middleware
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas shared between client and server
- **Storage**: File-based JSON storage for chat messages and memory state

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared TypeScript types between frontend and backend
- **Migrations**: Drizzle Kit for database schema management
- **Session Storage**: PostgreSQL with connect-pg-simple

## Key Components

### Frontend Components
- **ChatInterface**: Real-time chat interface with message history
- **BioDisplay**: Live-updating user bio display with refresh indicators
- **MemoryStore**: JSON viewer for memory state with export functionality
- **ApiStatus**: Real-time API connection monitoring

### Backend Services
- **Storage Service**: Handles message processing and memory updates
- **Chat Endpoints**: RESTful API for chat interactions
- **Memory Management**: CRUD operations for user memory state

### Shared Schema
- Chat message validation and typing
- Memory store structure validation
- API request/response contracts

## Data Flow

1. **User Input**: User types message in chat interface
2. **API Request**: Frontend sends chat message to `/api/chat` endpoint
3. **Message Processing**: Backend processes message with rule-based logic
4. **Memory Update**: System updates bio and facts based on message content
5. **Response**: Backend returns updated bio and assistant response
6. **UI Update**: Frontend updates chat history and bio display
7. **State Sync**: React Query manages cache invalidation and refetching

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with class-variance-authority for variants
- **Icons**: Lucide React icons and Font Awesome
- **Date Handling**: date-fns for date manipulation
- **Carousel**: Embla Carousel for image/content carousels

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for runtime type checking
- **Utilities**: nanoid for unique ID generation

### Development Dependencies
- **Build Tools**: esbuild for backend bundling, Vite for frontend
- **Development**: tsx for TypeScript execution, tsc for type checking
- **Replit Integration**: Vite plugins for Replit environment

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR on `/client` directory
- **Backend**: tsx with auto-reload on file changes
- **Database**: Neon serverless PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite build to `dist/public` directory
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend files
- **Environment**: NODE_ENV=production with optimized settings

### Database Management
- **Schema**: Defined in `shared/schema.ts` for type safety
- **Migrations**: Generated in `./migrations` directory
- **Deployment**: `drizzle-kit push` for schema updates

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```