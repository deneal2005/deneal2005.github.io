---
order: 1
title: RentMate
titleLines: ['Rent', 'Mate']
summary: A trust-first marketplace for booking identity-verified companions for platonic, public plans. Coffee, events, city tours, study sessions.
kind: Web platform
year: 2026
status: Live
stack: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'NestJS', 'PostgreSQL', 'Prisma', 'Redis', 'Socket.IO', 'JWT', 'Google OAuth', 'Razorpay', 'Jest', 'Docker', 'GitHub Actions', 'Vercel', 'Railway']
features:
  - Identity verification with a government ID and a live selfie, shown as a seal that fills one notch for each check passed.
  - Escrow booking with Razorpay checkout, and wallets for customers and companions.
  - In-app chat over Socket.IO, with bios and messages scanned for phone numbers, emails, handles and links, so every plan stays on the platform.
  - Live safety tools during a meet. Check-ins, live location, and an SOS that pages the safety team.
  - A trust-and-safety admin console with seven roles, a verification queue, moderation and an audit log.
  - Automatic localisation across 20 regions and 16 currencies.
links:
  live: https://rent-mate-beryl.vercel.app/
plate: rentmate
alt: A gold verification seal of six segments over a city at night, with a brushed check mark at its centre.
detailAlt: Close-up of the seal's segments and the check mark, printed over a faint halftone glow.
screens:
  - src: ../../assets/work/rentmate-home.jpg
    alt: The RentMate homepage. The headline reads “Good company, on the record.” beside a trust score of 96 out of 100 inside a verification ring.
    caption: The homepage, live on Vercel.
  - src: ../../assets/work/rentmate-phone.jpg
    alt: The RentMate homepage on a phone, with the headline, a city and plan search, and the verification ring below.
    caption: The same page on a phone.
  - src: ../../assets/work/rentmate-safety.jpg
    alt: The RentMate safety page, headed “Safety isn’t a feature. It’s the whole point.”, with six cards from identity verification to repeat-violation enforcement.
    caption: The safety page.
---

## What it is

RentMate is a marketplace for booking identity-verified companions for everyday plans: coffee, events, city tours, study sessions. It is explicitly not a dating service. The product is built to keep every meet platonic, public and accountable: verification before anyone can book, contact only inside the app, and live safety tools while the meet is happening.

## How it’s built

One repository, two applications. The web app is Next.js with React and TypeScript. The backend is a *NestJS API on PostgreSQL* through Prisma, with Redis for rate limiting, one-time sign-in codes and lockouts, Socket.IO for chat, and Razorpay for payments. The web app is deployed on Vercel and the API on Railway.

## One seam between the interface and the API

Every network call in the web app goes through a single module. With no API configured, the app runs on realistic mock data. Set one environment variable and the same functions make real requests, with no change to the interface. That let the whole interface be finished before the backend existed, and it keeps local interface work fast now that it does.

## Money and permissions

The paths that move money run inside database transactions, some at serializable isolation, to keep bookings and balances consistent when requests arrive at the same time. Admin permissions come from the server across seven roles: the interface hides what a role can’t do, and the API refuses it regardless. Admin actions are written to an audit log.

## Testing and delivery

Unit and end-to-end tests run on Jest, and CI runs on GitHub Actions. Releasing the API is a deliberate two-step: deploy, then run the database migrations.

## Known limits

The legal pages are still drafts. The source code is in a private repository.

<!--
  Add your own sections here, for example:
  ## My role
  ## What was hard
  ## What I learned
-->
