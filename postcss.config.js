// ✅ postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // trebuie să fie primul
    autoprefixer: {},
  },
};
