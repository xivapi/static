// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeWidont from 'rehype-widont';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'xivapi',
			favicon: '/favicon.ico',
			logo: {
				light: './src/assets/logo-light.png',
				dark: './src/assets/logo-dark.png',
				replacesTitle: true,
			},
			social: {
				discord: 'https://discord.gg/MFFVHWC',
				github: 'https://github.com/xivapi',
			},
			sidebar: [
				'docs/welcome',
				{
					label: 'Guides',
					autogenerate: { directory: 'docs/guides' },
				},
				'docs/software',
				{
					label: 'API Reference',
					link: '/api/1/docs',
					attrs: { target: '_blank' },
				}
			],
			components: {
				Hero: './src/components/Hero.astro',
				MarkdownContent: './src/components/MarkdownContent.astro',
			},
			customCss: [
				'./src/styles/headings.css',
				'./src/styles/icons.css',
				'./src/styles/theme.css',
			],
			plugins: [starlightLinksValidator({
				exclude: ['/api/1/**']
			})],
		}),
	],
	markdown: {
		remarkPlugins: [remarkDefinitionList],
		rehypePlugins: [
			rehypeHeadingIds,
			[rehypeAutolinkHeadings, { behavior: 'wrap' }],
			rehypeWidont
		],
		remarkRehype: {
			handlers: { ...defListHastHandlers },
		},
	},
});
