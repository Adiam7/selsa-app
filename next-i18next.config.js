export const i18n = {
	defaultLocale: 'en',
	locales: ['en', 'ti'],
	localeDetection: true,
};

const nextI18NextConfig = {
	i18n,
	reloadOnPrerender: process.env.NODE_ENV === 'development',
};

export default nextI18NextConfig;
