/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          active: 'var(--color-primary-active)',
          disabled: 'var(--color-primary-disabled)',
        },
        ink: 'var(--color-ink)',
        body: {
          DEFAULT: 'var(--color-body)',
          strong: 'var(--color-body-strong)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          soft: 'var(--color-muted-soft)',
        },
        hairline: {
          DEFAULT: 'var(--color-hairline)',
          soft: 'var(--color-hairline-soft)',
        },
        canvas: 'var(--color-canvas)',
        surface: {
          soft: 'var(--color-surface-soft)',
          card: 'var(--color-surface-card)',
          'cream-strong': 'var(--color-surface-cream-strong)',
          dark: 'var(--color-surface-dark)',
          'dark-elevated': 'var(--color-surface-dark-elevated)',
          'dark-soft': 'var(--color-surface-dark-soft)',
        },
        on: {
          primary: 'var(--color-on-primary)',
          dark: 'var(--color-on-dark)',
          'dark-soft': 'var(--color-on-dark-soft)',
        },
        accent: {
          teal: 'var(--color-accent-teal)',
          amber: 'var(--color-accent-amber)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        display: ['EB Garamond', 'Cormorant Garamond', 'Tiempos Headline', 'Times New Roman', 'serif'],
        sans: ['Inter', 'StyreneB', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '96px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
        full: '9999px',
      }
    },
  },
  plugins: [],
}
