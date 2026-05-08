# AI Spend Audit

AI Spend Audit is a full-stack SaaS application built using Next.js, TypeScript, Tailwind CSS, Supabase, and Vercel.

The platform helps teams identify unnecessary AI subscription spending and provides actionable optimization recommendations.

---

# Features

## Multi-Tool AI Stack Auditing

Supports auditing for:

- Cursor
- GitHub Copilot
- Claude
- ChatGPT
- Gemini
- Windsurf
- OpenAI API
- Anthropic API

---

## Smart Recommendation Engine

The application analyzes:

- subscription plans
- seat allocation
- team size
- primary use case

and generates cost-saving recommendations.

Example recommendations:

- Downgrade enterprise plans
- Reduce unused seats
- Switch to cheaper plans
- Optimize active subscriptions

---

## Savings Calculation

The audit engine calculates:

- Monthly savings
- Annual savings

in real time.

---

## Lead Capture System

The application includes a lead collection modal connected to Supabase.

Stored fields:

- Email
- Company
- Role

---

## Persistent User Data

The application stores audit form state using browser localStorage.

---

## Shareable Audit Reports

Each audit generates a unique shareable report URL.

---

# Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

## Backend

- Supabase

## Deployment

- Vercel

---

# System Architecture

## Frontend Layer

The frontend handles:

- Dashboard rendering
- Form handling
- Recommendation display
- Lead modal UI

Main file:

```txt
app/page.tsx