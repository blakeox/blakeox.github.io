module.exports = {
  extends: 'stylelint-config-standard-scss',
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extend', 'include', 'mixin', 'if', 'else', 'for', 'each', 'function', 'return'],
      },
    ],
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-trailing-semicolon': 'always',
    'no-duplicate-selectors': true,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
};