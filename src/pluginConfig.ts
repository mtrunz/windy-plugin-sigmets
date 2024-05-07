import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-sigmets',
    version: '0.2.0',
    icon: '🔌',
    title: 'Aviationweather.gov SIGMETs',
    description: 'Aviationweather.gov SIGMETs.',
    author: 'Mario Trunz',
    repository: 'https://github.com/mtrunz/windy-plugin-sigmets',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/sigmets',
};

export default config;
