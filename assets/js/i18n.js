import { createI18n } from 'vue-i18n'
import enLocale from 'element-plus/lib/locale/lang/en'
import zhLocale from 'element-plus/lib/locale/lang/zh-cn'
const i18n = createI18n({
  locale: zhLocale.name,
  fallbackLocale: enLocale.name,
  messages: {
    [enLocale.name]: {
      // el 这个属性很关键，一定要保证有这个属性，
      el: enLocale.el,
      // 定义您自己的字典，但是请不要和 `el` 重复，这样会导致 ElementPlus 内部组件的翻译失效.
      message: {
        hello: 'hello world',
      },
    },
    [zhLocale.name]: {
      el: zhLocale.el,
      // 定义您自己的字典，但是请不要和 `el` 重复，这样会导致 ElementPlus 内部组件的翻译失效.
      message: {
        hello: '你好，世界',
      },
    },
  },
})
export default i18n
