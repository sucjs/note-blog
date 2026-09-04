import { getCollection, type CollectionEntry } from "astro:content";
import { getAssetPath } from "./url";
import { slugify } from "./text";

import { POSTS_PATH, PAGES_PATH, NOTES_PATH } from "../content.config";
export type Post = CollectionEntry<"posts">;
export type Page = CollectionEntry<"pages">;
export type Note = CollectionEntry<"notes">;

export type AnyEntry = {
  id: string;
  published: Date;
  title: string;
  href: string;
  collection: 'posts' | 'notes';
  category?: string;
  tags?: string[];
  color?: string;
};

export type AnyCollectionEntry = Post | Note;

let postsCache: Post[] | null = null;
let pagesCache: Page[] | null = null;
let notesCache: Note[] | null = null;

function isVisiblePost(post: Post): boolean {
  // 开发环境展示全部文章，方便预览草稿和未来日期的内容。
  if (import.meta.env.DEV) {
    return true;
  }

  const isDraft = post.data.draft;

  const isFuturePost =
    new Date(post.data.published).getTime() >
    Date.now();

  return !isDraft && !isFuturePost;
}

function sortPosts(posts: Post[]): Post[] {
  return posts.sort((a, b) => {
    const aDate = new Date(
      a.data.updated ?? a.data.published
    ).getTime();

    const bDate = new Date(
      b.data.updated ?? b.data.published
    ).getTime();

    return bDate - aDate;
  });
}

export async function getAllPosts(): Promise<Post[]> {
  if (postsCache) {
    return postsCache;
  }

  // 生产环境会在这里过滤草稿和发布日期尚未到达的文章。
  const posts = await getCollection(
    "posts",
    isVisiblePost
  );

  postsCache = sortPosts(posts);

  return postsCache;
}

// ── Pages ──────────────────────────────────────────────────────────────────────

function sortPages(pages: Page[]): Page[] {
  return pages.sort((a, b) => {
    const aDate = new Date(a.data.updated ?? 0).getTime();
    const bDate = new Date(b.data.updated ?? 0).getTime();
    return bDate - aDate;
  });
}

export async function getAllPages(): Promise<Page[]> {
  if (pagesCache) {
    return pagesCache;
  }

  const pages = await getCollection("pages");

  pagesCache = sortPages(pages);

  return pagesCache;
}

// ── Notes ──────────────────────────────────────────────────────────────────────

function isVisibleNote(note: Note): boolean {
  if (import.meta.env.DEV) {
    return true;
  }

  const isFutureNote =
    new Date(note.data.published).getTime() > Date.now();

  return !isFutureNote;
}

function sortNotes(notes: Note[]): Note[] {
  return notes.sort((a, b) => {
    const aDate = new Date(
      a.data.updated ?? a.data.published
    ).getTime();

    const bDate = new Date(
      b.data.updated ?? b.data.published
    ).getTime();

    return bDate - aDate;
  });
}

export async function getAllNotes(): Promise<Note[]> {
  if (notesCache) {
    return notesCache;
  }

  const notes = await getCollection("notes", isVisibleNote);

  notesCache = sortNotes(notes);

  return notesCache;
}

/** 组合文章和笔记，按发布日期倒序，供归档和浏览页复用。 */
export async function getAllEntries(): Promise<(Post | Note)[]> {
  const [posts, notes] = await Promise.all([getAllPosts(), getAllNotes()]);

  return [...posts, ...notes].sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
  );
}

/** 移除隐藏目录，并把文章文件路径转换成规范化的 URL 目录片段。 */
export function getPostPathSegments(
  filePath?: string
): string[] {
  if (!filePath) {
    return [];
  }

  return filePath
    .replace(POSTS_PATH, "")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("_"))
    .slice(0, -1)
    .map(slugify);
}

/** 从 Astro 内容 ID 中取得最后一段 slug。 */
export function getPostSlugSegment(id: string): string {
  const segments = id.split("/");

  return segments.at(-1) ?? id;
}

/** 根据文章所在目录生成嵌套 slug，例如 travel/japan/tokyo。 */
export function getPostSlugPath(
  id: string,
  filePath?: string
): string {
  const segments = getPostPathSegments(filePath);

  const slug =
    slugify(getPostSlugSegment(id));

  return segments.length > 0
    ? [...segments, slug].join("/")
    : slug;
}

/** 生成 getStaticPaths() 使用的路由参数，并补上开头的斜杠。 */
export function getPostSlug(
  id: string,
  filePath?: string
): string {
  return `/${getPostSlugPath(id, filePath)}`;
}

export function getPagePathSegments(
  filePath?: string
): string[] {
  if (!filePath) {
    return [];
  }

  return filePath
    .replace(PAGES_PATH, "")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("_"))
    .slice(0, -1)
    .map(slugify);
}

export function getPageSlugPath(
  id: string,
  filePath?: string
): string {
  const segments = getPagePathSegments(filePath);
  const slug = slugify(getPostSlugSegment(id));

  return segments.length > 0
    ? [...segments, slug].join("/")
    : slug;
}

export function getPageSlug(
  id: string,
  filePath?: string
): string {
  return `/${getPageSlugPath(id, filePath)}`;
}

/** 生成页面 URL；普通页面直接挂在站点根路径下，不带 /pages 前缀。 */
export function getPageUrl(
  id: string,
  filePath?: string
): string {
  return getAssetPath(getPageSlugPath(id, filePath));
}

/** 生成文章完整 URL，文章统一挂在 /posts 下。 */
export function getPostUrl(
  id: string,
  filePath?: string
): string {
  return getAssetPath(
    `posts/${getPostSlugPath(id, filePath)}`
  );
}

/** 对笔记文件路径执行与文章相同的隐藏目录过滤和 slug 规范化。 */
export function getNotePathSegments(
  filePath?: string
): string[] {
  if (!filePath) {
    return [];
  }

  return filePath
    .replace(NOTES_PATH, "")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("_"))
    .slice(0, -1)
    .map(slugify);
}

/** 根据笔记文件结构生成嵌套 slug。 */
export function getNoteSlugPath(
  id: string,
  filePath?: string
): string {
  const segments = getNotePathSegments(filePath);
  const slug = slugify(getPostSlugSegment(id));

  return segments.length > 0
    ? [...segments, slug].join("/")
    : slug;
}

/**
 * Route param slug used in getStaticPaths() for notes.
 *
 * Example:
 * "/tech/self-hosting"
 */
export function getNoteSlug(
  id: string,
  filePath?: string
): string {
  return `/${getNoteSlugPath(id, filePath)}`;
}

/**
 * Full note URL.
 *
 * Example:
 * "/notes/tech/self-hosting"
 */
export function getNoteUrl(
  id: string,
  filePath?: string
): string {
  return getAssetPath(
    `notes/${getNoteSlugPath(id, filePath)}`
  );
}

export async function buildBacklinkMap(): Promise<Map<string, { title: string; slug: string }[]>> {
  const notes = await getAllNotes();
  const map = new Map<string, { title: string; slug: string }[]>();

  for (const note of notes) {
    const body = note.body ?? '';
    const noteSlug = getNoteSlugPath(note.id, note.filePath);
    const entry = { title: note.data.title, slug: noteSlug };

    // wikilinks: [[Target]], [[Target|Alias]], [[Target#Heading]] — key by the
    // same slug wikilinkResolver (src/plugins/satteri.ts) resolves the target to.
    for (const match of body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
      const target = match[1].split('#')[0].trim();
      if (!target) continue;
      const key = slugify(target);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }

    // markdown links: [text](/notes/slug)
    for (const match of body.matchAll(/\[([^\]]+)\]\(\/notes\/([^)#]+)/g)) {
      const key = match[2];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
  }

  return map;
}

export async function getSeriesArticles(series: string) {
  const posts = await getAllPosts();
  return posts
    .filter(p => p.data.series === series)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

// ── Grouping ───────────────────────────────────────────────────────────────────

export function getPostsGroupedByYear(
  entries: Post[]
): [string, Post[]][] {
  const grouped = entries.reduce<Record<string, Post[]>>((acc, entry) => {
    const year = entry.data.published.getFullYear().toString();
    (acc[year] ??= []).push(entry);
    return acc;
  }, {});

  for (const year in grouped) {
    grouped[year].sort(
      (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
    );
  }

  return Object.entries(grouped).sort(
    ([a], [b]) => Number(b) - Number(a)
  );
}

export function getNotesGroupedByYear(
  entries: Note[]
): [string, Note[]][] {
  const grouped = entries.reduce<Record<string, Note[]>>((acc, entry) => {
    const year = entry.data.published.getFullYear().toString();
    (acc[year] ??= []).push(entry);
    return acc;
  }, {});

  for (const year in grouped) {
    grouped[year].sort(
      (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
    );
  }

  return Object.entries(grouped).sort(
    ([a], [b]) => Number(b) - Number(a)
  );
}
