# 🎨 Design Guide - Advanced S-Box 44 Analyzer

## Professional Academic Design System

This document outlines the comprehensive design system for the Advanced S-Box 44 Analyzer, featuring a sophisticated, professional look suitable for academic presentations.

---

## 🎨 Color Palette

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Light Gray** | `#A8A7A7` | Neutral elements, borders, subtle backgrounds |
| **Muted Rose/Pink** | `#CC527A` | Secondary accents, hover states |
| **Bright Magenta/Crimson** | `#E8175D` | Primary accents, CTAs, highlights |
| **Dark Charcoal Gray** | `#474747` | Body text, secondary headings |
| **Very Dark Gray/Near Black** | `#363636` | Primary text, headings, footer background |

### Color Applications

```css
/* Gradients */
Primary Gradient: linear-gradient(135deg, #E8175D 0%, #CC527A 100%)
Subtle Gradient: linear-gradient(135deg, #CC527A 0%, #A8A7A7 100%)
Dark Overlay: linear-gradient(135deg, rgba(54,54,54,0.95) 0%, rgba(71,71,71,0.90) 100%)
```

### Semantic Colors

- **Primary Action**: `#E8175D` (Bright Magenta)
- **Secondary Action**: `#CC527A` (Muted Rose)
- **Text Primary**: `#363636` (Very Dark Gray)
- **Text Secondary**: `#474747` (Dark Charcoal)
- **Text Tertiary**: `#A8A7A7` (Light Gray)
- **Background**: `#FFFFFF` (White)
- **Surface**: `rgba(255,255,255,0.95)` (Glass effect)

---

## ✍️ Typography

### Font Families

#### Headings (H1, H2, H3, H4, H5, H6)
- **Font**: Playfair Display
- **Weight**: 700 (Bold), 800 (Extra Bold), 900 (Black)
- **Style**: Serif, high-contrast, sophisticated
- **Usage**: All headings, titles, emphasis text

```css
font-family: 'Playfair Display', serif;
```

#### Body Text
- **Font**: Source Sans 3
- **Weight**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Style**: Sans-serif, clean, readable
- **Usage**: Paragraphs, descriptions, UI labels

```css
font-family: 'Source Sans 3', sans-serif;
```

#### Monospace (Code/Data)
- **Font**: Fira Code
- **Weight**: 400 (Regular), 500 (Medium), 600 (Semi-Bold)
- **Style**: Monospace with ligatures
- **Usage**: S-box values, hex codes, technical data

```css
font-family: 'Fira Code', 'Courier New', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **H1** | 3.5-4rem (56-64px) | 700-900 | 1.2 | -0.02em |
| **H2** | 2.5-3rem (40-48px) | 700-800 | 1.3 | -0.01em |
| **H3** | 2rem (32px) | 700 | 1.4 | Normal |
| **H4** | 1.5rem (24px) | 600-700 | 1.4 | Normal |
| **Body Large** | 1.125rem (18px) | 400 | 1.6 | Normal |
| **Body Regular** | 1rem (16px) | 400 | 1.6 | Normal |
| **Body Small** | 0.875rem (14px) | 400-500 | 1.5 | Normal |
| **Caption** | 0.75rem (12px) | 400-500 | 1.4 | 0.02em |

---

## 🖼️ Image Assets

### Logo
- **File**: `UNNES Logo.png`
- **Usage**: Header, footer, hero section
- **Sizes**: 48px (header), 128-160px (hero)
- **Format**: PNG with transparency

### Team Photos
- **Files**: `Person 1.jpg`, `Person 2.jpg`, `Person 3.jpg`, `Person 4.jpg`
- **Usage**: Research team section
- **Display**: Square aspect ratio with rounded corners
- **Effects**: Hover scale (1.1x), gradient overlay

### Background
- **File**: `Binary Code Background.jpg`
- **Usage**: Hero section background (with overlay)
- **Opacity**: 20% with dark gradient overlay
- **Effect**: Fixed background, subtle parallax

---

## 🎭 Component Design

### Hero Section
```
┌─────────────────────────────────────────────────┐
│ [Binary Background with Dark Overlay]          │
│                                                 │
│  [UNNES Logo]  Advanced S-Box 44 Analyzer     │
│                Cryptographic Research Tool      │
│                [Tags: K44 | GF(2⁸) | 0x11B]   │
└─────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Binary code image at 20% opacity
- Overlay: Dark gradient (#363636 to #474747 at 90-95% opacity)
- Text: White color for maximum contrast
- Logo: 128-160px, drop shadow for depth
- Decorative wave at bottom

### Research Team Section
```
┌──────────────────────────────────────────┐
│  Research Team                           │
│  [Accent Underline]                      │
│                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐
│  │ Photo  │ │ Photo  │ │ Photo  │ │    │
│  │  +     │ │  +     │ │  +     │ │... │
│  │Gradient│ │Gradient│ │Gradient│ │    │
│  └────────┘ └────────┘ └────────┘ └────┘
└──────────────────────────────────────────┘
```

**Specifications:**
- Grid: 1-4 columns (responsive)
- Cards: Rounded corners (16px), shadow on hover
- Images: Square aspect ratio, scale on hover
- Overlay: Bottom gradient with name/role
- Hover effect: Scale 1.05x, pink border

### Control Panel
```
┌───────────────────────────────────────────────┐
│ Control Panel                                 │
│ ─────────────────────────────────────────     │
│                                               │
│ Generate and analyze S-boxes...              │
│ [K44 Matrix] [GF(2⁸)] [Poly: 0x11B]         │
│                                               │
│                [⚡ Generate & Analyze Button] │
└───────────────────────────────────────────────┘
```

**Specifications:**
- Background: Glass effect with border
- Padding: 32-40px
- Tags: Rounded pills with colored backgrounds
- Button: Gradient background, large padding, bold text
- Shadow: Subtle on normal, enhanced on hover

### S-Box Grid
```
┌───────────────────────────────────────────────┐
│ K44 S-box - 16×16 Hexadecimal Grid          │
│                                               │
│    0  1  2  3  4  5  6  7  8  9  A  B  C...  │
│  0│63 34 A5 21 86 E0 E7 B2 C0 FD 64 90...   │
│  1│24 D7 36 28 05 CF 84 88 A1 6F 37 AF...   │
│  ...                                          │
└───────────────────────────────────────────────┘
```

**Specifications:**
- Headers: Bold, pink accent color
- Cells: White background, bordered
- Hover: Light pink background, scale 1.05x
- Selected: Pink background, white text, shadow
- Font: Monospace (Fira Code)
- Cell info: Glass card below grid

### Metrics Cards
```
┌──────────────────────────────┐
│ 🔢 Nonlinearity (NL)        │
│ ───────────────────────────  │
│                              │
│ Minimum:         112         │
│ Maximum:         112         │
│ Average:         112.00 ✓    │
└──────────────────────────────┘
```

**Specifications:**
- Layout: Grid (1-3 columns responsive)
- Border: Light gray with subtle shadow
- Icon: Large emoji at top
- Values: Monospace font, color-coded
- Status: Green (good), yellow (warning), gray (info)
- Hover: Enhanced shadow, slight lift

### Comparison Table
```
┌────────────────────────────────────────────────┐
│ 📊 Side-by-Side Comparison                    │
│ ─────────────────                              │
│                                                │
│ Metric    │ K44      │ AES      │ Winner      │
│ ──────────┼──────────┼──────────┼───────────  │
│ NL (Avg)  │ 112.00   │ 112.00   │ Equal       │
│ SAC (Avg) │ 0.50073  │ 0.50073  │ K44 ✓       │
└────────────────────────────────────────────────┘
```

**Specifications:**
- Headers: Bold, heading font
- Values: Monospace, colored by performance
- Winner: Bold with checkmark
- Hover: Light background on rows
- Border: Minimal, clean lines

---

## 🎯 UI Patterns

### Glass Morphism Effect
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(168, 167, 167, 0.2);
  box-shadow: 0 4px 6px rgba(54, 54, 54, 0.05);
}
```

### Gradient Border
```css
.gradient-border {
  border: 2px solid transparent;
  background: linear-gradient(#ffffff, #ffffff) padding-box,
              linear-gradient(135deg, #E8175D, #CC527A) border-box;
}
```

### Text Gradient
```css
.text-gradient {
  background: linear-gradient(135deg, #E8175D 0%, #CC527A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Accent Underline
- **Width**: 96px (w-24)
- **Height**: 4px (h-1)
- **Color**: Gradient (pink to rose)
- **Usage**: Under section headings

---

## 📐 Spacing System

### Padding Scale
| Name | Size | Usage |
|------|------|-------|
| `xs` | 0.5rem (8px) | Tight spacing |
| `sm` | 0.75rem (12px) | Compact elements |
| `base` | 1rem (16px) | Standard spacing |
| `md` | 1.5rem (24px) | Medium spacing |
| `lg` | 2rem (32px) | Large spacing |
| `xl` | 3rem (48px) | Extra large spacing |
| `2xl` | 4rem (64px) | Section spacing |

### Border Radius
| Name | Size | Usage |
|------|------|-------|
| `sm` | 0.5rem (8px) | Small elements |
| `base` | 0.75rem (12px) | Standard |
| `lg` | 1rem (16px) | Cards |
| `xl` | 1.5rem (24px) | Large cards |
| `2xl` | 2rem (32px) | Hero sections |

---

## 🎬 Animations

### Transitions
```css
/* Standard transition */
transition: all 0.3s ease;

/* Hover scale */
transform: scale(1.05);

/* Button hover */
transform: scale(1.05);
box-shadow: 0 20px 25px -5px rgba(232, 23, 93, 0.3);
```

### Loading Spinner
- **Color**: Pink accent (#E8175D)
- **Size**: 80px
- **Animation**: Spin (1s linear infinite)
- **Border**: 4px solid, top border colored

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

### Mobile Adaptations
- Single column layouts
- Stacked team cards
- Scrollable tables
- Collapsible sections
- Touch-friendly buttons (48px min)

---

## ♿ Accessibility

### Color Contrast
- **Text on White**: #363636 (AAA compliant)
- **Pink on White**: #E8175D (AA compliant)
- **White on Pink**: White on #E8175D (AAA compliant)

### Focus States
- **Color**: Pink accent (#E8175D)
- **Style**: 2px solid outline
- **Offset**: 2px

### Screen Readers
- All images have alt text
- Semantic HTML structure
- ARIA labels on interactive elements
- Skip to content link

---

## 🎨 Design Principles

### 1. Professional & Academic
- Clean, uncluttered layouts
- Sophisticated typography
- Muted color palette with strategic accents
- High-quality imagery

### 2. Hierarchy & Structure
- Clear visual hierarchy
- Consistent spacing
- Logical grouping
- Progressive disclosure

### 3. Interactivity
- Smooth transitions
- Hover feedback
- Loading states
- Error handling

### 4. Performance
- Optimized images
- Efficient animations
- Fast load times
- Smooth scrolling

---

## 📦 Component Library

### Buttons

**Primary Button**
```tsx
<button className="font-body px-10 py-5 rounded-xl font-bold text-white text-lg 
                   bg-gradient-primary hover:shadow-2xl hover:scale-105 
                   transition-all duration-300">
  Generate & Analyze
</button>
```

**Secondary Button**
```tsx
<button className="font-body px-6 py-3 rounded-lg font-semibold text-accent-pink 
                   border-2 border-accent-pink hover:bg-accent-pink hover:text-white 
                   transition-all duration-300">
  Learn More
</button>
```

### Cards

**Glass Card**
```tsx
<div className="glass-effect rounded-2xl p-6 border border-primary-light/20 
                hover:shadow-2xl transition-all duration-300">
  Content
</div>
```

**Metric Card**
```tsx
<div className="glass-effect rounded-2xl p-6 border border-primary-light/20">
  <div className="flex items-center mb-5 pb-4 border-b border-primary-light/20">
    <span className="text-3xl mr-3">🔢</span>
    <h4 className="font-heading text-xl font-bold">Title</h4>
  </div>
  <div className="space-y-4">
    {/* Metrics */}
  </div>
</div>
```

### Tags/Badges

```tsx
<span className="px-4 py-2 bg-accent-pink/10 text-accent-pink 
               text-sm font-semibold rounded-full border border-accent-pink/30">
  K44 Matrix
</span>
```

---

## 🎯 Best Practices

### DO
✅ Use heading font for all titles
✅ Use body font for all text content
✅ Use monospace for technical data
✅ Apply glass effect to cards
✅ Use gradient for primary actions
✅ Maintain consistent spacing
✅ Add hover effects to interactive elements
✅ Show loading states
✅ Handle errors gracefully

### DON'T
❌ Mix serif and sans-serif in body text
❌ Use pure black (#000000)
❌ Overuse gradients
❌ Ignore hover states
❌ Skip loading indicators
❌ Use inconsistent spacing
❌ Forget mobile responsiveness
❌ Ignore accessibility

---

## 📊 Design Metrics

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Layout Shift**: < 0.1
- **Load Time**: < 2s

### Accessibility Targets
- **WCAG Level**: AA minimum
- **Color Contrast**: 4.5:1 for text
- **Touch Targets**: 48x48px minimum
- **Keyboard Navigation**: Full support

---

## 🎨 Color Usage Examples

### Hero Section
- Background: #363636 with Binary Code at 20% opacity
- Text: #FFFFFF
- Accent: #E8175D

### Content Sections
- Background: #FFFFFF
- Primary Text: #363636
- Secondary Text: #474747
- Links/Accents: #E8175D
- Borders: #A8A7A7 at 20% opacity

### Cards
- Background: White with glass effect
- Border: #A8A7A7 at 20% opacity
- Hover: Enhanced shadow

### Footer
- Background: #363636
- Text: #FFFFFF
- Accents: #A8A7A7

---

**Design System Version**: 1.0
**Last Updated**: November 2025
**Maintained By**: Advanced S-Box 44 Analyzer Team

