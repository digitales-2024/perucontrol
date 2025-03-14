// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	image: {
		service: passthroughImageService(),
	},
	integrations: [
		starlight({
			title: 'Peru Control',
			customCss: ['./src/global.css'],
			sidebar: [
				{
					label: 'Docs',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Inicio', slug: 'docs/start' },
						{ label: 'Vista General', slug: 'docs/vista-general' },
						{ label: 'CRUD', slug: 'docs/crud' },
						{ label: 'Clientes', slug: 'docs/clientes' },
						{ label: 'Cotizacion', slug: 'docs/cotizacion' },
						{ label: 'Proyectos', slug: 'docs/proyectos' },
						{ label: 'Informes', slug: 'docs/informes' },
						{ label: 'Certificados', slug: 'docs/certificados' },
						{ label: 'Cronograma', slug: 'docs/cronograma' },
					],
				},
			],
		}),
	],
});
