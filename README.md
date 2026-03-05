# x-clone

A full-stack Twitter/X clone built as a portfolio project.

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS + Shadcn UI
- Zustand (global state)
- TanStack Query (server state)
- Socket.io Client (real-time)

**Backend**
- Node.js + Express
- PostgreSQL + Prisma ORM
- Redis (caching + pub/sub)
- Socket.io (real-time)
- Auth.js (authentication)
- Cloudinary (image uploads)

**Hosting**
- Frontend: Vercel
- Backend + PostgreSQL: Railway
- Redis: Redis Cloud

## Features

- Authentication (register, login, logout)
- Create, read, and delete posts
- Like and retweet posts
- Replies and threaded conversations
- Follow and unfollow users
- Real-time feed updates
- Notifications system
- Search users and posts
- Profile pages with image uploads

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Redis running locally

### Setup

1. Clone the repository

   git clone https://github.com/YOUR_USERNAME/x-clone.git
   cd x-clone

2. Install all dependencies

   npm run install:all

3. Set up environment variables

   cp server/.env.example server/.env
   cp client/.env.example client/.env

   Fill in the values in server/.env

4. Run database migrations

   npm run db:migrate --workspace=server

5. Start the development servers

   npm run dev

- Client runs at: http://localhost:5173
- Server runs at: http://localhost:3001

## Project Structure

    x-clone/
    +-- client/         React + Vite frontend
    +-- server/         Express backend
    +-- package.json    Monorepo root