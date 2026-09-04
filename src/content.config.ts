import { defineCollection } from 'astro:content';
import { z } from "astro/zod";
import { glob, file } from 'astro/loaders';

export const POSTS_PATH = "src/content/posts/";
export const PAGES_PATH = "src/content/pages/";
export const NOTES_PATH = "src/content/notes/";

// 修改博客内容时，直接编辑 src/content 下对应目录里的 Markdown 文件：
// posts 是文章，notes 是笔记，pages 是关于/近况等独立页面。
// 每个 Markdown 文件顶部的 frontmatter 必须符合下面的字段规则。

// 标签统一转成小写并去重，避免同一个标签因大小写不同产生多个入口。
function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}


const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    // 页面至少需要标题；正文写在 frontmatter 结束标记之后。
    title:   z.string(),
    updated: z.coerce.date().optional(),
    lang:    z.string().optional(),
  }),
});

// `meta` 是作者自定义的扩展字段。项目不会直接解释这些字段，只有在
// config.yaml 的 browse.indexes 中声明后，它们才会成为可浏览的维度。
const metaSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional();

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    // 文章的标题、简介和发布日期是必填项，新增文章时请不要删除它们。
    title:       z.string(),
    description: z.string(),
    published:   z.coerce.date(),
    updated:     z.coerce.date().optional(),
    category:    z.string().optional().default('Travels'),
    // 标签用于归档和浏览，大小写会自动统一；没有标签时可以删除这一行。
    tags:        z.array(z.string()).transform(removeDupsAndLowerCase).optional(),
    cover:       z.string().optional(),
    featured:    z.boolean().default(false),
    // draft 为 true 时文章不会按正常文章展示，发布前改为 false。
    draft:       z.boolean().default(false),
    lang:        z.string().optional(),
    series:      z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    meta:        metaSchema,
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    // 笔记比文章更轻量，description、category 和 tags 都可以省略。
    title:       z.string(),
    description: z.string().optional(),
    published:   z.coerce.date(),
    updated:     z.coerce.date().optional(),
    draft:       z.boolean().default(false),
    category:    z.string().optional(),
    color:       z.string().optional(),
    tags:      z.array(z.string()).transform(removeDupsAndLowerCase).optional(),
    lang:      z.string().optional(),
    meta:      metaSchema,
  }),
});

// ── 站点配置 ───────────────────────────────────────────────────────────────────
// 配置使用 YAML 文件加载，并在这里定义可接受的字段类型。
const siteConfig = defineCollection({
  loader: file('src/content/siteConfig/config.yaml'),
  schema: z.object({
    title:       z.string().optional(),
    headerTitle: z.string().optional(),
    homeTitle:   z.string().optional(),
    footerTitle: z.string().optional(),
    browserTitle: z.string().optional(),
    seoTitle:    z.string().optional(),
    rssTitle:    z.string().optional(),
    ogTitle:     z.string().optional(),
    description: z.string().optional(),
    url:         z.string().optional(),
    locale:      z.string().optional(),
    author:      z.object({
      name:    z.string(),
      bio:     z.string().optional(),
      url:     z.string().optional(),
      avatar:  z.string().optional(),
    }).optional(),
    logo:       z.string().optional(),
    ogImage:    z.string().optional(),
    navigation: z.array(z.object({
      title: z.string(),
      url:   z.string(),
    })).optional(),
    footerLinks: z.array(z.object({
      title: z.string(),
      url:   z.string(),
    })).optional(),
    social: z.array(z.object({
      title: z.string(),
      url:   z.string(),
      icon:  z.enum(['github', 'mastodon', 'twitter', 'rss', 'email']).optional(),
    })).optional(),
    heroText:       z.string().optional(),
    notebookQuote:  z.string().optional(),
    footerCredits:  z.string().optional(),
    postsPerPage:   z.number().optional(),
    recentPosts:    z.number().optional(),
    showLogo:       z.boolean().optional(),
    browse: z.object({
      years:   z.boolean().optional(),
      indexes: z.array(z.object({
        key:   z.string(),
        title: z.string(),
        slug:  z.string(),
      })).optional(),
    }).optional(),
  }),
})

export const collections = { pages, posts, notes, siteConfig };
