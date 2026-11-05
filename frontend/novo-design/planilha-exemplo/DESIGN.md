---
name: Judicial Analytics System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max-width: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for precision, authority, and high-stakes administrative accuracy. It caters to legal professionals, accountants, and judicial clerks who require a high-density information environment that minimizes cognitive load while maximizing trust.

The aesthetic follows a **Modern Corporate** movement. It prioritizes functional clarity over decorative elements, utilizing a structured layout that feels like a digital evolution of traditional legal documentation. The interface is sober and intentional, evoking a sense of reliability and institutional stability.

## Colors
The palette is anchored by **Navy Blue (#1E3A8A)**, representing the authority and seriousness of the judicial system. **Cobalt Blue (#2563EB)** is utilized for primary actions and interactive states to provide clear affordance.

A sophisticated scale of neutral grays is used to differentiate data surfaces—essential for complex judicial calculations. **Positive Green (#10B981)** is strictly reserved for favorable financial outcomes, credits, and successful status indicators. Error states use a muted Crimson to maintain the professional tone without causing unnecessary alarm.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy contexts and its neutral, professional character. 

A specific emphasis is placed on **tabular figures** (monospaced numbers) for all financial calculations to ensure that decimal points and digits align perfectly in vertical columns. 
- Use `headline-md` for card titles and section headers.
- Use `body-md` for standard table row content.
- Use `label-md` for table headers and metadata descriptors.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop (1440px max-width) to ensure that wide data tables do not become illegible on ultra-wide monitors. It employs a 12-column structure.

Spacing is disciplined, based on an **8px linear scale**. Data tables should utilize a "Compact" vertical rhythm (8px or 12px cell padding) to allow the user to view more rows without scrolling, while informative cards use "Relaxed" spacing (24px padding) to aid comprehension of summary data.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than dramatic shadows. This maintains a clean, flat aesthetic suitable for official administrative software.

- **Level 0 (Background):** A very light gray (#F8FAFC) to reduce eye strain.
- **Level 1 (Cards/Surfaces):** Pure white with a subtle 1px border (#E2E8F0).
- **Level 2 (Dropdowns/Modals):** Pure white with a soft, tight ambient shadow (Alpha 0.08) to distinguish temporary overlays from the workspace.
- **Active State:** Use a 2px Cobalt border to indicate focus or selection.

## Shapes
The shape language is **Soft (0.25rem / 4px)**. This subtle rounding removes the harshness of sharp corners while maintaining a formal, structured appearance. 

Buttons, input fields, and badges all share this 4px radius. Larger containers, such as informational cards or calculation blocks, may use `rounded-lg` (8px) to softly frame grouped content.

## Components
### Data Tables
The core component. Features sticky headers, striped rows (using a 2% gray tint), and right-aligned numerical columns. Row hover states should use a subtle blue tint (#EFF6FF) to assist visual tracking.

### Status Badges
Used for judicial progress. 
- **Finalized:** Green background (10% opacity) with dark green text.
- **Pending:** Amber background (10% opacity) with dark amber text.
- **Draft:** Gray background (10% opacity) with dark gray text.

### Action Buttons
- **Primary (Calculate/Save):** Solid Navy Blue with white text.
- **Secondary (Print/Export):** Outline Cobalt Blue with white background.
- **Tertiary (Back/Cancel):** Ghost style (no border) using Neutral Gray text.

### Informative Cards
Used for "Summary of Values." These should feature a prominent "Total" value using `headline-lg` in Navy Blue, with secondary metrics clearly labeled in `label-md`.

### Input Fields
Strict, rectangular fields with 1px borders. The focus state must be a clear 2px Cobalt outline. Use "stepping" controls for currency inputs to ensure precision.