// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';

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
				Hero: './src/components/Hero.astro'
			},
			customCss: [
				'./src/styles/custom.css'
			]
		}),
	],
	markdown: {
		remarkPlugins: [remarkDefinitionList],
		remarkRehype: {
			handlers: { ...defListHastHandlers }
		}
	},
});
