// stylelint.config.mjs
export default {
  root: true,
  customSyntax: 'postcss-scss',
  reportNeedlessDisables: true,

  extends: ['stylelint-config-standard-scss'],

  plugins: [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-use-logical',
    '@double-great/stylelint-a11y'
  ],

  ignoreFiles: ['assets/css/**/*.css'],

  overrides: [
    {
      files: ['**/utilities/**/*.scss'],
      rules: {
        'selector-class-pattern': null
      }
    },
    {
      files: ['**/pages/**/*.scss'],
      rules: {
        'a11y/media-prefers-color-scheme': null
      }
    }
  ],

  rules: {
    'order/order': [
      [
        'custom-properties',
        'dollar-variables',
        'at-variables',
        'at-rules',
        'declarations',
        'rules'
      ],
      { severity: 'warning' }
    ],
    'order/properties-alphabetical-order': true,

    'declaration-empty-line-before': ['never', {
      except: ['first-nested'],
      ignore: ['after-comment', 'inside-single-line-block'],
      severity: 'warning'
    }],
    'at-rule-empty-line-before': ['always', {
      except: ['blockless-after-same-name-blockless', 'first-nested'],
      ignore: ['after-comment', 'inside-block'],
      severity: 'warning'
    }],
    'rule-empty-line-before': ['always', {
      except: ['first-nested'],
      ignore: ['after-comment', 'inside-block'],
      severity: 'warning'
    }],

    'max-nesting-depth': [3, {
      ignore: ['pseudo-classes'],
      severity: 'warning'
    }],
    'selector-class-pattern': [
      '^(?:o|c|u|t|is|has)-[a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?$',
      {
        message: 'Use ITCSS prefixes (o-, c-, u-, t-, is-, has-) with BEM structure.',
        severity: 'warning'
      }
    ],

    'scss/at-mixin-argumentless-call-parentheses': 'always',
    'scss/at-extend-no-missing-placeholder': true,
    'scss/dollar-variable-pattern': '^[a-z0-9\\-]+$',
    'scss/percent-placeholder-pattern': '^[a-z0-9\\-]+$',
    'scss/selector-no-redundant-nesting-selector': true,
    'scss/no-global-function-names': true,

    'alpha-value-notation': 'number',
    'media-feature-range-notation': 'prefix',
    'import-notation': 'string',
    'color-function-notation': 'modern',

    'csstools/use-logical': 'always',

    'a11y/selector-pseudo-class-focus': true,
    'a11y/media-prefers-color-scheme': true,

    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': [true, {
      ignore: ['consecutive-duplicates-with-different-values']
    }],
    'no-duplicate-selectors': true,
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global']
    }],
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'extend', 'include', 'mixin',
        'if', 'else', 'for', 'each',
        'function', 'return'
      ]
    }],
    'declaration-property-value-no-unknown': true,
    'no-descending-specificity': true,
    'keyframes-name-pattern': '^[a-z0-9-]+$'
  }
};