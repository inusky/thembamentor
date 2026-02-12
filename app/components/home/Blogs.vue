<template>
  <section id="blogs" class="section blogs">
    <div class="container blogs__wrap">
      <div class="blogs__banner">
        <div class="blogs__intro">
          <h2 class="blogs__title">Hot new releases</h2>
          <a class="blogs__cta" href="/blogs">
            Explore blogs
            <span class="blogs__ctaChevron" aria-hidden="true">→</span>
          </a>
        </div>

        <div class="blogs__content">
          <p v-if="pending || error || orderedBlogs.length === 0" class="blogs__status" role="status" aria-live="polite">
            <span v-if="pending">Loading blogs...</span>
            <span v-else-if="error">Unable to load blogs.</span>
            <span v-else>No blogs found.</span>
          </p>

          <div v-else class="blogs__grid">
            <NuxtLink v-for="blog in orderedBlogs" :key="blog.id" to="/blogs" class="blogCardLink">
              <article class="blogCard">
                <div class="blogCard__media">
                  <img v-if="blog.imageUrl" :src="blog.imageUrl" :alt="blog.title" loading="lazy" />
                  <div v-else class="blogCard__placeholder" aria-hidden="true"></div>
                </div>

                <div class="blogCard__body">
                  <p class="blogCard__tag">Blog</p>
                  <h3 class="blogCard__title">{{ blog.title }}</h3>
                  <p class="blogCard__description">{{ blog.description }}</p>
                </div>
              </article>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type BlogItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string;
  content: string;
  updatedAt: string;
};

const { data, pending, error } = await useFetch<BlogItem[]>('/api/v1/blogs/few', {
  default: () => [],
});

const orderedBlogs = computed(() => data.value ?? []);
</script>

<style scoped lang="scss">
.blogs__wrap {
  display: grid;
  gap: 2rem;
}

.blogs__banner {
  background: linear-gradient(110deg, #1d4ed8 0%, #4f9adf 58%, #58c8b6 100%);
  border-radius: clamp(1.1rem, 2.5vw, 2rem);
  padding: clamp(1.6rem, 3.6vw, 2.7rem);
  display: grid;
  grid-template-columns: minmax(180px, 230px) minmax(0, 1fr);
  align-items: center;
  gap: clamp(0.75rem, 1.4vw, 1.2rem);
  min-height: clamp(14rem, 26vw, 19rem);
}

.blogs__intro {
  display: grid;
  gap: 1.1rem;
}

.blogs__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.5rem, 2.3vw, 2.2rem);
  font-weight: 500;
}

.blogs__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.65rem 2.4rem 0.65rem 1rem;
  background: #ffffff;
  color: #1d4ed8;
  border-radius: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.blogs__ctaChevron {
  margin-left: 0.45rem;
  display: inline-block;
  transition: transform 0.22s ease;
}

.blogs__cta:hover .blogs__ctaChevron,
.blogs__cta:focus-visible .blogs__ctaChevron {
  transform: translateX(1.45rem);
}

.blogs__status {
  margin: 0;
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 1rem 1.3rem;
  border-radius: 0.8rem;
  min-width: 14.5rem;
  text-align: center;
}

.blogs__content {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.blogs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 320px));
  gap: 1rem;
  width: 100%;
  align-items: start;
  justify-content: start;
}

@media (max-width: 960px) {
  .blogs__banner {
    grid-template-columns: 1fr;
  }

  .blogs__content {
    width: 100%;
  }
}

.blogCardLink {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 1.35rem;
  position: relative;
  top: 0;
  transition: top 0.28s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.blogCardLink:focus-visible {
  outline: none;
}

.blogCardLink:hover,
.blogCardLink:focus-visible {
  top: -14px;
  z-index: 3;
}

.blogCardLink:hover .blogCard,
.blogCardLink:focus-visible .blogCard {
  box-shadow: none;
  outline-color: rgba(255, 255, 255, 0.98);
  border-color: rgba(255, 255, 255, 0.98);
  background-color: #ffffff;
}

.blogCard {
  background: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.98);
  outline: 2px solid rgba(255, 255, 255, 0.98);
  outline-offset: -2px;
  border-radius: 1.35rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: none;
  position: relative;
  z-index: 1;
}

.blogCard__media {
  aspect-ratio: 16 / 11;
  background: #cbd8e8;
  border-bottom: 1px solid rgba(15, 23, 42, 0.12);
}

.blogCard__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blogCard__placeholder {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.34) 0 18%, transparent 19%),
    radial-gradient(circle at 78% 72%, rgba(255, 255, 255, 0.24) 0 14%, transparent 15%),
    linear-gradient(135deg, #4f9adf 0%, #3b82f6 45%, #58c8b6 100%);
}

.blogCard__body {
  padding: 1rem 1.15rem 1.2rem;
  display: grid;
  gap: 0.45rem;
}

.blogCard__tag {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
}

.blogCard__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.85rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  line-height: 1.35;
}

.blogCard__description {
  margin: 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.45;
}

</style>
