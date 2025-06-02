# 🎨 Juggle Log Web - Unified Style Guide

## 📋 **Overview**

This document defines the unified design system for the Juggle Log Web application, ensuring consistent styling, readability, and user experience across all components.

## 🎯 **Design Principles**

### **1. Consistency**
- Use CSS variables for all colors, spacing, and typography
- Follow established patterns for component structure
- Maintain visual hierarchy throughout the application

### **2. Accessibility**
- Ensure sufficient color contrast (WCAG AA compliance)
- Provide focus states for all interactive elements
- Use semantic HTML and proper ARIA labels

### **3. Performance**
- Minimize CSS bundle size through variable reuse
- Use efficient selectors and avoid deep nesting
- Leverage CSS custom properties for dynamic theming

## 🎨 **Color System**

### **Primary Brand Colors**
```css
--primary-color: #4ecdc4      /* Main brand color */
--primary-dark: #45b7aa       /* Darker variant */
--primary-light: #6dd5cd      /* Lighter variant */
--primary-hover: #3ab4a6      /* Hover state */
```

### **Semantic Colors**
```css
--success-color: #10b981      /* Success states */
--warning-color: #f59e0b      /* Warning states */
--error-color: #ef4444        /* Error states */
--info-color: #3b82f6         /* Information states */
```

### **Pattern Family Colors**
```css
--pattern-423-color: #3b82f6  /* Burke's Barrage (Blue) */
--pattern-531-color: #8b5cf6  /* Box (Purple) */
--pattern-441-color: #10b981  /* Half-Box (Green) */
--pattern-3-color: #ef4444    /* Mills Mess (Red) */
--pattern-4-color: #f59e0b    /* Fountain (Orange) */
```

### **Text Colors**
```css
--text-color: #e0e0e0         /* Primary text */
--text-light: #a0a0a0         /* Secondary text */
--text-lighter: #808080       /* Tertiary text */
--header-color: #f0f0f0       /* Headings */
```

### **Background Colors**
```css
--background-color: #121212   /* Main background */
--card-background: #1e1e1e    /* Card backgrounds */
--card-hover: #252525         /* Card hover state */
```

## 📏 **Spacing System**

Use the standardized spacing scale for consistent layouts:

```css
--spacing-xs: 0.25rem    /* 4px - Minimal spacing */
--spacing-sm: 0.5rem     /* 8px - Small spacing */
--spacing-md: 1rem       /* 16px - Standard spacing */
--spacing-lg: 1.5rem     /* 24px - Large spacing */
--spacing-xl: 2rem       /* 32px - Extra large spacing */
--spacing-xxl: 3rem      /* 48px - Section spacing */
```

## 🔤 **Typography Scale**

### **Font Sizes**
```css
--font-size-xs: 0.75rem    /* 12px - Small labels */
--font-size-sm: 0.875rem   /* 14px - Secondary text */
--font-size-base: 1rem     /* 16px - Body text */
--font-size-md: 1.125rem   /* 18px - Emphasized text */
--font-size-lg: 1.25rem    /* 20px - Small headings */
--font-size-xl: 1.5rem     /* 24px - Medium headings */
--font-size-xxl: 2rem      /* 32px - Large headings */
--font-size-xxxl: 3rem     /* 48px - Hero headings */
```

### **Font Weights**
```css
--font-weight-light: 300      /* Light text */
--font-weight-normal: 400     /* Regular text */
--font-weight-medium: 500     /* Medium emphasis */
--font-weight-semibold: 600   /* Strong emphasis */
--font-weight-bold: 700       /* Bold headings */
```

## 🔘 **Border Radius**

```css
--border-radius-xs: 0.125rem  /* 2px - Minimal rounding */
--border-radius-sm: 0.25rem   /* 4px - Small elements */
--border-radius-md: 0.5rem    /* 8px - Standard elements */
--border-radius-lg: 1rem      /* 16px - Large elements */
--border-radius-xl: 1.5rem    /* 24px - Hero elements */
```

## 🌟 **Shadows**

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)    /* Subtle shadow */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1)     /* Small shadow */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)     /* Medium shadow */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)   /* Large shadow */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1)   /* Extra large shadow */
```

## ⚡ **Transitions**

```css
--transition-fast: 0.15s ease      /* Quick interactions */
--transition-normal: 0.3s ease     /* Standard transitions */
--transition-slow: 0.5s ease       /* Slow animations */
--magic-transition: cubic-bezier(0.4, 0, 0.2, 1)  /* Smooth easing */
```

## 📱 **Responsive Breakpoints**

```css
/* Mobile First Approach */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

## 🧩 **Component Patterns**

### **Card Component**
```css
.card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.card:hover {
  background: var(--card-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### **Button Component**
```css
.btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
```

## ✅ **Best Practices**

### **DO:**
- ✅ Use CSS variables for all styling values
- ✅ Follow the established spacing scale
- ✅ Maintain consistent hover states
- ✅ Use semantic color names
- ✅ Test across different screen sizes
- ✅ Ensure proper focus states

### **DON'T:**
- ❌ Hard-code color values
- ❌ Use arbitrary spacing values
- ❌ Mix different design systems
- ❌ Ignore accessibility requirements
- ❌ Create component-specific variables for global values

## 🔧 **Implementation Guidelines**

### **1. Variable Usage**
Always use CSS variables instead of hard-coded values:
```css
/* ✅ Good */
color: var(--text-color);
margin: var(--spacing-md);

/* ❌ Bad */
color: #e0e0e0;
margin: 16px;
```

### **2. Component Structure**
Follow consistent component patterns:
```css
.component-name {
  /* Layout properties */
  /* Visual properties */
  /* Interaction properties */
}

.component-name__element {
  /* Element-specific styles */
}

.component-name--modifier {
  /* Modifier styles */
}
```

### **3. Responsive Design**
Use mobile-first approach:
```css
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}
```

## 🎯 **Quality Checklist**

Before implementing new components, ensure:

- [ ] All colors use CSS variables
- [ ] Spacing follows the established scale
- [ ] Typography uses the defined scale
- [ ] Hover states are implemented
- [ ] Focus states are accessible
- [ ] Component is responsive
- [ ] Transitions are smooth
- [ ] Code follows naming conventions

---

**Last Updated:** June 1, 2025  
**Version:** 1.0.0
