import '@mdi/font/css/materialdesignicons.min.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import {
  VApp,
  VBtn,
  VCard,
  VCardText,
  VChip,
  VDialog,
  VIcon,
  VMain,
  VProgressCircular,
  VSelect,
  VSlideYTransition,
  VTextField,
} from 'vuetify/components'

const components = {
  VApp,
  VBtn,
  VCard,
  VCardText,
  VChip,
  VDialog,
  VIcon,
  VMain,
  VProgressCircular,
  VSelect,
  VSlideYTransition,
  VTextField,
}

const mudTechTheme = {
  dark: true,
  colors: {
    background: '#34373D',
    surface: '#34373D',
    primary: '#D83C13',
    secondary: '#BFC3C7',
    accent: '#D83C13',
    'on-primary': '#FFFFFF',
    'on-secondary': '#34373D',
    'on-surface': '#FFFFFF',
  },
}

export const vuetify = createVuetify({
  components,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },

  theme: {
    defaultTheme: 'mudTech',
    themes: {
      mudTech: mudTechTheme,
    },
  },
})
