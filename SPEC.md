# Thrift Shop Web App — Build Spec

## Overview

A web app for browsing and reserving secondhand clothing items. Public-facing storefront + admin backend. No payments, no staff roles (v1).

## Roles & Auth

- **Admin**: full access. Login required.
- **User**: browses items, reserves items. Login required to reserve (can browse without account).
- No staff role in v1 — admin does everything.

## Core Features

**Admin**

- Login (email/password)
- Upload item: photos (multi-image), title, description, category, size, condition, price, quantity/status
- Edit/delete items
- Mark items as reserved/sold/available
- View list of all reservations with user info
- Dashboard: total items, items by status (available/reserved/sold), items by category, recent activity, most-reserved items

**User**

- Sign up / login
- Browse items: grid view with photos, price, size
- Filter/search: category, size, price range, condition
- Item detail page
- Reserve an item (no payment — just claims it, pending pickup)
- View own reservation history/status

## Data Model (rough)

- **Item**: id, title, description, category, size, condition, price, images[], status (available/reserved/sold), created_at
- **User**: id, name, email, password_hash, role (admin/user)
- **Reservation**: id, item_id, user_id, status (pending/confirmed/cancelled), created_at

## Design Direction

Professional but not sterile — approachable, a bit fun. Think curated boutique, not corporate SaaS. Clean grid layout, good photo presentation, warm/friendly accent color rather than default blue.

## Suggested Stack

- Next.js (App Router) + Tailwind CSS
- PostgreSQL via Prisma
- NextAuth (or simple JWT) for auth
- Image storage: local/S3-compatible bucket

Open to change — flag if you want something else.

## Explicitly Out of Scope (v1)

- Payments/checkout
- Staff role / permissions tiers
- Shipping/delivery logistics
