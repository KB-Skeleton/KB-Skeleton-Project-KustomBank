/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "kb-yellow": "#FFD338",
        "kb-charcoal": "#222222",
        "kb-brown": "#7A5C3F",
        "kb-gray": "#F5F4F1",
        "kb-gray-100": "#EFECE6",
        "kb-gray-200": "#E1DDD4",
      },
    },
  },
  plugins: [],
};

