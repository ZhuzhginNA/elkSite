---
name: ELK Corporate Website
description: Clear and credible digital storefront for an industrial electronics manufacturer.
colors:
  ink-deep: "#111111"
  ink-panel: "#121212"
  white-surface: "#FFFFFF"
  gray-surface: "#F2F2F2"
  black-copy: "#1A1A1A"
  gray-copy: "#666666"
  blue-accent: "#1F3559"
  blue-accent-soft: "#314F7D"
  blue-accent-deep: "#172945"
  line-neutral: "#1A1A1A1F"
  signal-danger: "#8C2F2F"
typography:
  display:
    fontFamily: "\"Museo Sans\", \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.8rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "\"Museo Sans\", \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "\"Museo Sans\", \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  nav-link:
    textColor: "{colors.white-surface}"
    rounded: "{rounded.md}"
    padding: "11px 16px"
  button-primary:
    backgroundColor: "{colors.blue-accent}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  surface-panel:
    backgroundColor: "{colors.white-surface}"
    rounded: "{rounded.md}"
    padding: "34px 40px 42px"
  surface-footer:
    backgroundColor: "{colors.ink-panel}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.md}"
    padding: "14px 22px"
  chip-default:
    backgroundColor: "{colors.gray-surface}"
    textColor: "{colors.blue-accent}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
---

# Design System: ELK Corporate Website

## Overview

**Creative North Star: "The Precision Showroom"**

This site should feel like a clean industrial lobby: quiet, engineered, and ready for a serious conversation. The interface is not trying to entertain or perform startup energy. It should reassure visitors that the company is current, competent, and structured, with enough visual atmosphere to feel modern but never so much that the content turns theatrical.

The system balances black, white, and gray neutrals with a restrained dark-blue accent. Dark backgrounds establish context and depth. White content surfaces create clarity and reading comfort. The blue accent carries the brand signal and should feel measured, not promotional. Typography stays plainspoken and legible, with hierarchy created through scale, spacing, and contrast rather than decorative tricks.

This system explicitly rejects a WordPress-style one-page template, a course-selling landing page full of aggressive calls to action, and any generic SaaS marketing aesthetic. It should read as a manufacturing company with engineering discipline, not as a growth funnel.

**Key Characteristics:**
- Calm, structured, and trustworthy
- Modern without trend-chasing
- Clear navigation over decorative effects
- Visual atmosphere built from photography, contrast, and spacing
- Industrial character expressed through restraint

## Colors

The palette is a restrained black, white, and gray system anchored by one dark-blue accent that becomes more visible in navigation, calls to action, tags, and structural emphasis.

### Primary
- **Dark Blue Accent** (`#1F3559`): The core brand color for headings, buttons, active navigation, tags, and controlled moments of emphasis.
- **Soft Blue Accent** (`#314F7D`): A supporting accent used in restrained gradients and secondary emphasis.
- **Deep Blue Accent** (`#172945`): A denser companion for deeper hover states and stronger structural contrast.

### Neutral
- **Deep Black** (`#111111`): The global page background and tonal base for full-screen photographic overlays.
- **Panel Black** (`#121212`): The footer and dark structural surface tone.
- **White Surface** (`#FFFFFF`): The main reading surface for content panels.
- **Gray Surface** (`#F2F2F2`): Secondary panels and cards that sit inside the main content surface.
- **Black Copy** (`#1A1A1A`): Primary text color for headlines and critical interface text.
- **Gray Copy** (`#666666`): Secondary copy, metadata, and supporting content.
- **Neutral Line** (`#1A1A1A1F`): Border color for cards, list rows, and field outlines.
- **Signal Danger** (`#8C2F2F`): Error and failure state only.

### Named Rules
**The Quiet Accent Rule.** Blue is a signal, not wallpaper. Primary accent color should lead structure, wayfinding, and interaction, not flood the whole page.

**The Tinted Neutral Rule.** Avoid pure black, pure white, and dead gray. Every neutral should carry a subtle blue-industrial cast.

## Typography

**Display Font:** Museo Sans, Segoe UI, Tahoma, Geneva, Verdana, sans-serif  
**Body Font:** Museo Sans, Segoe UI, Tahoma, Geneva, Verdana, sans-serif  
**Label/Mono Font:** Museo Sans, Segoe UI, Tahoma, Geneva, Verdana, sans-serif

**Character:** The type should feel utilitarian, clean, and calm. It is closer to technical documentation and modern corporate signage than to editorial luxury or startup marketing.

### Hierarchy
- **Display** (300, `clamp(2rem, 4vw, 2.8rem)`, `1.1`): Page titles and key section headings. Light weight is acceptable only when contrast and spacing are strong.
- **Headline** (500, `1.3rem`, `1.25`): Card titles, document titles, and secondary section headings.
- **Title** (500, `1rem`, `1.4`): Local block headings, footer headings, and compact content labels.
- **Body** (400, `1rem`, `1.6`): Main descriptive text and page copy. Target readable line lengths around 65 to 75 characters where possible.
- **Label** (500, `0.82rem`, `0.04em`, uppercase when used in navigation): Navigation items, tags, and compact UI labels.

### Named Rules
**The Signage Rule.** Small uppercase text must stay readable first. Tracking can add structure, but never at the expense of legibility.

**The Plainspoken Rule.** Hierarchy comes from scale, spacing, and color contrast, not from decorative type treatments.

## Elevation

The system uses a hybrid of tonal layering and one strong ambient shadow. Most depth comes from contrast between dark atmospheric backgrounds and light content surfaces. Shadows should be broad and soft, giving panels presence without turning them into floating cards.

### Shadow Vocabulary
- **Ambient Lift** (`0 30px 60px rgba(0, 0, 0, 0.18)`): Main content panels and major footer surface only.

### Named Rules
**The Grounded Surface Rule.** Panels may feel lifted, but they should still feel anchored inside the photographic scene rather than hovering independently.

## Components

### Buttons
- **Character:** Quietly authoritative.
- **Shape:** Soft square corners (`4px` to `8px`), never pill-shaped.
- **Primary:** Steel Primary background with light text. Padding should feel compact and efficient rather than oversized and promotional.
- **Hover / Focus:** Prefer tonal darkening, border clarity, and a visible focus ring. Avoid flashy glow effects.
- **Secondary / Ghost:** May use tinted light backgrounds or outlined treatments, but should still read as part of the same steel-blue family.

### Chips
- **Style:** Small, compact labels with a pale steel tint background and Steel Primary text.
- **State:** Filters and metadata only. They should never feel like playful badges.

### Cards / Containers
- **Character:** Structured surfaces, not generic marketing tiles.
- **Corner Style:** Minimal rounding (`4px` to `8px`).
- **Background:** Main panels use Mist Panel. Nested elements may use Mist Panel Soft or tinted light steel backgrounds.
- **Shadow Strategy:** Use Ambient Lift only for major surface transitions, not for every internal card.
- **Border:** Fine Steel Line border where separation is needed.
- **Internal Padding:** Use the 16px to 36px spacing scale with deliberate rhythm, not identical padding everywhere.

### Inputs / Fields
- **Style:** Light background, steel-tinted border, clear text color.
- **Focus:** Strong visible border or ring, never default browser blue without integration into the palette.
- **Error / Disabled:** Error states use Signal Danger. Disabled states should reduce contrast without looking broken.

### Navigation
- **Style:** Compact uppercase navigation in a restrained translucent bar over the photographic background.
- **Default State:** Light text with quiet contrast against the dark glass-like band.
- **Hover / Active:** Subtle background tint and stronger text contrast.
- **Mobile Treatment:** Navigation can wrap, but spacing and touch targets must still feel intentional and readable.

### Content Panels
- **Style:** Large central reading planes over atmospheric photography.
- **Behavior:** The panel does the work of clarity. The page background provides mood, not information.

## Do's and Don'ts

### Do:
- **Do** keep the main reading experience on soft, tinted light surfaces over darker photographic backgrounds.
- **Do** use Steel Primary and Steel Secondary as controlled accents for headings, buttons, tags, and structural emphasis.
- **Do** preserve a calm, professional tone in spacing, typography, and interaction states.
- **Do** make navigation and content scanning clearer before adding extra effects or decoration.
- **Do** maintain visible keyboard focus, readable link states, and touch targets that work comfortably on mobile.

### Don't:
- **Don't** make the site feel like a WordPress one-page template assembled from generic corporate blocks.
- **Don't** make the site feel like a course-selling landing page with loud calls to action or promotional urgency.
- **Don't** let the interface drift into generic SaaS marketing instead of an industrial company presence.
- **Don't** use gradient text, thick side-accent borders, or endless identical icon cards.
- **Don't** rely on glassmorphism as the default visual idea. If blur exists, it must stay subtle and structural.
- **Don't** use oversized pill buttons, empty marketing metrics, or faux-startup hero patterns.
