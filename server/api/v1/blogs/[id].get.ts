import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const { id }: any = event.context.params

  const blog = await prisma.blog.findFirst({
    where: { id },
    orderBy: [
      { updatedAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      description: true,
      content: true,
      updatedAt: true,
    },
  });

  return blog;
});
