import { defineEventHandler } from 'h3';
import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async () => {
  return prisma.blog.findMany({
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
});
