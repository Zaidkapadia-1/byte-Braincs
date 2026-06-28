---
name: Mono-Tech System
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f1eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#474741'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0e9'
  outline: '#787770'
  outline-variant: '#c8c7be'
  surface-tint: '#5f5e5a'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1c19'
  on-primary-container: '#85847f'
  inverse-primary: '#c9c6c1'
  secondary: '#a43d1c'
  on-secondary: '#ffffff'
  secondary-container: '#fd7f58'
  on-secondary-container: '#6e1b00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#301400'
  on-tertiary-container: '#b0774f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2dd'
  primary-fixed-dim: '#c9c6c1'
  on-primary-fixed: '#1c1c19'
  on-primary-fixed-variant: '#474743'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb59f'
  on-secondary-fixed: '#3a0a00'
  on-secondary-fixed-variant: '#832605'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#fbb88b'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#693c19'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
  ink-secondary: '#6B6B62'
  surface-dark: '#2B2620'
  border-muted: '#D6D0C0'
  label-muted: '#A39A85'
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 38px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.5px
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.5px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 1px
  stat-value:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  body:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.5px
  label-small:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
  micro-cap:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 1.5px
  metadata:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: 1px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 36px
  section-padding: 48px
  gutter: 20px
  card-px: 24px
  card-py: 22px
  element-gap: 14px
  micro-gap: 10px
---

## Brand & Style

The design system is a sophisticated blend of **Retro-Technical** and **Neo-Terminal** aesthetics. It evokes the feeling of high-end editorial layouts merged with the functional, raw precision of a command-line interface. The target audience includes developers, technical engineers, and digital architects who value clarity, efficiency, and a "built-out-of-the-box" engineering spirit.

The design style is **Brutalism-Lite**: it utilizes raw structural elements—like visible dividers, monospaced typography, and underscores—but softens them with a refined "paper" background and precise 0.5px strokes. The emotional response is one of calculated reliability, intellectual rigor, and tactile nostalgia for physical media like punch cards and technical manuals.

## Colors

The palette is anchored by the "Paper and Ink" relationship. The neutral background (#F6F3EC) provides a warm, organic canvas that reduces the harshness of a pure white digital display. 

- **Primary (Deep Charcoal):** Used for all structural borders, primary headings, and high-impact UI actions. It represents the "Ink."
- **Secondary (Rust Orange):** A functional accent color used strictly for critical calls to action, active status indicators, and highlighting code-like functions.
- **Tertiary (Peach):** A supportive accent for secondary data visualization or specific currency/value highlights.
- **Surface Dark:** A high-contrast inverted surface used for "tear-off" panels or sidebars to create immediate visual separation.

## Typography

This system uses a strictly monospaced typographic scale to maintain the "Terminal" aesthetic. The font choice emphasizes legibility and technical precision.

Hierarchy is established through weight and letter-spacing rather than drastic size shifts. Headings utilize tighter tracking for a punchy, editorial feel, while labels and metadata utilize expanded tracking and uppercase transformations to mimic printed technical specifications. All functional text, such as buttons, should utilize `snake_case` or `bracketed_text` to lean into the developer-centric narrative.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy within a main container, utilizing a 12-column system for desktop and a single column for mobile. 

- **Key Structural Breakpoints:** Mobile (under 768px), Tablet (768px - 1024px), and Desktop (1024px+).
- **Margins & Gutters:** A generous 36px outer margin ensures content feels centered and intentional. 
- **The "Ticket" Panel:** On desktop, components often feature a fixed-width side panel (210px) separated by a dashed perforation line. On mobile, this panel reflows to the bottom of the card, with the dashed line becoming horizontal.
- **Rhythm:** Vertical rhythm is driven by the 1.5x line height of the body text, with element gaps following a consistent 14px/20px/48px step-up.

## Elevation & Depth

The design system is **completely flat**. Depth is communicated through structural layering and tonal contrast rather than shadows or blurs.

- **Tonal Layering:** Surfaces are stacked using color. A "Primary Ink" (#1B1B18) container might hold a "Neutral" (#F6F3EC) card.
- **Boundary Precision:** Use 0.5px solid lines for standard dividers. Use 1.5px dashed lines specifically for "functional" separations—areas where a user might "tear off" or interact with a specific data sub-section.
- **Z-Index Philosophy:** Interactive elements do not lift on hover. Instead, they should invert their colors (e.g., a neutral background becomes primary ink) to signal state changes, maintaining the flat, physical-print aesthetic.

## Shapes

The shape language is a mix of geometric precision and industrial character. 

- **Primary Containers:** Use a 14px radius to provide a modern, premium feel.
- **Component Notches:** Cards and tickets should utilize "punch-hole" cutouts—18px circles positioned at the terminal ends of dashed lines—to simulate physical perforation.
- **Interactive Elements:** Buttons and input fields use smaller, tighter radii (6px or 4px) to appear more rigid and tool-like.
- **Dashed Borders:** Always used on one axis (horizontal or vertical) to divide content, never as a full container border unless indicating an "empty state" drop-zone.

## Components

- **Terminal Buttons:** Rectangular with a subtle 6px radius. Primary buttons use the Rust color (#A8401F) with Neutral text. Text should follow the format `action_name()`.
- **Notched Cards:** Containers featuring 14px rounded corners and a vertical dashed divider. At the top and bottom of the divider, a circular "punch-out" (using the background color) creates a physical ticket effect.
- **Dashed Dividers:** Used to separate sections within a card. Stroke weight is 1.5px with a 4px dash/gap ratio.
- **Status Chips:** Small, uppercase labels with a 1.5px letter spacing. They use a solid Primary Ink background with Neutral text for high visibility.
- **Input Fields:** 0.5px solid border in Primary Ink. Use monospaced placeholder text like `> Enter_Value`.
- **Data Tables:** No vertical borders; only horizontal 0.5px dividers in `border-muted` (#D6D0C0). Header row is always uppercase metadata style.