import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        splatoon: {
          pink: '#F02D7D',
          green: '#19D719',
          yellow: '#EAF205',
          orange: '#FF5C00',
          purple: '#7D4FFF',
          blue: '#00AEEF',
        },
      },
    },
  },
  plugins: [],
}
export default config
