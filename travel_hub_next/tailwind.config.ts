import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#4f46e5", // Indigo 600
                    foreground: "#ffffff",
                    hover: "#4338ca",   // Indigo 700
                    light: "#e0e7ff",   // Indigo 100
                },
                accent: {
                    DEFAULT: "#10b981", // Emerald 500
                    hover: "#059669",   // Emerald 600
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [],
};
export default config;
