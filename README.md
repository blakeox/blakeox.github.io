# Blake Oxford Portfolio

Welcome to the Blake Oxford Portfolio repository. This site is built with [Jekyll](https://jekyllrb.com/) and hosted on [GitHub Pages](https://pages.github.com/).

## Features

- **Responsive Design:** Custom CSS for a modern, mobile-friendly user interface.
- **Dynamic Project Filtering:** Filter projects by tags with JavaScript.
- **Pagination:** Browse through projects with easy pagination.
- **SEO Optimized:** Managed with the `jekyll-seo-tag` plugin.
- **Progressive Web App (PWA) Ready:** Optional PWA support via `manifest.json` and a service worker (`sw.js`).
- **Project Collections:** Organized projects and case studies for an effective portfolio experience.

## Getting Started

### Prerequisites

- [Ruby](https://www.ruby-lang.org/en/) (v2.7 or higher recommended)
- [Bundler](https://bundler.io/)
- [Jekyll](https://jekyllrb.com/) (installed via Bundler)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/blakeox/blakeox.github.io.git
   ```

2. **Navigate into the directory:**

   ```bash
   cd blakeox.github.io
   ```

3. **Install dependencies:**

   ```bash
   bundle install
   ```

4. **Serve the site locally:**

   ```bash
   bundle exec jekyll serve
   ```

5. **Visit the site:**

   Open your browser and navigate to `http://127.0.0.1:4000` (or the configured port).

## Project Structure

- **_layouts/**: Layout templates for pages and project details.
- **_includes/**: Reusable components (e.g., header, footer, head).
- **_projects/**: Individual project markdown files.
- **assets/**: CSS, JavaScript, images, and other static assets.
- **_config.yml**: Jekyll configuration file.
- **README.md**: Project documentation (this file).

## GitHub Pages Deployment

This project is deployed using GitHub Pages. The deployment process is automated using GitHub Actions. The site is built with Jekyll and uses the `github-pages` gem for compatibility.

### Local Development
1. Install dependencies:
   ```bash
   bundle install
   ```
2. Serve the site locally:
   ```bash
   bundle exec jekyll serve
   ```

### Deployment
- Push changes to the `main` branch to trigger the deployment workflow.
- The site will be deployed to `https://<your-github-username>.github.io/blakeox.github.io/`.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests. For major changes, open an issue first to discuss what you would like to change.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or collaboration opportunities, please contact [blakepoxford@outlook.com](mailto:blakepoxford@outlook.com).