/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-subtle': 'var(--color-surface-subtle)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'button-bg': 'var(--button-bg)',
        'button-text': 'var(--button-text)',
        'button-border': 'var(--button-border)',
        'button-secondary-bg': 'var(--button-secondary-bg)',
        'button-secondary-text': 'var(--button-secondary-text)',
        'button-secondary-border': 'var(--button-secondary-border)',
      },
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        heading: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['monospace']
      }
    },
  },
  plugins: [],
}

