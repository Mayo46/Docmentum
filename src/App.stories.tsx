import type { Meta, StoryObj } from '@storybook/react'
import DocumentLibraryPlayground from './components/DocumentLibraryPlayground'

const meta: Meta<typeof DocumentLibraryPlayground> = {
  title: 'App',
  component: DocumentLibraryPlayground,
  argTypes: {
    documentSetName: {
      control: { type: 'text' },
    },
  },
}

export default meta

type Story = StoryObj<typeof DocumentLibraryPlayground>

export const Default: Story = {
  args: {
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6Im14NFdzdXl6V1Rmc3MwQjRFekhDY0xGQkNFS0M1REdhLWdHQm1JREsxUlUiLCJhbGciOiJSUzI1NiIsIng1dCI6IndoMDZzRWt6TEhKNXNOTmFVeVJZMl82TzhLMCIsImtpZCI6IndoMDZzRWt6TEhKNXNOTmFVeVJZMl82TzhLMCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzgwMzIzMjA5LCJuYmYiOjE3ODAzMjMyMDksImV4cCI6MTc4MDMyODExOCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiXSwiYWlvIjoiQVVRQXUvOGNBQUFBRWNkckx2Qll6ZDQ1dHlsQVMzbmpuZkVCdFJqSTEyY0UyZGc3NzRSdlpyU29RZlJKeFZVY2oyWitTOEdFUEdXa1d5WHZ0dWVBWW53QlU4dEJ6a1ltZHc9PSIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJkZXZpY2VpZCI6ImNhNmE5ZmE3LWJlN2UtNGM1MC04ODFhLTU5ZGI4MmJkMGNhYiIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjUyLjE1MS4yMjguMTE0IiwibmFtZSI6Ik11YmFzaGlyIEFsdGFmIiwib2lkIjoiZWY1OGMzZTEtMjEwMS00NzgyLWIzY2YtZDlhYWQ4MGMzZDFhIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA0RTFDNDZDM0EiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUFBQUtWakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCIsInNpZCI6IjAwNDEyZjlhLWZmNjUtNWZhOS0wMzA0LWFhYmYwNGMzMTI4NyIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6Ino2UHZEY1hLaXVPSWU4Y2J3N0VDd0pKTVhBMHlBb25zVUV2QWpvMEQ2cTgiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkiLCJ1bmlxdWVfbmFtZSI6Im11YmFzaGlyLmFsdGFmQGdlbnN0YXJnZW5lc2lzLm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6Im11YmFzaGlyLmFsdGFmQGdlbnN0YXJnZW5lc2lzLm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6IlVEeFotNlRYaFVPazh6Smo5Q1l0QUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfYWNkIjoxNzYxOTA0OTk0LCJ4bXNfYWN0X2ZjdCI6IjMgOSIsInhtc19mdGQiOiJUTzl5MVd5U0dBazBsTzdTNTdhTUhMNVFCM00wTk9taU45YTVPc3o1Q0JnQmRYTmxZWE4wTFdSemJYTSIsInhtc19pZHJlbCI6IjE4IDEiLCJ4bXNfcGZ0ZXhwIjoxNzgwNDE0NTE4LCJ4bXNfc3ViX2ZjdCI6IjMgMTAiLCJ4bXNfdGNkdCI6MTc1MjU4NjEwOSwieG1zX3RudF9mY3QiOiI0IDMifQ.OqHxtryeQTcLuleohX5KS51YsbHFh2D_tUJvIDihjUW6fF8kyKfu2kg3BxO8sKz_6XIG4R875ousiuiE1Z8vlxsPYOOZbJeuvqjvD__w83T2m0kLeH6KcNv3-KtDHsGFxrND-DMaQtOJwLVIupZRN8gstGhCmgQ9AQxPRaBabYIFlATPGEEp3bGkpz9Gs8WJLlxacf55xxhDkruHCjpQYXaaPW3gth9MDj2Sd0vsgUxl8k3-adIOzG7Uhznw5gfy5FQpQFUfEI-SdzW0nosm7ChikuHJqtEFeQR15DUZ0rmd8Z1XPzR9rZj8_kt3zhIwhkWiJud7UaBWMYx04PQt2A",

    // siteUrl: "https://genre.sharepoint.com/sites/G2Applications-DEV/FormsLibrary",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",

    // listName: "Documents",
    listName: "G2IndexingUnderwriting",
    contentTypesLibrary: "ContentTypesLibraryTest",

    documentSetName: "MubashirTest",

    // Upload now derives the authenticated user from token claims.

    columns: {
      "Title": "",
      "ContentType": "",
      "CreatedBy": ""
    },

    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,

    editableProperties: {
      "Title": "",
      "ContentType": "",
      "Queue": ""
    },
  }
}

