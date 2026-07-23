# Vision Board (StillBoard)

StillBoard is a modern, visual productivity tool built with Next.js and Supabase. It helps you organize your ideas, goals, and tasks through an interactive, spatially-free canvas experience.

## ✨ Features

- **Spacious Canvas**: Drag and drop cards anywhere—no rigid grids.
- **Smart Sorting**: Automatically categorizes your cards by importance and priority.
- **Rich Media Support**: Upload images or directly watch videos from the dashboard.
- **Task Management**: Break down goals into manageable subtasks and track completion.
- **Authentication**: Secure login powered by Clerk.
- **Real-time Sync**: Instant updates across all your devices with Supabase Realtime.
- **One Click Email**: You can send your boards directly to your email.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- [Git](https://git-scm.com/)
- [Supabase Account](https://supabase.com/)
- [Clerk Account](https://clerk.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Vision-Board
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Copy the example environment file and fill in your credentials:
    ```bash
    cp .env.example .env.local
    ```

    Edit `.env.local` with your actual API keys:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # Clerk
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key

    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated routes
│   ├── dashboard/           # Main dashboard
│   ├── goals/               # Goal tracking
│   ├── tasks/               # Task management
│   ├── collections/         # Collections view
│   └── sign-in/             # Authentication pages
├── components/             # Reusable React components
│   ├── ui/                  # UI primitives (shadcn/ui based)
│   ├── canvas/              # Main board canvas components
│   ├── cards/               # Card components
│   ├── editor/              # Card editor/modal
│   └── layout/              # Layout components (Sidebar, Header)
├── lib/                    # Utility functions and helpers
│   ├── supabase.ts          # Supabase client
│   ├── utils.ts             # General utilities
│   └── validation.ts        # Zod schemas
├── context/                 # React Context providers
├── hooks/                   # Custom React hooks
├── styles/                  # Global styles and Tailwind config
└── assets/                  # Static assets
    └── images/              # Images and logo
```

## 🎨 Design & Technology

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with Custom Themes
- **Database**: Supabase
- **Authentication**: Clerk
- **Email**: Resend
- **State Management**: Zustand, React Context
- **Animation**: Framer Motion



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
