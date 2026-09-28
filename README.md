# 轻量化笔记风格的博客
## Features

- **Content collections** for essays, notes, and standalone pages, plus a
  config-as-content `siteConfig` collection.
- **Obsidian-flavored markdown** — wikilinks (`[[Page]]`, `[[Page#Heading]]`),
  image embeds, `%%comments%%`, `==highlights==`, and `:::aside`/`:::annotation`
  directives, powered by a native [Sätteri](https://www.npmjs.com/package/satteri)
  markdown pipeline (not remark/unified).
- **Backlinks** between notes, computed from wikilinks.
- **Inline image galleries** with a lightbox (GLightbox) for consecutive
  images in a post or note.
- **A generic browse system** (`/browse`) driven entirely by an optional
  `meta` object in frontmatter and a `browse` config block — no hardcoded
  metadata keys.
- **Search** via [Pagefind](https://pagefind.app)'s native Component UI.
- **RSS and sitemap** out of the box.

## Quickstart

```sh
pnpm install
pnpm dev
```

Then:

1. Edit [src/content/siteConfig/config.yaml](src/content/siteConfig/config.yaml)
   — set your real domain (`url`), author, navigation, and social links.
2. Set the matching `site` value in [astro.config.mjs](astro.config.mjs)
   (required for RSS/sitemap to generate correct absolute URLs).
3. Add your own writing under `src/content/posts/`, `src/content/notes/`,
   and `src/content/pages/`, replacing the sample entries there.

## 如何修改博客内容

博客内容全部使用 Markdown 文件保存，不需要修改页面组件：

- 普通文章放在 `src/content/posts/`，会显示在“文章”栏目。
- 短笔记放在 `src/content/notes/`，会显示在“笔记”栏目。
- 关于、近况等独立页面放在 `src/content/pages/`。
- 网站名称、作者、导航和社交链接修改 `src/content/siteConfig/config.yaml`。

### 修改一篇文章

打开 `src/content/posts/` 中任意一个 `.md` 文件。文件顶部两个 `---` 之间是文章信息，下面是正文：

```md
---
title: 文章标题
description: 一句话介绍文章内容
published: 2026-09-04
tags: [生活, 思考]
category: 随笔
draft: false
---

这里开始写文章正文。
```

修改正文时编辑第二个 `---` 后面的内容；修改标题、日期、标签时编辑上面的信息。`title`、`description` 和 `published` 是文章必填项，日期建议使用 `YYYY-MM-DD` 格式。`draft: true` 会暂时隐藏文章，发布时改回 `false`。

### 新增文章、笔记或页面

复制同类型目录中的一个 `.md` 文件，改成新的英文文件名，再修改顶部信息和正文即可。文件名会影响网址，例如 `my-new-post.md` 通常对应 `/posts/my-new-post/`。页面文件的 `title` 必须填写；笔记的 `description` 可以省略。

旧主题目录中的文件不会自动显示在新博客里；要迁移内容，请把正文复制到 `src/content/posts/`、`src/content/notes/` 或 `src/content/pages/`，并按新文件顶部的字段格式整理。

## Commands

| Command        | Action                                                                 |
| :------------- | :---------------------------------------------------------------------|
| `pnpm install` | Install dependencies                                                  |
| `pnpm dev`     | Start the dev server at `localhost:4321`                               |
| `pnpm build`   | Build to `./dist/`, then build the Pagefind search index and copy it into `public/` |
| `pnpm preview` | Preview the production build locally                                   |
| `pnpm astro …` | Run any Astro CLI command (`astro check`, `astro add`, …)              |

## Customization

- **Fonts** — the `fonts` array in `astro.config.mjs`.
- **Colors and typography** — `src/styles/`.
- **Browse dimensions** (e.g. places, trips) — the `browse` key in
  `config.yaml`; each entry turns a `meta.<key>` frontmatter field into a
  browsable index at `/browse/<slug>`.

## Learn more

[Astro documentation](https://docs.astro.build)
