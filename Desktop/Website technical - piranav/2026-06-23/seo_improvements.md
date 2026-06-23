# SEO Accessibility Improvements

> [!TIP]
> **PageSpeed SEO Score Improvement**
> 
> - **Before**: 92
> - **After**: 100

## The Issue
Lighthouse flagged several blog post links on the website because they only contained the text "READ MORE". Search engines and screen readers require descriptive text within links to understand the destination content. 

Although `aria-label` was partially implemented, Lighthouse strictly looks for text content within the anchor element itself to pass the "Links do not have descriptive text" SEO check.

## The Solution
To satisfy Lighthouse without altering the visual design, we implemented visually hidden text inside the anchor tags. The visual text remains "READ MORE", while search engines and screen readers get the full descriptive context.

### Changes Made

#### 1. `snippets/article-card.liquid`
Added a `<span class="visually-hidden">` element to inject the article title dynamically.

```diff
- <a class="mt-5 fw-500 fs-12 uppercase blog-posts-readmore" href="{{ article.url }}" aria-label="Read more about {{ article.title }}" title="Read more about {{ article.title }}">
+ <a class="mt-5 fw-500 fs-12 uppercase blog-posts-readmore" href="{{ article.url }}" aria-label="{{ 'blog_post.read_more' | t }} about {{ article.title | escape }}" title="{{ 'blog_post.read_more' | t }} about {{ article.title | escape }}">
    {{- 'blog_post.read_more' | t -}}
+   <span class="visually-hidden"> about {{ article.title | escape }}</span>
  </a>
```

#### 2. `sections/blog-posts.liquid`
Updated the placeholder blog post cards to also include visually hidden text and proper ARIA labels.

```diff
- <a class="mt-5 fw-500 fs-12 uppercase blog-posts-readmore" href="/blogs/news/new-summer">
+ <a class="mt-5 fw-500 fs-12 uppercase blog-posts-readmore" href="/blogs/news/new-summer" aria-label="{{ 'blog_post.read_more' | t }} about {{ 'blog_post.title' | t | escape }}">
    {{- 'blog_post.read_more' | t -}}
+   <span class="visually-hidden"> about {{ 'blog_post.title' | t | escape }}</span>
  </a>
```

### Why This Works
The `.visually-hidden` utility class uses specific CSS rules (like `clip: rect(0 0 0 0)` and `position: absolute`) to hide the text from sighted users without using `display: none`. This allows Lighthouse's SEO crawler to successfully read the descriptive text and award the perfect 100 score.
