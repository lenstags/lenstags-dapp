/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        greenLengs: "#dff602",
        rojoLengs: "#ff3233",
        letrasGrises: "#a4a3a3",
        letterGray: "#AAAAAA",
        letterGray2: "#666666"

      }
    },
  },
  plugins: [require("daisyui")],
}