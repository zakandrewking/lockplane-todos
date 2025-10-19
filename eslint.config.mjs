import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
});

const nextConfig = compat.extends("next/core-web-vitals");

const config = [
  {
    ignores: ["dist/**", ".next/**", "node_modules/**"],
  },
  ...nextConfig,
];

export default config;
