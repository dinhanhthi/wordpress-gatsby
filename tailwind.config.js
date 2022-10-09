/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/styles/safelist.txt',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/layouts/**/*.{js,jsx,ts,tsx}',
    './src/templates/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        main: '#1e293b',
        'main-dark': '#f8fafc',
        'main-dark-bg': '#282a36',
        'nav-dark-bg': '#323541',
        'code-dark-bg': '#343e4c',
        'dark-border': '#3b3e54',
        link: '#2563eb', // blue-600
        // 'link-dark': '#fcd34d', // amber-300
        'link-dark': '#ffd479',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
