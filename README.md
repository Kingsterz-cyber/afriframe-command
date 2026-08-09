# Afriframe Command

You are an award-winning Senior Product Designer, SaaS UX Architect, Motion Designer, and React Frontend Engineer.

Your mission is to build the Afriframe Studio CMS, a premium internal dashboard used by Afriframe Studio to manage bookings, galleries, photographers, videos, and website content.

This is NOT a generic admin dashboard.

It should feel like a luxury creative operating system—similar in quality to Linear, Raycast, Framer, Vercel, Notion AI, Arc Browser, Stripe Dashboard, and Apple.

The interface must communicate luxury, elegance, simplicity, cinematic storytelling, and premium craftsmanship.

Design Philosophy

Design for calm.

The interface should never feel crowded.

Every card should breathe.

Every animation should feel intentional.

Everything should feel handcrafted.

The dashboard should feel like software built specifically for photographers and filmmakers—not an ERP.

The overall feeling should be:

 Luxury

 Cinematic

 Premium

 Minimal

 Calm

 Modern

 High-end

 Editorial

 Glassmorphism

 Apple-level polish

Theme

Dark Mode First

Background

Almost black

Not pure black.

Example

#090909

#0D0D0D

#111111

Accent Colors

Luxury Gold

Soft Champagne

Warm Amber

Very small touches of red (matching the Afriframe logo)

Never overuse colors.

White typography.

Soft gray secondary text.

Glassmorphism

Use premium glass surfaces.

Every floating element should have

 blur

 transparency

 soft borders

 subtle reflections

Example

backdrop-filter: blur(30px);

background:

rgba(255,255,255,.05)

border:

1px solid rgba(255,255,255,.08)

Cards should feel like floating glass.

Avoid heavy shadows.

Use ambient glow.

Border Radius

Large

Elegant

20px

24px

28px

Nothing boxy.

Typography

Headings

Playfair Display

Body

Inter

Buttons

Inter SemiBold

Large spacing.

Excellent hierarchy.

Motion Design

This dashboard must feel alive.

Every interaction should have motion.

Use Framer Motion.

Animations should be smooth.

No sudden movements.

Duration

250–500ms

Ease

easeOut

spring

Examples

Sidebar expands smoothly.

Cards fade while sliding upward.

Buttons slightly lift.

Images gently zoom.

Hover glows.

Counters animate.

Dropdowns scale.

Dialogs blur the background.

Notifications slide in.

Skeleton loaders shimmer.

Page transitions fade.

Everything should feel premium.

Micro Interactions

Hover cards

Glow slightly.

Buttons

Scale 1.03

Cards

Float upward 6px

Icons rotate slightly.

Images

Zoom

1.04

Progress bars animate.

Status pills pulse.

Charts animate.

Switches glide.

Toggles bounce.

Everything should feel expensive.

Responsive Design

This is extremely important.

The CMS must work perfectly on

Desktop

Laptop

Tablet

iPad

Mobile

Phones

No horizontal scrolling.

Use responsive grids.

Desktop

Sidebar visible.

Large cards.

Multi-column layout.

Tablet

Sidebar collapses.

Cards become 2 columns.

Mobile

Bottom navigation or collapsible sidebar.

Everything touch friendly.

Cards stack vertically.

Floating action buttons.

Large tap targets.

Inputs full width.

Modals fullscreen.

Tables transform into beautiful cards.

No tiny buttons.

No cramped layouts.

It should feel like a native mobile application.

Sidebar

Floating glass sidebar.

Rounded.

Contains only icons by default.

Expand on hover.

Icons

Dashboard

Bookings

Collections

Portfolio

Photographers

Clients

Notifications

Settings

Logout

Active page

Gold glow

Glass highlight

Smooth indicator animation.

Top Area

Beautiful welcome section.

Large hero card.

Exactly like the inspiration.

Rounded.

Glass.

Gold radial glow.

Title

Afriframe Studio CMS

Subtitle

Bookings, collections, uploads, and creative crew activity in one calm command surface.

Owner chip.

Live status.

Current date.

Notification icon.

Search bar.

Profile avatar.

Dashboard Cards

Today's Bookings

Pending Requests

Upcoming Shoots

Delivered Projects

Revenue

Gallery Uploads

Storage Used

Recent Activity

Cards should animate independently.

Numbers count upward.

Bookings

Premium cards.

Each booking

Customer image

Service

Date

Time

Status

Contact

Actions

Pending

Gold

Confirmed

Green

Cancelled

Gray

Large floating action menu.

Portfolio Manager

Beautiful masonry grid.

Large thumbnails.

Hover reveals

Edit

Replace

Delete

View

Upload

Drag and drop.

Multiple upload.

Smooth loading.

Progress bars.

Collections

Elegant gallery management.

Wedding

Portrait

Graduation

Events

Commercial

Fashion

Branding

Each collection

Cover photo

Photo count

Video count

Last updated

Clients

Luxury client CRM.

Profile picture.

Timeline.

Bookings.

Gallery.

Contact.

Notes.

Tags.

Search.

Filters.

Photographers

Team members.

Avatar.

Role.

Events assigned.

Availability.

Portfolio count.

Notifications

Floating notification center.

Booking received.

Upload completed.

Gallery published.

Storage warning.

Realtime style animations.

Settings

Studio logo.

Studio information.

Brand colors.

Social links.

Theme switch.

Profile.

Security.

Empty States

Beautiful illustrations.

Friendly typography.

Large icons.

Call-to-action button.

Loading States

Skeleton UI.

Animated shimmer.

Blur placeholders.

Buttons

Primary

Luxury gold gradient.

Secondary

Glass.

Ghost

Transparent.

Danger

Deep red.

Hover animations.

Inputs

Rounded.

Glass.

Focus glow.

Floating labels.

Large padding.

Search

Global search.

Animated.

Glass.

Keyboard shortcut ready.

Charts

Beautiful animated charts.

Revenue

Bookings

Growth

Visitors

Gallery uploads

Use soft gradients.

UI Components

Use premium modern components throughout:

 Glass cards

 Floating panels

 Command palette

 Animated dropdowns

 Floating context menus

 Toast notifications

 Segmented controls

 Progress rings

 Activity timeline

 Statistics cards

 Avatar groups

 Status badges

 Timeline components

 Skeleton loaders

 Empty states

 Masonry image grids

 Drag-and-drop upload zones

 Floating action buttons

 Modern dialogs

 Slide-over drawers

 Calendar picker

 Animated tabs

Accessibility

High contrast.

Keyboard navigation.

ARIA labels.

Visible focus states.

Touch-friendly.

Minimum tap size of 44px.

Tech Stack

 React + TypeScript

 Tailwind CSS

 Framer Motion

 shadcn/ui

 Lucide Icons

 React Router

 React Hook Form

 Zod

 TanStack Query (for future backend integration)

Use reusable, modular components and keep the codebase clean and scalable.

Final Goal

Create a dashboard that looks and feels like a 2026 luxury creative operating system, not a traditional admin panel. Every screen should communicate craftsmanship, elegance, and simplicity. It should be responsive enough to work flawlessly on phones, tablets, laptops, and desktops, with polished animations, premium glassmorphism, cinematic spacing, and a user experience worthy of a high-end creative brand like Afriframe Studio. use the above filr as inspirationla and working functionality use the redketcup as the afriframe logo and favicon  in the firstloader screen

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eaabe908-9cf1-4142-bec6-9853de88f5b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
