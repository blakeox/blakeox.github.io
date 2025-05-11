
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('@fullhuman/postcss-purgecss')({
      content: [
        './_site/**/*.html',
        './_layouts/**/*.html',
        './_includes/**/*.html',
        './_sass/**/*.scss',
        './assets/js/**/*.js'
      ],
      defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
    })
  ]
};