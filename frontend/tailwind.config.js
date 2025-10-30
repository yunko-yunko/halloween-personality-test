/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        halloween: {
          dark: '#000000',
          darker: '#000000',
          orange: '#ff6b35',
          purple: '#6a0dad',
          green: '#39ff14',
          blood: '#8b0000',
          'orange-light': '#ff8c5a',
          'purple-light': '#8b2fc9',
          'gray-dark': '#1a1a1a',
          'gray-medium': '#2a2a2a',
        }
      },
      fontFamily: {
        spooky: ['Creepster', 'cursive'],
        korean: ['Noto Sans KR', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(255, 107, 53, 0.5), 0 0 10px rgba(255, 107, 53, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.8), 0 0 30px rgba(255, 107, 53, 0.5)',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 3s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.5s ease-out',
        bounce: 'bounce 1s ease-in-out infinite',
      },
      boxShadow: {
        'halloween-glow': '0 0 15px rgba(255, 107, 53, 0.5), 0 0 30px rgba(255, 107, 53, 0.3)',
        'halloween-glow-purple': '0 0 15px rgba(106, 13, 173, 0.5), 0 0 30px rgba(106, 13, 173, 0.3)',
        'halloween-glow-green': '0 0 15px rgba(57, 255, 20, 0.5), 0 0 30px rgba(57, 255, 20, 0.3)',
      },
      transitionProperty: {
        'halloween': 'all',
      },
      transitionDuration: {
        'halloween': '300ms',
      },
      transitionTimingFunction: {
        'halloween': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }
  },
  plugins: [],
}
