<template>
  <section class="blogsPage section">
    <div class="container">
      <h1 class="blogsPage__title">Blogs</h1>

      <div class="blogsPage__layout">
        <div class="blogsPage__main">
          <p v-if="blogsPending" class="blogsPage__state">Loading insights...</p>
          <p v-else-if="blogsError" class="blogsPage__state">Unable to load insights.</p>
          <p v-else-if="blogs.length === 0" class="blogsPage__state">No stories available yet.</p>

          <article
            v-for="(blog, index) in blogs"
            :key="blog.id"
            class="storyCard"
            :class="{
              'storyCard--featured': index === 0,
              'storyCard--withImage': Boolean(blog.imageUrl),
            }"
            @click="$router.push(`/blogs/${blog.id}`)"
          >
            <div class="storyCard__content">
              <h2 class="storyCard__title">{{ blog.title }}</h2>
              <p class="storyCard__description">{{ blog.description }}</p>
              <p class="storyCard__date">{{ formatUpdatedDate(blog.updatedAt) }}</p>
            </div>

            <div v-if="blog.imageUrl" class="storyCard__media">
              <img :src="blog.imageUrl" :alt="blog.title" loading="lazy" />
            </div>
          </article>
        </div>

        <aside class="blogsPage__side">
          <h2 class="blogsPage__sideTitle">Recent stories</h2>

          <div class="recentList">
            <p v-if="recentPending" class="blogsPage__sideState">Loading recent stories...</p>
            <p v-else-if="recentError" class="blogsPage__sideState">Unable to load recent stories.</p>
            <article v-for="blog in recentStories" :key="`recent-${blog.id}`" class="recentCard" @click="$router.push(`/blogs/${blog.id}`)">
              <h3 class="recentCard__title">{{ blog.title }}</h3>
              <p class="recentCard__date">{{ formatUpdatedDate(blog.updatedAt) }}</p>
            </article>

            <p v-if="!recentPending && !recentError && recentStories.length === 0" class="blogsPage__sideState">
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

useHead({
  title: 'Blogs | The MBA Mentor',
});

const { data: blogsData, pending: blogsPending, error: blogsError } = await useFetch<BlogItem[]>(
  '/api/v1/blogs',
  {
    default: () => [],
  },
);

const { data: recentData, pending: recentPending, error: recentError } = await useFetch<BlogItem[]>(
  '/api/v1/blogs/few',
  {
    default: () => [],
  },
);

const blogs = computed(() => blogsData.value ?? []);
const recentStories = computed(() => recentData.value ?? []);

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
});

function formatUpdatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last Updated';
  return `Last Updated ${dateFormatter.format(date)}`;
}
</script>

<style scoped lang="scss">
.blogsPage {
  padding-top: clamp(1rem, 2vw, 1.6rem);
  padding-bottom: clamp(2rem, 3vw, 3rem);
}

.blogsPage__title {
  margin: 0 0 1.1rem;
  color: #020617;
  font-size: clamp(2.2rem, 4vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
}

.blogsPage__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 320px);
  gap: clamp(1rem, 1.8vw, 2rem);
  align-items: start;
}

.blogsPage__main {
  display: grid;
  gap: 1.05rem;
}

.blogsPage__state {
  margin: 0;
  border-radius: 1.25rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  padding: 1.1rem 1.2rem;
}

.storyCard {
  border-radius: 1.75rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
  padding: clamp(1rem, 2vw, 1.5rem);
  display: grid;
  gap: 1rem;
  position: relative;
  top: 0;
  transition: top 0.28s ease;
}

.storyCard:hover,
.storyCard:focus-within {
  top: -6px;
  z-index: 2;
}

.storyCard--withImage {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 400px);
  align-items: center;
}

.storyCard__content {
  display: grid;
  gap: 0.8rem;
}

.storyCard__title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 2.2vw, 2.2rem);
  line-height: 1.18;
}

.storyCard:not(.storyCard--featured) .storyCard__title {
  font-size: clamp(1.25rem, 1.8vw, 1.8rem);
}

.storyCard__description {
  margin: 0;
  color: #334155;
  font-size: clamp(1.05rem, 1.5vw, 1.5rem);
  line-height: 1.35;
}

.storyCard__date {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.2;
}

.storyCard__media {
  height: 100%;
  min-height: 230px;
}

.storyCard__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.45rem;
  display: block;
}

.blogsPage__side {
  display: grid;
  gap: 0.9rem;
}

.blogsPage__sideTitle {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.4rem, 2vw, 2rem);
}

.recentList {
  display: grid;
  gap: 0.9rem;
}

.recentCard {
  border-radius: 1.4rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
  padding: 1rem 1.1rem;
  position: relative;
  top: 0;
  transition: top 0.28s ease;
}

.recentCard:hover,
.recentCard:focus-within {
  top: -6px;
  z-index: 2;
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

.blogsPage__sideState {
  margin: 0;
  color: #334155;
}

@media (max-width: 960px) {
  .blogsPage__layout {
    grid-template-columns: 1fr;
  }

  .blogsPage__side {
    order: -1;
  }
}

@media (max-width: 820px) {
  .storyCard--withImage {
    grid-template-columns: 1fr;
  }

  .storyCard__media {
    order: -1;
    min-height: 220px;
  }
}
</style>
