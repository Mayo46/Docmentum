import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  // Avoid loading @storybook/addon-* packages: this registry resolves them to 8.x,
  // which is incompatible with storybook 9.x core and breaks the build.
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config

