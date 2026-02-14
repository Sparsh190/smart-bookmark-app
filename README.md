# Smart Bookmark App

This project is built as part of the Fullstack/GenAI Role Screening Task.

The goal was to build and deploy a simple bookmark manager using:

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Deployment on Vercel

---

## ✅ Requirements Implementation

### 1. User can sign up and log in using Google (No email/password)

Implemented Google OAuth using Supabase Auth.
Only Google authentication is allowed.

---

### 2. Logged-in user can add a bookmark (URL + title)

Users can add bookmarks with:
- Title
- URL

Bookmarks are stored in the Supabase `bookmarks` table.

---

### 3. Bookmarks are private to each user

Row Level Security (RLS) is enabled on the `bookmarks` table.

Policy used:

```sql
auth.uid() = user_id