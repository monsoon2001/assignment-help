# Acadivo Design System

Single source of truth for colour. Tokens live in `src/app/globals.css` inside the
Tailwind v4 `@theme` block; components must use the token utilities below and
never hard-code hex values or arbitrary colour classes.

## Palette

| Token | Utility | Hex | Use |
| --- | --- | --- | --- |
| `--color-primary` | `bg-primary` / `text-primary` | `#2563EB` | Primary buttons, links, active tabs, focus rings |
| `--color-primary-hover` | `hover:bg-primary-hover` | `#1D4ED8` | Hover on primary |
| `--color-primary-dark` | `active:bg-primary-dark` | `#1E40AF` | Pressed primary |
| `--color-primary-tint` | `bg-primary-tint` | `#EFF6FF` | Tinted fills (selected / hovered cards) |
| `--color-primary-tint-line` | `border-primary-tint-line` | `#BFDBFE` | Border for tinted fills |
| `--color-accent` | `text-accent` / `fill-accent` | `#F59E0B` | Stars and small highlights only |
| `--color-accent-tint` | `bg-accent-tint` | `#FEF3C7` | Accent tint |
| `--color-on-accent-tint` | `text-on-accent-tint` | `#78350F` | Text on accent tint |
| `--color-canvas` | `bg-canvas` | `#F8FAFC` | Page background |
| `--color-surface` | `bg-surface` | `#FFFFFF` | Cards, inputs, surfaces |
| `--color-line` | `border-line` | `#E2E8F0` | Borders and dividers |
| `--color-ink` | `text-ink` | `#0F172A` | Primary text |
| `--color-ink-soft` | `text-ink-soft` | `#475569` | Secondary text |
| `--color-success` | `text-success` | `#15803D` | Success text |
| `--color-success-tint` | `bg-success-tint` | `#DCFCE7` | Success background |
| `--color-danger` | `text-danger` | `#DC2626` | Error / destructive |
| `--color-danger-hover` | `hover:bg-danger-hover` | `#B91C1C` | Destructive hover |
| `--color-danger-tint` | `bg-danger-tint` | `#FEE2E2` | Error background |
| `--color-dark` | `bg-dark` | `#0F172A` | Footer / dark CTA bands |

A 60/30/10 split governs every page: mostly white and grey, blue only for
actions and selected states, amber reserved for small highlights.

## Components

- **Primary button** — `bg-primary text-white hover:bg-primary-hover active:bg-primary-dark`.
- **Secondary button** — `bg-surface text-ink border border-line`.
- **Destructive button** — `bg-danger text-white hover:bg-danger-hover`.
- **Disabled** — 50% opacity with `cursor: not-allowed`.
- **Links** — primary colour, underline on hover.
- **Focus** — every interactive element gets a visible 2px primary focus ring
  with 2px offset (see the `:focus-visible` rule in `globals.css`). Inputs draw
  their own primary border + ring on focus, and a danger border/message on error.
- **Cards** — `bg-surface`, `border-line`, very soft shadow. Selected or hovered
  cards may use `bg-primary-tint` with a `border-primary-tint-line` border.
- **Inputs** — white background, `border-line`, primary border + ring on focus,
  danger border and danger message on error.
- **Stars** — filled stars use `accent`, empty stars use `line`.

## Status badges

One shared component (`src/components/ui/status-badge.tsx`) renders every status
across the student, helper and admin surfaces. The text label is always shown so
meaning never relies on colour alone. Mapping lives in `src/lib/status-meta.ts`.

| Status | Text | Background |
| --- | --- | --- |
| Requested | `#475569` | `#F1F5F9` |
| Proposal sent | `#1D4ED8` | `#EFF6FF` |
| Accepted / Payment pending | `#1D4ED8` | `#DBEAFE` |
| In progress | `#78350F` | `#FEF3C7` |
| Revision requested | `#9A3412` | `#FFEDD5` |
| Delivered | `#4338CA` | `#EEF2FF` |
| Completed / Paid | `#15803D` | `#DCFCE7` |
| Declined / Cancelled | `#475569` | `#F1F5F9` |
| Disputed / Failed / Refunded | `#B91C1C` | `#FEE2E2` |
