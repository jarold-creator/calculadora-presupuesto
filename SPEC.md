# Calculadora de Presupuesto Personal - SPEC.md

## 1. Project Overview

- **Project name**: Calculadora de Presupuesto Personal
- **Type**: Single-page Web Application
- **Core functionality**: Personal finance tracker with income/expense logging, visual charts, and data persistence
- **Target users**: Individuals managing personal finances

## 2. UI/UX Specification

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo + Title                                       │
├─────────────────────────────────────────────────────────────┤
│  SUMMARY CARDS (3 columns):                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Total       │ │ Ingresos    │ │ Gastos      │            │
│  │ Balance     │ │             │ │             │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  MAIN CONTENT (2 columns on desktop, stacked on mobile):    │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │     FORM SECTION        │ │    CHART SECTION        │   │
│  │ - Description input    │ │    (Doughnut Chart)     │   │
│  │ - Amount input         │ │                         │   │
│  │ - Category select      │ │                         │   │
│  │ - Type (Income/Expense)│ │                        │   │
│  │ - Submit button        │ │                         │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  TABLE SECTION: Dynamic records list                        │
│  Columns: Check | Date | Description | Category | Amount | Type │ Actions │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 768px (single column, stacked layout)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (full layout)

### Visual Design

#### Color Palette (Dark Mode)
| Name | Hex Code | Usage |
|------|----------|-------|
| Background | `#09090b` | Page background |
| Surface | `#18181b` | Cards, form inputs |
| Surface Elevated | `#27272a` | Table rows hover |
| Border | `#3f3f46` | Subtle borders |
| Text Primary | `#fafafa` | Main text |
| Text Secondary | `#a1a1aa` | Labels, hints |
| Income | `#22c55e` | Income, positive |
| Expense | `#ef4444` | Expense, negative |
| Accent | `#f59e0b` | Buttons, focus, interactive (amber) |
| Accent Cyan | `#06b6d4` | Chart category |
| Accent Purple | `#8b5cf6` | Chart category |
| Accent Yellow | `#eab308` | Chart category |
| Accent Orange | `#f97316` | Chart category |
| Accent Pink | `#ec4899` | Chart category |

#### Typography
- **Font Family**: `Sora, system-ui, sans-serif`
- **Headings**:
  - H1: 2rem, font-weight 700
  - H2: 1.5rem, font-weight 600
  - H3: 1.25rem, font-weight 600
- **Body**: 1rem, font-weight 400
- **Small**: 0.875rem

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

#### Visual Effects
- Card shadows: `0 20px 40px -12px rgba(0, 0, 0, 0.5)`
- Border radius: 16px (cards), 8px (inputs/buttons)
- Transitions: 400ms cubic-bezier(0.16, 1, 0.3, 1)
- Hover effects with glow
- Gradients on icons

### Components

#### Header
- Background `#18181b`
- Title "Presupuesto" (shortened for mobile)
- Theme toggle button (sun/moon icons)
- Profile selector dropdown
- Role: banner

#### Summary Cards
- 3 cards in a row (flexbox)
- Icon + Label + Value
- Color-coded: Balance (gradient amber), Ingresos (green), Gastos (red)
- Hover: translateY(-6px) with glow effect

#### Form Section
- Dark surface background
- 4 form fields:
  - Description: text input
  - Amount: number input with thousands separator
  - Category: select dropdown
  - Type: radio buttons styled as toggle buttons
- Submit button: gradient amber, full width

#### Category Options
```
Vivienda, Comida, Transporte, Servicios,
Entretenimiento, Salud, Educación, Otros
```

#### Table
- Striped rows (alternating surface colors)
- Checkbox column for marking paid
- Columns: Check | Fecha | Descripción | Categoría | Monto | Tipo | Acción
- Delete button (red) per row
- Empty state message when no records

#### Chart Section
- Doughnut chart (Chart.js)
- Only shows expenses by category
- Legend below chart
- Responsive canvas sizing

## 3. Functionality Specification

### Core Features

1. **Add Transaction**
   - Validate all fields required
   - Amount must be positive number
   - Generate unique ID (timestamp)
   - Add to beginning of list
   - Save to LocalStorage
   - Show success toast

2. **Delete Transaction**
   - Confirmation modal required
   - Remove from array and LocalStorage
   - Re-render table and chart
   - Show success toast

3. **Edit Transaction**
   - Modal with pre-filled form
   - Update existing transaction
   - Save to LocalStorage

4. **Calculate Totals**
   - Sum all incomes (type: "ingreso")
   - Sum all expenses (type: "gasto")
   - Calculate balance (income - expense)

5. **Toggle Paid Status**
   - Checkbox to mark transaction as paid
   - Visual feedback (strikethrough)
   - Persist to LocalStorage

6. **Reiniciar Mes**
   - Mark all transactions as unpaid
   - Reset checkbox states

7. **Persist Data**
   - Key: `presupuesto_datos_{perfil}`
   - JSON stringify/parse
   - Load on page init
   - Save on every change
   - Separate data per profile

8. **Render Chart**
   - Group expenses by category
   - Sum amounts per category
   - Update chart data object
   - Call chart.update()

### User Interactions
- Form submit → Add transaction → Clear form → Update all
- Delete click → Confirmation modal → Remove transaction → Update all
- Checkbox click → Toggle paid status → Save → Re-render
- Theme toggle → Switch light/dark mode → Persist preference
- Profile selector → Switch profile → Load data → Render

### Multi-Profile Support
- Create new profile
- Switch between profiles
- Delete profile (with confirmation)
- Each profile has isolated data

### Edge Cases
- Empty LocalStorage: Show empty state
- Zero transactions: Hide chart or show "Sin datos"
- Very long description: Truncate with ellipsis (max 30 chars display)
- Large numbers: Format with commas (1,000,000)

## 4. Accessibility (WCAG 2.2)

### Perceivable
- Text alternatives for icons (aria-label)
- Color contrast ratio ≥ 4.5:1 (AA)
- Focus indicators visible

### Operable
- Keyboard navigation support
- Focus visible (:focus-visible)
- Target size minimum 44px for touch
- Reduced motion support (@media prefers-reduced-motion)

### Understandable
- Page language specified (lang="es")
- Form labels properly associated
- Error messages with ARIA

### Robust
- Semantic HTML
- Landmark regions (banner, navigation, main)
- ARIA labels on interactive elements

## 5. Acceptance Criteria

### Visual Checkpoints
- [x] Dark mode applied consistently
- [x] All cards visible in one row on desktop
- [x] Form inputs have proper focus states
- [x] Table is scrollable on mobile
- [x] Chart renders without errors
- [x] Hover effects with glow
- [x] Gradients on icons

### Functional Checkpoints
- [x] Can add income transaction
- [x] Can add expense transaction
- [x] Can delete any transaction
- [x] Totals update correctly
- [x] Chart shows expense categories
- [x] Data persists after page reload
- [x] Can edit transactions
- [x] Multi-profile support works
- [x] Theme toggle works

### Technical Checkpoints
- [x] Valid HTML5 semantic structure
- [x] Tailwind CSS via CDN
- [x] Chart.js via CDN
- [x] No console errors
- [x] Responsive on all breakpoints

### Accessibility Checkpoints
- [x] Focus visible for keyboard navigation
- [x] Reduced motion support
- [x] Landmarks implemented
- [x] ARIA labels on buttons
- [x] Color contrast verified (AA)