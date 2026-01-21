module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {
      // Autoprefixer automatically reads browserslist from package.json
      // This ensures CSS prefixes match our browser support targets
    },
  },
};
