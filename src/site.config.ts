import type { UserConfig } from './types'

export const defaultConfig: UserConfig = {
  title:       '清梁的博客',
  description: '记录技术、生活与思考的个人博客。',
  url:         'https://qingliang.dpdns.org',
  locale:      'zh-CN',

  author: {
    name: '清梁',
  },

  navigation: [
    { title: '文章', url: '/posts' },
    { title: '笔记', url: '/notes' },
    { title: '归档', url: '/archive' },
    { title: '关于', url: '/about' },
  ],

  footerLinks: [
    { title: 'Github', url: 'https://github.com/sucjs' },
    { title: '云盘', url: '/colophon' },
    { title: 'RSS',  url: '/rss.xml' },
  ],

  social: [],

  heroText:     '记录技术、生活与思考。',
  tagline:      '坚持不是凡蛊，因为坚持本就不凡',
  postsPerPage: 10,
  recentPosts:  5,
  showLogo:     false,

  // Generic, no assumed keys — real indexes are configured per-site (see config.yaml).
  browse: {
    years:   true,
    indexes: [],
  },
}