/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.ts',
    './resources/**/*.tsx',
    './resources/css/app.css', // ✅ include your CSS here
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
