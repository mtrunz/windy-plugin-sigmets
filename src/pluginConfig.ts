import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-sigmets',
    version: '0.1.0',
    icon: '🔌',
    title: 'Aviationweather.gov SIGMETs',
    description: 'Aviationweather.gov SIGMETs.',
    author: 'Mario Trunz (Digital Aviation Studio)',
    repository: 'https://github.com/Digital-Aviation-Studio/windy-plugin-sigmets',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/sigmets',
};

export default config;
