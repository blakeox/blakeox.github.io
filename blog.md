---
layout: page
title: "Blog"
permalink: /blog/
---

<section class="latest-blog-posts container">
  <h1>Blog</h1>
  <ul class="blog-post-list">
    {% for post in site.posts %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a> - <small>{{ post.date | date: "%B %d, %Y" }}</small>
      </li>
    {% endfor %}
  </ul>
</section>