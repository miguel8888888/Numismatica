/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Tus colores personalizados
        'grey-darkest': '#3d4852',
        'grey-darker': '#606f7b',
        'grey-dark': '#8795a1',
        'grey': '#b8c2cc',
        'grey-light': '#dae1e7',
        'grey-lighter': '#f1f5f8',
        'grey-lightest': '#f8fafc',
        'grey-mid-light': '#f3f3f4',
        'white-lightest': '#f4f4f4',
        'white-medium': '#FAFAFA',
        'white-medium-dark': '#E5E9EB',
        'nav': '#3F495E',
        'side-nav': '#ECF0F1',
        'nav-item': '#626b7a',
        'light-border': '#dfe4e6',
        'primary': '#51BE99',
        'primary-dark': '#0e5f43',
        'warning': '#f4ab43',
        'warning-dark': '#c37c16',
        'black-dark': '#272634',
        'black-darkest': '#141418',
        'info': '#52bcdc',
        'info-dark': '#2cadd4',
        'success': '#72b159',
        'success-dark': '#5D9547',
        'red-vibrant': '#e46050',
        'red-vibrant-dark': '#d64230',
      }
    },
  },
  plugins: [
    require('tailwindcss-tables')()
  ],
}