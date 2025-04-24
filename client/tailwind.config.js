/** @type {import('tailwindcss').Config} */

  module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: "#008651",
          accent: "#FFD700",
          dark: "#333333",
        }
      },
    },
    plugins: [],
  }
  