// src/plugins/vuetify.js

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 🎨 MudTech Theme
const mudTechTheme = {
  dark: true,
  colors: {
    background: '#1b130d',
    surface: '#261d16',
    primary: '#ffcc00',
    primaryBtn: '#42d392',
    secondary: '#ff8800',
    accent: '#ffc83d',
    cardBg: '#33251d',
    text: '#fff4d7',
  },
}

export const vuetify = createVuetify({
  components,
  directives,
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
