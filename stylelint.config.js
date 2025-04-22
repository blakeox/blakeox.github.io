module.exports = {
  // Use SCSS parser
  customSyntax: 'postcss-scss',
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss'
  ],
  ignoreFiles: ['assets/css/main.scss', '_sass/**/*.scss'],
  rules: {
    // Allow SCSS variables and function values
    'declaration-property-value-no-unknown': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extend', 'include', 'mixin', 'if', 'else', 'for', 'each', 'function', 'return'],
      },
    ],
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': true,
    'no-duplicate-selectors': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    // Allow projects to skip empty-line rules
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    // Allow any hex length
    'color-hex-length': null,
    'no-descending-specificity': null,
    'scss/no-global-function-names': null,
    'rule-empty-line-before': null,
    'scss/at-extend-no-missing-placeholder': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    'value-keyword-case': null,
    'media-feature-range-notation': null,
    // Allow @import without url() wrapping
    'import-notation': null,
    // Disable alias notation errors for color functions
    'color-function-alias-notation': null
  },
};