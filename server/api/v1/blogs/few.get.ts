import { defineEventHandler } from 'h3';
import { normalizeImageUrl } from '~~/server/utils/image';
import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async () => {
  const blogs = await prisma.blog.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
      description: true,
      content: true,
      updatedAt: true,
    },
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
    take: 4,
  });

  return blogs.map((blog) => ({
    ...blog,
    imageUrl: normalizeImageUrl(blog.imageUrl),
  }));
});
