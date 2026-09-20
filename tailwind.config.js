/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],

  theme: {
    extend: {
      colors: {
        "namrino-navy": "#070b16",
        "namrino-navy-2": "#0b1020",
        "namrino-navy-70": "rgba(7, 11, 22, 0.70)",

        "namrino-purple": "#8b5cf6",
        "namrino-purple-08": "rgba(139, 92, 246, 0.08)",
        "namrino-purple-10": "rgba(139, 92, 246, 0.10)",
        "namrino-purple-12": "rgba(139, 92, 246, 0.12)",
        "namrino-purple-14": "rgba(139, 92, 246, 0.14)",
        "namrino-purple-15": "rgba(139, 92, 246, 0.15)",
        "namrino-purple-16": "rgba(139, 92, 246, 0.16)",
        "namrino-purple-20": "rgba(139, 92, 246, 0.20)",
        "namrino-purple-25": "rgba(139, 92, 246, 0.25)",
        "namrino-purple-30": "rgba(139, 92, 246, 0.30)",
        "namrino-purple-45": "rgba(139, 92, 246, 0.45)",
        "namrino-purple-60": "rgba(139, 92, 246, 0.60)",

        "namrino-cyan": "#22d3ee",
        "namrino-cyan-08": "rgba(34, 211, 238, 0.08)",
        "namrino-cyan-12": "rgba(34, 211, 238, 0.12)",
        "namrino-cyan-20": "rgba(34, 211, 238, 0.20)"
      }
    }
  },

  plugins: []
};
