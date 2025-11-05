# 🧪 Manual Testing Checklist

Run `npm run dev` and test the following:

## 🎯 Home Page (Test Page)

### Desktop View
- [ ] Page loads without errors
- [ ] Top bar is visible with all elements
- [ ] Sidebar toggle button (PanelLeftOpen icon) is visible on the left
- [ ] Click toggle - sidebar should expand/collapse smoothly
- [ ] Collapsed sidebar shows only icons (16px width)
- [ ] Expanded sidebar shows full navigation (80px width)
- [ ] "Inicio" button in top bar navigates to home
- [ ] Search bar is centered
- [ ] All stats cards are clickable
- [ ] Recent gastos list appears if you have data

### Sidebar Navigation (Expanded)
- [ ] "Inicio" shows house icon with "Dashboard principal" description
- [ ] "Grupos" shows users icon with "Gestionar grupos" description
- [ ] "Gastos" shows receipt icon with "Gestionar gastos" description
- [ ] "Medios de Pago" shows card icon with description
- [ ] Active page is highlighted in blue
- [ ] Hover states work (gray background)
- [ ] Icons are properly sized (20px)

### Sidebar Collapsed (Icon-Only)
- [ ] Click toggle to collapse
- [ ] Only icons visible (no text)
- [ ] Icons are centered
- [ ] Tooltips appear on hover with full names
- [ ] Active state still visible (blue background)
- [ ] Width is 16px (64px)

### Top Bar Elements
- [ ] Toggle button animates (PanelLeftOpen ↔ PanelLeftClose)
- [ ] Search bar accepts input
- [ ] Search bar shows match count when typing
- [ ] Bell icon (notifications) is visible
- [ ] Apps menu (9-dot grid) is clickable
- [ ] Apps dropdown shows: Inicio, Grupos, Gastos, Medios Pago
- [ ] Profile avatar shows first 3 letters of username
- [ ] Profile dropdown shows username and email
- [ ] "Cerrar Sesión" button works

### Search Functionality
- [ ] Type in search bar
- [ ] Text on page gets highlighted in yellow
- [ ] Match counter shows (e.g., "1/5")
- [ ] Up arrow navigates to previous match
- [ ] Down arrow navigates to next match
- [ ] Enter key navigates to next match
- [ ] Shift+Enter navigates to previous match
- [ ] Escape key clears search
- [ ] Current match has blue ring

### Mobile View (< 768px)
- [ ] Resize browser to mobile width
- [ ] Top bar adapts (search bar hidden)
- [ ] Hamburger menu appears on right
- [ ] Click hamburger - mobile menu opens below
- [ ] Mobile menu shows search bar
- [ ] Click toggle button - sidebar overlays content
- [ ] Backdrop appears behind sidebar (dark overlay)
- [ ] Click backdrop - sidebar closes
- [ ] Navigate to page - sidebar closes automatically

## 🗂️ Other Pages

### GastosList Page
- [ ] Navigate to /gastos
- [ ] Sidebar shows "Gastos" as active (blue highlight)
- [ ] "Gastos" section expands showing:
  - "Ver Gastos" (List icon)
  - "Crear Gasto" (Plus icon)
- [ ] Current page (Ver Gastos) is highlighted
- [ ] "Agrupar Por" section appears in sidebar:
  - Por Categoría
  - Por Fecha
  - Por Monto
  - Por Vendedor
  - Por Estado
  - Por Moneda
- [ ] Click a group by option - it turns green
- [ ] "Limpiar agrupación" button appears
- [ ] Page header "Tus Gastos" is centered
- [ ] Create button is on the right
- [ ] All gastos functionality works

### Form Pages (No Sidebar)
- [ ] Navigate to /gastos/add
- [ ] Sidebar is NOT shown
- [ ] Toggle button is NOT shown
- [ ] Content takes full width
- [ ] Top bar still present
- [ ] All form functionality works

### MediosPago Pages
- [ ] Navigate to /medios-pago
- [ ] Sidebar shows "Medios de Pago" active
- [ ] "Agrupar Por" section shows:
  - Por Tipo
  - Por Emisor
- [ ] All functionality works

### Grupos Pages
- [ ] Navigate to /grupos
- [ ] Sidebar shows "Grupos" active
- [ ] Sub-navigation expands
- [ ] All functionality works

## 🎨 Visual Polish

### Alignment
- [ ] Top bar height is exactly 14px (56px)
- [ ] Sidebar starts exactly below top bar (no gap)
- [ ] Content area starts exactly below top bar (no gap)
- [ ] Collapsed sidebar width is 16px (64px)
- [ ] Expanded sidebar width is 80px (320px)
- [ ] No horizontal scroll bars

### Colors (Light Mode)
- [ ] Top bar: white background, gray border
- [ ] Sidebar: white background, gray border
- [ ] Active link: light blue background, dark blue text
- [ ] Hover: light gray background
- [ ] Group by selected: light green background, dark green text
- [ ] Profile avatar: green background
- [ ] Buttons maintain your color system

### Dark Mode (If System Prefers Dark)
- [ ] Top bar: dark gray background
- [ ] Sidebar: dark gray background
- [ ] Active link: dark blue background, light blue text
- [ ] Text is light colored
- [ ] Borders are dark gray
- [ ] All elements visible and readable

### Animations
- [ ] Sidebar expand/collapse is smooth (300ms)
- [ ] Toggle icon rotates/changes smoothly
- [ ] Hover states transition smoothly
- [ ] Dropdown menus fade in/out
- [ ] Mobile overlay slides in/out
- [ ] No janky animations
- [ ] No layout shifts

### Responsive Breakpoints
- [ ] Test at 1920px (large desktop) ✓
- [ ] Test at 1366px (laptop) ✓
- [ ] Test at 1024px (tablet landscape) ✓
- [ ] Test at 768px (tablet portrait) ✓
- [ ] Test at 375px (mobile) ✓
- [ ] Test at 320px (small mobile) ✓

## 🐛 Edge Cases

### Navigation
- [ ] Rapid clicking doesn't break sidebar
- [ ] Multiple dropdowns close when clicking outside
- [ ] Browser back button works
- [ ] Direct URL navigation works
- [ ] Page refresh maintains state (if applicable)

### Search
- [ ] Search with no results shows 0 matches
- [ ] Search with special characters works
- [ ] Long search terms don't break layout
- [ ] Clearing search removes all highlights
- [ ] Search while navigating doesn't break

### Content Overflow
- [ ] Long usernames don't break layout
- [ ] Many navigation items scroll properly
- [ ] Long page content scrolls correctly
- [ ] Sidebar content scrolls if needed
- [ ] Fixed elements stay in place when scrolling

## ✅ Success Criteria

All checks above should pass. If any fail, note the issue and we can fix it.

### Critical (Must Work)
- [ ] No console errors
- [ ] All pages load
- [ ] Navigation works
- [ ] Sidebar toggles
- [ ] Mobile responsive

### Important (Should Work)
- [ ] Animations smooth
- [ ] Colors correct
- [ ] Alignment perfect
- [ ] Search functional
- [ ] Groups work

### Nice to Have
- [ ] Dark mode
- [ ] Tooltips
- [ ] Polish animations
- [ ] Edge cases handled

---

## 🎉 When Testing is Complete

If all critical and important items pass:
1. ✅ Mark as production-ready
2. 🚀 Deploy with confidence
3. 🗑️ Delete old NavBar.jsx and Sidebar.jsx
4. 📝 Update team documentation

If issues found:
1. 📋 Document specific failures
2. 🔧 We'll fix them together
3. 🧪 Re-test
4. ✅ Mark as ready when passing
