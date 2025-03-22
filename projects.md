---
layout: page
title: "Projects & Case Studies"
permalink: /projects/
---

<!-- Filtering Buttons -->
<div class="filter-buttons">
  <button class="filter-button btn" data-filter="all" aria-label="Show all projects">All</button>
  {% assign all_tags = site.projects | map: "tags" | join: " " | split: " " | uniq %}
  {% for tag in all_tags %}
    <button class="filter-button btn" data-filter="{{ tag | downcase }}" aria-label="Filter projects by {{ tag | capitalize }}">{{ tag | capitalize }}</button>
  {% endfor %}
</div>

<!-- Project Grid -->
<div class="project-grid">
  {% for project in paginator.projects %}
    <div class="project-item" data-tags="{{ project.tags | join: ' ' | downcase }}">
      {% if project.image %}
        <img src="{{ project.image | relative_url }}" alt="{{ project.title }}">
      {% else %}
        <img src="/assets/images/default-project.png" alt="Default Project Image">
      {% endif %}
      <h3><a href="{{ project.url | relative_url }}" aria-label="View details about {{ project.title }}">{{ project.title }}</a></h3>
      <p>{{ project.description }}</p>
      {% if project.link %}
        <a href="{{ project.link }}" class="btn" target="_blank" aria-label="Visit {{ project.title }}">View Project</a>
      {% endif %}
      <p>
        {% for tag in project.tags %}
          <span class="tag">{{ tag }}</span>
        {% endfor %}
      </p>
    </div>
  {% endfor %}
</div>

<!-- No Projects Found Message -->
{% if paginator.projects.size == 0 %}
  <p>No projects found. Please try a different filter.</p>
{% endif %}

<!-- Pagination -->
<nav class="pagination">
  {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path | relative_url }}" class="btn" aria-label="Go to previous page">Previous</a>
  {% endif %}
  {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path | relative_url }}" class="btn" aria-label="Go to next page">Next</a>
  {% endif %}
</nav>

<!-- Include the filtering script -->
<script src="/assets/js/filter.js"></script>