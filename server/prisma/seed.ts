import { PrismaClient, ContentStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { createDefaultCmsContent } from "../../src/shared/mockData";

const prisma = new PrismaClient();
const defaultCatalogSettings = { hiddenLevel1: [], hiddenLevel2: [] };

function asJson<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}

async function main() {
  const content = createDefaultCmsContent();
  const login = process.env.ADMIN_LOGIN ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  await prisma.user.upsert({
    where: { login },
    create: {
      login,
      passwordHash: await hash(password, 10),
      role: "ADMIN",
    },
    update: {},
  });

  await prisma.homeContent.upsert({
    where: { id: "home" },
    create: {
      id: "home",
      draftContent: asJson({
        homeFeatures: content.homeFeatures,
        homeCards: content.homeCards,
      }),
      publishedContent: asJson({
        homeFeatures: content.homeFeatures,
        homeCards: content.homeCards,
      }),
      publishedAt: new Date(),
    },
    update: {},
  });

  for (const page of Object.values(content.pages)) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        draftContent: asJson(page),
        publishedContent: asJson(page),
        publishedAt: new Date(),
      },
      update: {},
    });
  }

  for (const [index, post] of content.blogPosts.entries()) {
    await prisma.blogPost.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        slug: post.slug,
        draftContent: asJson(post),
        publishedContent: asJson(post),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdAt: new Date(Date.now() + index),
      },
      update: {},
    });
  }

  for (const [index, item] of content.galleryImages.entries()) {
    await prisma.galleryImage.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        draftContent: asJson(item),
        publishedContent: asJson(item),
        sortOrder: index,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      update: {},
    });
  }

  for (const [index, item] of content.documents.entries()) {
    await prisma.documentItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        draftContent: asJson(item),
        publishedContent: asJson(item),
        sortOrder: index,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      update: {},
    });
  }

  await prisma.contactInfo.upsert({
    where: { id: "contacts" },
    create: {
      id: "contacts",
      draftContent: asJson(content.contacts),
      publishedContent: asJson(content.contacts),
      publishedAt: new Date(),
    },
    update: {},
  });

  await prisma.catalogSettings.upsert({
    where: { id: "catalog" },
    create: {
      id: "catalog",
      draftContent: asJson(defaultCatalogSettings),
      publishedContent: asJson(defaultCatalogSettings),
      publishedAt: new Date(),
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
