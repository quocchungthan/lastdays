/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 10px rgba(52,152,219, 0.8)', // Customize the glow color and intensity
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}

