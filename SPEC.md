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
│  │ - Type (Income/Expense)│ │                         │   │
│  │ - Submit button        │ │                         │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  TABLE SECTION: Dynamic records list                        │
│  Columns: Date | Description | Category | Amount | Type | X │
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
| Background | `#0f0f0f` | Page background |
| Surface | `#1a1a1a` | Cards, form inputs |
| Surface Elevated | `#252525` | Table rows hover |
| Border | `#333333` | Subtle borders |
| Text Primary | `#f5f5f5` | Main text |
| Text Secondary | `#a0a0a0` | Labels, hints |
| Accent Primary | `#22c55e` | Income, positive |
| Accent Danger | `#ef4444` | Expense, negative |
| Accent Blue | `#3b82f6` | Buttons, links |
| Accent Purple | `#8b5cf6` | Chart category |
| Accent Yellow | `#eab308` | Chart category |
| Accent Cyan | `#06b6d4` | Chart category |
| Accent Orange | `#f97316` | Chart category |
| Accent Pink | `#ec4899` | Chart category |

#### Typography
- **Font Family**: `Inter, system-ui, sans-serif`
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
- Card shadows: `0 4px 6px -1px rgba(0, 0, 0, 0.3)`
- Border radius: 12px (cards), 8px (inputs/buttons)
- Transitions: 200ms ease-in-out

### Components

#### Header
- Dark background `#1a1a1a`
- Centered title "Calculadora de Presupuesto"
- Subtle bottom border

#### Summary Cards
- 3 cards in a row (flexbox)
- Icon + Label + Value
- Color-coded: Balance (white), Ingresos (green), Gastos (red)
- Hover: slight scale (1.02)

#### Form Section
- Dark surface background
- 4 form fields:
  - Description: text input
  - Amount: number input (step 0.01)
  - Category: select dropdown
  - Type: radio buttons (Ingreso/Gasto)
- Submit button: blue accent, full width on mobile

#### Category Options
```
Vivienda, Comida, Transporte, Servicios,
Entretenimiento, Salud, Educación, Otros
```

#### Table
- Striped rows (alternating surface colors)
- Columns: Fecha, Descripción, Categoría, Monto, Tipo, Acción
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

2. **Delete Transaction**
   - Confirmation not required (instant delete)
   - Remove from array and LocalStorage
   - Re-render table and chart

3. **Calculate Totals**
   - Sum all incomes (type: "ingreso")
   - Sum all expenses (type: "gasto")
   - Calculate balance (income - expense)

4. **Persist Data**
   - Key: `presupuesto_datos`
   - JSON stringify/parse
   - Load on page init
   - Save on every change

5. **Render Chart**
   - Group expenses by category
   - Sum amounts per category
   - Update chart data object
   - Call chart.update()

### User Interactions
- Form submit → Add transaction → Clear form → Update all
- Delete click → Remove transaction → Update all
- Page load → Load from LocalStorage → Render all

### Edge Cases
- Empty LocalStorage: Show empty state
- Zero transactions: Hide chart or show "Sin datos"
- Very long description: Truncate with ellipsis (max 30 chars display)
- Large numbers: Format with commas (1,000,000.00)

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark mode applied consistently
- [ ] All cards visible in one row on desktop
- [ ] Form inputs have proper focus states
- [ ] Table is scrollable on mobile
- [ ] Chart renders without errors

### Functional Checkpoints
- [ ] Can add income transaction
- [ ] Can add expense transaction
- [ ] Can delete any transaction
- [ ] Totals update correctly
- [ ] Chart shows expense categories
- [ ] Data persists after page reload

### Technical Checkpoints
- [ ] Valid HTML5 semantic structure
- [ ] Tailwind CSS via CDN
- [ ] Chart.js via CDN
- [ ] No console errors
- [ ] Responsive on all breakpoints