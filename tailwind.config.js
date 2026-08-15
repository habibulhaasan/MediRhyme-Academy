/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#003366", light: "#0a4d8c", dark: "#001f3f" },
        gold: { DEFAULT: "#ffd700", light: "#ffe866" },
      },
      fontFamily: {
        hind: ["'Hind Siliguri'", "sans-serif"],
        poppins: ["'Poppins'", "sans-serif"],
      },
      backgroundImage: {
        "course-gradient": "linear-gradient(135deg, #6dd5ed, #2193b0)",
        "mcq-gradient": "linear-gradient(135deg, #f7bb97, #dd5e89)",
      },
      keyframes: {
        floatUp: { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: { floatUp: "floatUp 0.6s ease-out forwards" },
    },
  },
  plugins: [],
};
