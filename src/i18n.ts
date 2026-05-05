import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh.json'
import zhHK from './locales/zh-HK.json'
import en from './locales/en.json'

const stored = localStorage.getItem('typing-fun-lang')
// migrate old 'zh' key to 'zh-CN'
const initialLang = stored === 'zh' ? 'zh-CN' : (stored ?? 'en')

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'zh-HK': { translation: zhHK },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lang) => {
  localStorage.setItem('typing-fun-lang', lang)
})

export default i18n
