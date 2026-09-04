// 合并默认配置与 content/siteConfig/config.yaml 中的用户配置。
// 页面和布局统一调用这个函数，不要直接读取 site.config.ts。

import { getCollection } from 'astro:content'
import { defaultConfig } from '@/site.config'
import type { UserConfig } from '@/types'

export async function getConfig(): Promise<UserConfig> {
  const entries = await getCollection('siteConfig')
  const userConfig = entries.find(e => e.id === 'config')?.data ?? {}

  return {
    // 用户配置覆盖同名默认值，未填写的字段继续使用默认值。
    ...defaultConfig,
    ...userConfig,
    // author 需要深度合并，避免只修改 name 时丢失 bio、url 等字段。
    author: {
      ...defaultConfig.author,
      ...(userConfig.author ?? {}),
    },
  }
}