# Replit.md

## Overview

This is a React-based emoticon sharing and copying application built with a modern full-stack architecture. The application allows users to browse, search, and copy various types of emoticons (디시콘, 아카콘, 카톡이모티콘, etc.) to their clipboard. It features a Pinterest-inspired UI with a masonry grid layout and comprehensive filtering capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with JSON responses
- **Data Storage**: PostgreSQL database with Drizzle ORM integration
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: Express sessions with PostgreSQL session store

### Development Environment
- **Platform**: Replit with Node.js 20, Web, and PostgreSQL 16 modules
- **Hot Reload**: Vite dev server with HMR
- **Error Handling**: Runtime error overlay for development
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## Key Components

### Database Schema
- **Emoticons Table**: Stores emoticon metadata including URL, category, subcategory, tags, and title
- **Users Table**: User authentication with username/password (prepared for future implementation)
- **Categories**: Hierarchical categorization (디시콘, 아카콘, 카톡이모티콘, 기타) with subcategories

### API Endpoints
- `GET /api/emoticons` - Retrieve emoticons with pagination and filtering
- `GET /api/emoticons/:id` - Get single emoticon details
- Search functionality with query parameters
- Category and subcategory filtering

### UI Components
- **Header**: Navigation with search functionality and user actions
- **Sidebar**: Category navigation with collapsible menu structure
- **EmoticonGrid**: Masonry layout for displaying emoticons with infinite scroll
- **CategoryMenu**: Hierarchical category selection with icons and colors

### Core Features
- **Clipboard Integration**: One-click copying of emoticon images to clipboard
- **Search**: Real-time search across emoticon titles and tags
- **Filtering**: Multi-level category and subcategory filtering
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Local Storage**: Recently copied emoticons tracking

## Data Flow

1. **Initial Load**: Application fetches emoticons with default pagination
2. **User Interaction**: Search queries and filter selections trigger new API requests
3. **State Management**: TanStack Query handles caching, background updates, and loading states
4. **Clipboard Operations**: Browser Clipboard API integration with fallback to URL copying
5. **Local Persistence**: Recently copied items stored in localStorage

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM with PostgreSQL support
- **@neondatabase/serverless**: PostgreSQL database driver
- **wouter**: Lightweight routing library
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant generation
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking and compilation
- **eslint**: Code linting (configured but not visible in files)

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code with external packages
- **Environment**: NODE_ENV=production with optimized configurations

### Replit Deployment
- **Target**: Autoscale deployment on Replit infrastructure
- **Build Command**: `npm run build` (builds both frontend and backend)
- **Start Command**: `npm run start` (runs production server)
- **Port Configuration**: Internal port 5000 mapped to external port 80

### Database Integration
- PostgreSQL 16 module configured in Replit
- Drizzle migrations in `./migrations` directory
- Environment variable `DATABASE_URL` required for database connection

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
- June 22, 2025. Added PostgreSQL database integration with Drizzle ORM
  - Replaced in-memory storage with DatabaseStorage class
  - Created database schema for emoticons and users tables
  - Populated database with 20 sample emoticons across all categories
  - Added database connection and query functionality
- June 22, 2025. Implemented recently copied emoticons main view feature
  - Added "최근 복사한 이모티콘" clickable button in sidebar
  - Created showRecentlyCopied state management across components
  - Recently copied emoticons now display in main grid when selected
  - Fixed infinite re-render loop in EmoticonGrid component
  - Updated filter bar to show appropriate titles for different views
- June 22, 2025. Converted to file upload system with drag & drop functionality
  - Replaced URL-based storage with actual file storage using multer
  - Created drag & drop upload interface with file validation
  - Files stored in uploads/ directory with unique UUIDs
  - Database schema updated to store filename, file size, and MIME type
  - Static file serving configured for uploaded images
  - Upload dialog supports drag & drop and click-to-select functionality
- June 22, 2025. Implemented hash-based duplicate detection and cleanup
  - Added SHA-256 file hash calculation for duplicate detection
  - Duplicate uploads show success message but update existing entry date
  - Failed uploads automatically cleaned from uploads folder and database
  - Database schema includes fileHash field with unique constraint
- June 22, 2025. Added dark mode and light mode toggle functionality
  - Created ThemeProvider component with localStorage persistence
  - Added sun/moon icons next to user profile icon in header
  - Updated all components with dark mode styling using CSS variables
  - Theme toggle button switches between light and dark themes
  - System preference detection for initial theme selection
- June 22, 2025. Fixed dark mode category menu visibility and upload button functionality
  - Updated CategoryMenu component with proper dark mode colors for category tabs
  - Added header upload button functionality with UploadDialog integration
  - Created variant prop system for different button styles in header vs sidebar
  - Header upload button now works on both mobile and desktop screens
- June 22, 2025. Improved mobile image display and clipboard functionality
  - Changed images from square crop to natural aspect ratio display
  - Updated mobile grid layout to show full image width with proper proportions
  - Enhanced mobile clipboard functionality with better touch device detection
  - Added mobile-specific copy methods with fallback to document.execCommand
  - Improved touch feedback with active states and scale animations
- June 22, 2025. Enhanced mobile clipboard for image copying and persistent file storage
  - Improved mobile clipboard to copy actual images instead of URLs when possible
  - Added progressive fallback: direct blob copy → canvas conversion → URL fallback
  - Fixed file persistence across deployments using persistent storage path
  - Configured uploads directory to survive deployment restarts
  - Ensured uploaded images remain accessible after redeployment
- June 22, 2025. Modified mobile behavior for image selection instead of clipboard copying
  - Disabled automatic copy events on mobile devices to prevent conflicts
  - Made images selectable on mobile with enhanced user selection properties
  - Maintained desktop clipboard functionality while improving mobile experience
  - Simplified file storage to use local uploads/ directory for consistency
  - Removed touch event handlers that interfered with natural mobile selection
- June 22, 2025. Implemented Base64 database storage to solve preview/deploy environment separation
  - Added fileData field to emoticons table for Base64 encoded image storage
  - Created /api/emoticons/:id/image endpoint to serve images from database
  - Migrated existing uploaded files to database storage with Base64 encoding
  - Updated frontend to use new database-based image API endpoint
  - Solved preview and deploy environment file sharing by centralizing storage in database
  - Both environments now share the same PostgreSQL database and see all uploaded images
- June 22, 2025. Implemented infinite scroll functionality for improved user experience
  - Replaced useQuery with useInfiniteQuery for pagination support
  - Added Intersection Observer API for automatic loading when user scrolls to bottom
  - Configured 20 emoticons per page with smooth loading transitions
  - Added loading indicators for initial load and subsequent page loads
  - Implemented proper "end of data" indicator when all emoticons are loaded
  - Scroll detection triggers 100px before reaching bottom for seamless experience
- June 22, 2025. Added clickable logo navigation to header
  - Made "이모티콘 복사" title in header clickable to return to main page
  - Added hover effects with opacity transition for better user experience
  - Integrated wouter Link component for client-side routing
- June 22, 2025. Implemented random sorting functionality
  - Added "random" option to sort cycling sequence: newest → oldest → copied → random → newest
  - Updated backend DatabaseStorage to handle random sorting with SQL RANDOM() function
  - Added proper TypeScript types for "random" sort order across all components
  - Random sorting provides completely shuffled emoticon order for discovery
- June 22, 2025. Added "전체 이모티콘" category to sidebar menu
  - Added "전체 이모티콘" as first option in categories list with Grid3X3 icon
  - Selecting "전체 이모티콘" clears all category/subcategory filters to show all emoticons
  - Visual selection state shows "전체 이모티콘" as selected when no specific category is chosen
  - Does not expand/collapse like other categories since it has no subcategories
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```