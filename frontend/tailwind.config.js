module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'nunito': ['nunito', 'sans-serif'],
      'base': ['AnonymousPro', 'Oswald'],
      'head': ['Bebas Neue', 'sans-serif'],
      'try': ['Noto Sans', 'sans-serif'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
