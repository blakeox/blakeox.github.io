# Blake Oxford Portfolio

[![CI & Tests](https://github.com/blakeox/blakeox.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/blakeox/blakeox.github.io/actions/workflows/ci.yml)
[![Deploy to Pages](https://github.com/blakeox/blakeox.github.io/actions/workflows/pages-deploy.yml/badge.svg)](https://github.com/blakeox/blakeox.github.io/actions/workflows/pages-deploy.yml)

A fast, SEO‑optimized, Jekyll‑powered portfolio for **Blake Oxford**—IT Director, Business Systems Manager, Digital Transformation Consultant, and Enterprise Solutions Architect.

---

## 🚀 Features

- **Responsive Design**  
  Mobile‑first layouts with custom Sass and Flex/Grid.

- **Project Collections**  
  Organize case studies under `_projects/` with tag‑based filtering.

- **Pagination**  
  Browse long lists easily via `jekyll-paginate`.

- **SEO & Social**  
  Auto‑generated `<meta>` via `jekyll-seo-tag`, `<link rel="canonical">`, sitemaps, and Open Graph/Twitter cards.

- **Progressive Web App Ready**  
  Service‑worker + `manifest.json` scaffold in place.

- **CI/CD**  
  GitHub Actions pipeline for CodeQL, linting, HTMLProofer, Lighthouse, Axe, and automated Pages deploys.

---

## 🔧 Local Development

### Prerequisites

- **Ruby** ≥ 3.1 (via [rbenv](https://github.com/rbenv/rbenv) or [rvm](https://rvm.io/))  
- **Bundler** (`gem install bundler`)  
- **Node.js** v20 (via [nvm](https://github.com/nvm-sh/nvm))  
- **Yarn** (`npm install -g yarn`)  

### Clone & Install

```bash
git clone https://github.com/blakeox/blakeox.github.io.git
cd blakeox.github.io

# Install Ruby gems
bundle install

# Install JavaScript deps
yarn install --frozen-lockfile