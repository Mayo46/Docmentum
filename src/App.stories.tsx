import type { Meta, StoryObj } from '@storybook/react'
import DocumentLibraryPlayground from './documentLibrary/DocumentLibraryPlayground'

const meta: Meta<typeof DocumentLibraryPlayground> = {
  title: 'App',
  component: DocumentLibraryPlayground,
}

export default meta

type Story = StoryObj<typeof DocumentLibraryPlayground>

export const Default: Story = {}

