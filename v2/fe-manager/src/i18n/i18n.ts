import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viCommon from './locales/vi/common.json';
import viManager from './locales/vi/manager.json';
import viFinance from './locales/vi/finance.json';
import viSetup from './locales/vi/setup.json';
import enCommon from './locales/en/common.json';
import enManager from './locales/en/manager.json';
import enFinance from './locales/en/finance.json';
import enSetup from './locales/en/setup.json';

i18n.use(initReactI18next).init({
  resources: {
    vi: { common: viCommon, manager: viManager, finance: viFinance, setup: viSetup },
    en: { common: enCommon, manager: enManager, finance: enFinance, setup: enSetup },
  },
  lng: (() => { try { return localStorage.getItem('lang') || 'vi'; } catch { return 'vi'; } })(),
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

export default i18n;
