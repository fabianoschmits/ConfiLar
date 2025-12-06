const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Suprimir avisos de variáveis não utilizadas
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars-experimental": "off",

      // Suprimir avisos de dependências de hooks
      "react-hooks/exhaustive-deps": "off",

      // Suprimir avisos de imagens
      "@next/next/no-img-element": "off",

      // Suprimir avisos de acessibilidade
      "jsx-a11y/alt-text": "off",

      // Suprimir outros avisos comuns
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
    },
  },
  {
    ignores: ["node_modules/", ".next/", "out/", "build/", "dist/"],
  },
];
