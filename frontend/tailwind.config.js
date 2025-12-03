/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grey palette
        'pure-white': '#FFFFFF',
        'lightest-grey': '#F2F2F2',
        'extra-light-grey': '#E5E5E5',
        'light-grey': '#CCCCCC',
        'medium-grey': '#999999',
        'dark-grey': '#666666',
        'extra-dark-grey': '#333333',
        'pure-black': '#000000',
        // Surface colors (mapped to grey palette)
        surface: {
          darkest: '#000000',      // Pure Black
          dark: '#333333',          // Extra Dark Grey
          medium: '#666666',        // Dark Grey
          light: '#999999',         // Medium Grey
        },
        // Text colors
        text: {
          primary: '#FFFFFF',       // Pure White
          secondary: '#CCCCCC',     // Light Grey
          tertiary: '#999999',      // Medium Grey
          muted: '#666666',         // Dark Grey
        },
        // Accent colors (using greys for warnings/info)
        accent: {
          warning: '#999999',       // Medium Grey
          info: '#CCCCCC',          // Light Grey
          success: '#E5E5E5',        // Extra Light Grey
        },
      },
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'subheading': ['Poppins', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
        'ui': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'binary': "url('/images/Binary Code Background.jpg')",
      },
    },
  },
  plugins: [],
}

