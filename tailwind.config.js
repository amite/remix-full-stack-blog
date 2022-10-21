/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
    theme: {
      container: {
        center: true,
      },
    },
  },
  plugins: [require("daisyui")],
};
