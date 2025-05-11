if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

/** @type {Linter.FlatConfig[]} */
const config = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  },
  {
    files: ['**/tech-search*.js', '**/search-history.js', '**/keyboard-navigation.js'],
    rules: {
      // Enforce JSDoc comments for public methods in our search modules
      'valid-jsdoc': ['warn', {
        requireReturn: false,
        requireParamDescription: true,
        preferType: {
          'Boolean': 'boolean',
          'Number': 'number',
          'String': 'string',
          'Object': 'object'
        }
      }],
      // Prevent accidental global variable leaks
      'no-var': 'error',
      // Encourage use of strict equality to prevent type coercion bugs
      'eqeqeq': ['error', 'always'],
      // Consistent function style for our module pattern
      'func-style': ['warn', 'declaration'],
      // Ensure our modules are properly encapsulated
      'wrap-iife': ['error', 'inside'],
      // Prevent modification of external objects (like window)
      'no-extend-native': 'error'
    },
  },
];

module.exports = config;