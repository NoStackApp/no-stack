module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        modules: false
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "graphql-tag",
    "@babel/plugin-transform-runtime"
  ],
};
