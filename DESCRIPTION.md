# Nexus-Press: A Multi-Publication Newsletter Platform

## Overview

**Nexus-Press** is a full-stack, multi-publication newsletter and content-sharing platform built with modern web technologies. It empowers individual writers and creators to launch branded publications, manage subscriber tiers, and monetize through a freemium subscription model. Readers can discover newsletters across diverse topics, subscribe to publications, engage through comments and likes, bookmark content, and share microblog-style "notes" within a community feed.

## Key Features

### For Writers/Publishers
- **Multi-Publication Management**: Create and manage branded publications with custom metadata (logo, cover image, description)
- **Rich Content Editing**: Build posts using Tiptap's rich text editor with a full starter kit for formatting
- **Post Management**: Draft, publish, and delete posts with flexible visibility control
- **Freemium Model**: Set post visibility as FREE or PREMIUM to encourage subscriptions
- **Subscriber Insights**: View subscriber lists and engagement charts per publication
- **Monetization**: Support free and premium subscription tiers

### For Readers
- **Discovery**: Browse and explore publications across science, economics, creative writing, and more
- **Flexible Subscriptions**: Subscribe to free or premium tiers; manage multiple subscriptions
- **Engagement**: Like posts, leave comments, and participate in the community
- **Content Curation**: Bookmark favorite posts for later reading
- **Microblogging**: Share short-form thoughts via the Notes feed for broader audience engagement
- **Authentication**: Secure account creation and session management with JWT tokens

### Platform Architecture
- **Real-time Reader Progress**: Visual indicator of scroll progress through articles
- **Session Management**: Middleware-enforced authentication for protected routes
- **Database-Driven**: SQLite backend with Prisma ORM for type-safe data access
- **Responsive Design**: Clean, modern UI built with React 19 and CSS modules

## Technical Stack

### Frontend
- **Framework**: Next.js 16.2.7 (React 19.2.4)
- **Styling**: CSS Modules (27.5% of codebase)
- **Editor**: Tiptap 3.25 with Starter Kit
- **UI Components**: Lucide React (icons), Recharts (analytics)
- **Type Safety**: TypeScript throughout

### Backend
- **Runtime**: Next.js API routes
- **Database**: SQLite with Prisma 7.8
- **ORM**: Prisma Client with Better SQLite3 adapter
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Session**: Cookie-based session tokens (nexus_session)

### Build & Quality
- **Dev Server**: Next.js built-in development server
- **Linting**: ESLint 9 with Next.js config
- **Language**: TypeScript 5 with strict type checking

## Database Schema

**Core Models:**
- **User**: Authors and readers with profiles (name, email, avatar, bio)
- **Publication**: Branded newsletters owned by writers, contains posts
- **Post**: Content pieces with status (DRAFT/PUBLISHED), visibility (FREE/PREMIUM), and engagement metrics
- **Subscription**: Links users to publications with tier tracking (FREE/PREMIUM)
- **Engagement**: Likes, Comments, Bookmarks, Notes (microblog feed)

**Relations:**
- Users own Publications and create Posts
- Posts have Likes, Comments, and Bookmarks from Users
- Subscriptions define access levels to premium content
- Notes enable community microblogging independent of specific posts

## Project Structure

```
src/
  app/                    Pages and layouts (Next.js App Router)
    api/                  Backend API routes for auth, posts, subscriptions
    dashboard/            Publisher dashboard (protected)
    login/                User authentication
    register/             Account creation
    p/[slug]/             Dynamic publication pages
    notes/                Microblog feed
    bookmarks/            User's saved posts
    page.tsx              Homepage
  components/             Reusable React components
    EditorWorkspace.tsx   Rich text editor with Tiptap
    Navigation.tsx        Header with auth-aware menu
    SubscribeWidget.tsx   Subscription interface
    EngagementPanel.tsx   Likes, comments, bookmarks
  lib/                    Utility functions and helpers
  middleware.ts           Route protection and auth checks
prisma/
  schema.prisma           Data model definitions
  seed.ts                 Sample data for development (3 writers + readers)
  migrations/             Database migration history
```

## Running the Project

### Development
```bash
npm run dev
```
Opens the app at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

### Database Setup
```bash
# Run migrations (if any pending)
npx prisma migrate deploy

# Seed with sample data (3 writers, 6 posts, subscriptions, engagement)
npx prisma db seed
```

### Default Test Credentials
(After seeding)
- **Alice** (science writer): alice@nexuspress.com / password123
- **Bob** (economist): bob@nexuspress.com / password123
- **Charlie** (creative writer): charlie@nexuspress.com / password123
- **John** (reader): john@example.com / password123

## Route Protection

Authenticated routes (requiring valid `nexus_session` JWT):
- `/dashboard/*` – Publisher dashboard
- Unauthenticated users are redirected to `/login` with a `from` parameter for post-login redirect

## Sample Publications (Seed Data)

1. **The Cosmic Perspective** (Alice) – Science, space, quantum mechanics
2. **Mind & Markets** (Bob) – Economics, investing, behavioral analysis
3. **Scribe's Journal** (Charlie) – Creative writing, philosophy, literary craft

Each publication ships with 2 posts spanning free and premium tiers, plus engagement (likes, comments, subscriptions).

## Development Notes

- **Database URL**: Uses SQLite local file (`./dev.db`) by default
- **Next.js Agent Rules**: See `AGENTS.md` for version-specific API guidance
- **CSS Architecture**: Modular CSS files colocated with components
- **No env setup required**: SQLite works out-of-the-box; JWT signing uses defaults in seed

---

**Nexus-Press** is a ready-to-extend platform for independent publishers. The modular component architecture and type-safe Prisma ORM make it straightforward to add features like analytics, payment integrations, or recommendation algorithms.
