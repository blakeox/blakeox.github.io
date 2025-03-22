---
layout: page
title: "Projects & Case Studies"
permalink: /projects/
---

# Projects & Case Studies

<!-- (Optional) Filtering Buttons -->
<div class="filter-buttons">
  <button class="filter-button btn" data-filter="all">All</button>
  <button class="filter-button btn" data-filter="cloud">Cloud</button>
  <button class="filter-button btn" data-filter="automation">Automation</button>
  <button class="filter-button btn" data-filter="saas">SaaS</button>
</div>

<div class="project-grid">
  {% for project in site.projects %}
    <div class="project-item" data-tags="{{ project.tags | join: ' ' | downcase }}">
      {% if project.image %}
        <img src="{{ project.image | relative_url }}" alt="{{ project.title }}">
      {% endif %}
      <h3><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h3>
      <p>{{ project.description }}</p>
      {% if project.link %}
        <a href="{{ project.link }}" class="btn" target="_blank">View Project</a>
      {% endif %}
      <p>
        {% for tag in project.tags %}
          <span class="tag">{{ tag }}</span>
        {% endfor %}
      </p>
    </div>
  {% endfor %}
</div>

<!-- Include the filtering script -->
<script src="/assets/js/filter.js"></script>
