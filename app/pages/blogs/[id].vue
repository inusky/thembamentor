<template>
  <section class="blogDetail section">
    <div class="container">
      <div class="blogDetail__layout">
        <main class="blogDetail__main">
          <p v-if="blogPending" class="blogDetail__state">Loading story...</p>
          <p v-else-if="blogError" class="blogDetail__state">Unable to load this story.</p>
          <p v-else-if="!blog" class="blogDetail__state">Story not found.</p>
          <article v-else-if="blog" class="story">
            <header class="story__header">
              <h1 class="story__title">{{ blog.title }}</h1>
              <p class="story__description">{{ blog.description }}</p>
              <p class="story__date">{{ formatUpdatedDate(blog.updatedAt) }}</p>
            </header>

            <div v-if="blog.imageUrl" class="story__hero">
              <img :src="blog.imageUrl" :alt="blog.title" loading="eager" />
            </div>

            <div class="story__content" v-html="blog.content"></div>
          </article>
        </main>

        <aside class="blogDetail__side">
          <h2 class="blogDetail__sideTitle">Recent stories</h2>

          <div class="recentList">
            <p v-if="recentPending" class="blogDetail__sideState">Loading recent stories...</p>
            <p v-else-if="recentError" class="blogDetail__sideState">Unable to load recent stories.</p>

            <NuxtLink
              v-for="recent in recentStories"
              :key="`recent-${recent.id}`"
              :to="`/blogs/${recent.id}`"
              class="recentCard"
            >
              <h3 class="recentCard__title">{{ recent.title }}</h3>
              <p class="recentCard__date">{{ formatUpdatedDate(recent.updatedAt) }}</p>
            </NuxtLink>

            <p
              v-if="!recentPending && !recentError && recentStories.length === 0"
              class="blogDetail__sideState"
            >
              No recent stories.
            </p>
          </div>
        </aside>
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

const route = useRoute();
const blogId = computed(() => String(route.params.id ?? ''));

const { data: blogData, pending: blogPending, error: blogError } = await useFetch<BlogItem | null>(
  () => `/api/v1/blogs/${blogId.value}`,
  {
    default: () => null,
  },
);

const { data: recentData, pending: recentPending, error: recentError } = await useFetch<BlogItem[]>(
  '/api/v1/blogs/few',
  {
    default: () => [],
  },
);

const blog = computed(() => blogData.value);
const recentStories = computed(() => recentData.value ?? []);

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

function formatUpdatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last Updated';
  return `Last Updated ${dateFormatter.format(date)}`;
}

useHead(() => ({
  title: blog.value ? `${blog.value.title} | The MBA Mentor` : 'Blogs | The MBA Mentor',
}));
</script>

<style scoped lang="scss">
.blogDetail {
  padding-top: clamp(1rem, 2vw, 1.8rem);
  padding-bottom: clamp(2rem, 3vw, 3.2rem);
}

.blogDetail__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);
  gap: clamp(1.2rem, 2vw, 2.2rem);
  align-items: start;
}

.blogDetail__main {
  min-width: 0;
}

.blogDetail__state {
  margin: 0;
  border-radius: 1.25rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  padding: 1.1rem 1.2rem;
}

.story {
  display: grid;
  gap: 1.2rem;
}

.story__header {
  display: grid;
  gap: 0.85rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #cbd5e1;
}

.story__title {
  margin: 0;
  color: #0b1b3d;
  font-size: clamp(1.6rem, 2.8vw, 3.6rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}

.story__description {
  margin: 0;
  color: #334e6f;
  font-size: clamp(1.2rem, 2.1vw, 2.2rem);
  line-height: 1.28;
}

.story__date {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

.story__hero {
  border-radius: 1.8rem;
  overflow: hidden;
}

.story__hero img {
  width: 100%;
  max-height: min(68vh, 700px);
  object-fit: cover;
  display: block;
}

.story__content {
  display: grid;
  gap: 1.6rem;
}

.story__content :deep(p) {
  margin: 0;
  color: #0f294a;
  font-size: clamp(1.25rem, 1.55vw, 1.95rem);
  line-height: 1.55;
}

.story__content :deep(h2),
.story__content :deep(h3),
.story__content :deep(h4) {
  margin: 0;
  color: #0b1b3d;
  line-height: 1.2;
}

.story__content :deep(ul),
.story__content :deep(ol) {
  margin: 0;
  padding-left: 1.4rem;
  color: #0f294a;
  display: grid;
  gap: 0.4rem;
}

.story__content :deep(a) {
  color: #1d4ed8;
}

.blogDetail__side {
  display: grid;
  gap: 0.9rem;
}

.blogDetail__sideTitle {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.4rem, 2vw, 2rem);
}

.recentList {
  display: grid;
  gap: 1rem;
}

.recentCard {
  border-radius: 1.4rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
  padding: 1rem 1.1rem;
  color: inherit;
  text-decoration: none;
  position: relative;
  top: 0;
  transition: top 0.28s ease;
}

.recentCard:hover,
.recentCard:focus-visible {
  top: -6px;
}

.recentCard__title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.05rem, 1.35vw, 1.55rem);
  line-height: 1.2;
}

.recentCard__date {
  margin: 0.6rem 0 0;
  color: #64748b;
  font-size: 1rem;
}

.blogDetail__sideState {
  margin: 0;
  color: #334155;
}

@media (max-width: 960px) {
  .blogDetail__layout {
    grid-template-columns: 1fr;
  }

  .blogDetail__side {
    order: -1;
  }
}
</style>
