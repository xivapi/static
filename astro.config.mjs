// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
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
});
