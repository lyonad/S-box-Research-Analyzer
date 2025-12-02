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
          magenta: '#E8175D',
          rose: '#CC527A',
          light: '#A8A7A7',
          dark: '#474747',
          darker: '#363636',
        },
        accent: {
          pink: '#E8175D',
          muted: '#CC527A',
        },
        neutral: {
          light: '#A8A7A7',
          gray: '#474747',
          dark: '#363636',
        }
      },
      fontFamily: {
        'heading': ['Merriweather', 'serif'],
        'body': ['Merriweather', 'serif'],
        'ui': ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'binary': "url('/images/Binary Code Background.jpg')",
      },
    },
  },
  plugins: [],
}

