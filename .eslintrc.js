module.exports = {
  "env": {
      "browser": true,
      "es2021": true,
      "node": true
  },
  "extends": [
      "airbnb-base/legacy"
  ],
  "parserOptions": {
      "ecmaFeatures": {
          "jsx": true
      },
      "ecmaVersion": "latest",
      "sourceType": "module"
  },
  "plugins": [
      "react"
  ],
  "rules": {
    "eslint linebreak-style": ["error", "windows"],
    "linebreak-style": 0,
    "eslint no-underscore-dangle": ["error", { "allow": ["_id"] }],
    "eol-last": 0,
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
  }
}