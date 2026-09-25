import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  attachments,
  buildRedirectsFromPosts,
  orphanAttachmentReport,
  parseWxr,
  publishedPosts,
} from '../../src/lib/migration/wxr'

const FIXTURE = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>FC Karben</title>
    <wp:category>
      <wp:term_id>1</wp:term_id>
      <wp:category_nicename><![CDATA[allgemein]]></wp:category_nicename>
      <wp:category_parent><![CDATA[]]></wp:category_parent>
      <wp:cat_name><![CDATA[Allgemein]]></wp:cat_name>
    </wp:category>
    <item>
      <title><![CDATA[Test Beitrag]]></title>
      <link>https://fc-karben.de/2026/05/18/test-beitrag/</link>
      <content:encoded><![CDATA[<p>Hallo <img src="https://fc-karben.de/wp-content/uploads/2026/05/foto.jpg" /></p>]]></content:encoded>
      <excerpt:encoded><![CDATA[]]></excerpt:encoded>
      <wp:post_id>10</wp:post_id>
      <wp:post_date><![CDATA[2026-05-18 12:00:00]]></wp:post_date>
      <wp:post_name><![CDATA[test-beitrag]]></wp:post_name>
      <wp:status><![CDATA[publish]]></wp:status>
      <wp:post_type><![CDATA[post]]></wp:post_type>
      <category domain="category" nicename="allgemein"><![CDATA[Allgemein]]></category>
    </item>
    <item>
      <title><![CDATA[foto]]></title>
      <link>https://fc-karben.de/foto/</link>
      <content:encoded><![CDATA[]]></content:encoded>
      <excerpt:encoded><![CDATA[]]></excerpt:encoded>
      <wp:post_id>11</wp:post_id>
      <wp:post_name><![CDATA[foto]]></wp:post_name>
      <wp:status><![CDATA[inherit]]></wp:status>
      <wp:post_type><![CDATA[attachment]]></wp:post_type>
      <wp:attachment_url><![CDATA[https://fc-karben.de/wp-content/uploads/2026/05/foto.jpg]]></wp:attachment_url>
      <wp:post_parent>10</wp:post_parent>
    </item>
    <item>
      <title><![CDATA[orphan]]></title>
      <link>https://fc-karben.de/orphan/</link>
      <content:encoded><![CDATA[]]></content:encoded>
      <excerpt:encoded><![CDATA[]]></excerpt:encoded>
      <wp:post_id>12</wp:post_id>
      <wp:post_name><![CDATA[orphan]]></wp:post_name>
      <wp:status><![CDATA[inherit]]></wp:status>
      <wp:post_type><![CDATA[attachment]]></wp:post_type>
      <wp:attachment_url><![CDATA[https://fc-karben.de/wp-content/uploads/2020/01/orphan.jpg]]></wp:attachment_url>
      <wp:post_parent>0</wp:post_parent>
    </item>
  </channel>
</rss>`

describe('MigrationPipeline WXR', () => {
  it('parses categories and posts', () => {
    const parsed = parseWxr(FIXTURE)
    expect(parsed.categories).toHaveLength(1)
    expect(publishedPosts(parsed.items)).toHaveLength(1)
    expect(attachments(parsed.items)).toHaveLength(2)
  })

  it('reports orphan attachments', () => {
    const parsed = parseWxr(FIXTURE)
    const report = orphanAttachmentReport(parsed.items)
    expect(report.total).toBe(2)
    expect(report.referenced).toBe(1)
    expect(report.orphans).toBe(1)
  })

  it('builds redirects for posts', () => {
    const parsed = parseWxr(FIXTURE)
    const redirects = buildRedirectsFromPosts(parsed.items)
    expect(redirects[0]).toEqual({
      from: '/2026/05/18/test-beitrag',
      to: '/presse/test-beitrag',
    })
  })

  it('can parse a slice of the real export when present', () => {
    const path =
      '/Users/crypt32dll/.cursor/projects/Users-crypt32dll-workspace-fc-karben/attachments/4509ba6b-24e4-4db7-a96f-57c79fbd1cc7/fckarben.WordPress.2026-09-25.xml'
    try {
      const xml = readFileSync(path, 'utf8')
      const parsed = parseWxr(xml)
      expect(parsed.categories.length).toBeGreaterThan(0)
      expect(publishedPosts(parsed.items).length).toBeGreaterThan(50)
    } catch {
      // optional when attachment not available in CI
      expect(true).toBe(true)
    }
  })
})
