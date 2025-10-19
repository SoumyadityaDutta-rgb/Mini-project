/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            height: {
                "1/10": "10%",
                "9/10": "90%",
            },
            backgroundColor: {
                "app-black": "#121212",
            },
            colors: {
                'victor-dark': '#121212',
                'victor-card': '#181818',
                'victor-card-hover': '#282828',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};