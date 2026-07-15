import type { Meta, StoryObj } from '@storybook/react'
import DocumentWrapper from './components/DocumentWrapper'

const meta: Meta<typeof DocumentWrapper> = {
  title: 'App',
  component: DocumentWrapper,
  argTypes: {
    documentSetName: {
      control: { type: 'text' },
    },
  },
}

export default meta

type Story = StoryObj<typeof DocumentWrapper>

export const Default: Story = {
  args: {
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6InpSUXdRREs4azM5NlVTUUttRHJBUDhLUjBqYV95MVJ1R21rVmI0MklaRjgiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzgzOTYxNTQ0LCJuYmYiOjE3ODM5NjE1NDQsImV4cCI6MTc4Mzk2NjMzMSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQWkreDUrR0M1eUt5WksvNm1GYW85VGR5ZDJVKzNwbXBWTFEvZ09uRnVZbXQyUVRNZGFlSm1LVzBhcXo3R0cyVm1Fc0R1dmRBZzRZOTFWbkdYYjZsZHNnPT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJKSVVjVDZZdlNrMko2amVDNmxNRUFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiUDZ3NXVEVkNpeTRnQlpXMXhOV2xWWlU5Y010Vzg4M2lMdEY3VnZrcjdWa0JkWE56YjNWMGFDMWtjMjF6IiwieG1zX2lkcmVsIjoiMjAgMSIsInhtc19wZnRleHAiOjE3ODQwNTI3MzEsInhtc19zdWJfZmN0IjoiMyAxNiIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjggMyJ9.ToaMahKzBA4SyOVLP41P1SK7hKcJ1MrO_FPPow639Obe8-uXt-ywjlZyhJ747RmBahMjmHmVbxZgyX80Z8vYKd5hKR78mmz9AUbssM69DzuH27s8Go7Fog0kL1k7NlxN3VZMiTiMFI8wXvUVKZ6emdJFN33Sq_RQo7Ak7fl5YDIcWxBxDftO_DMEKD4tZSdnX2ueYrbVcIiVAVgjvR7uDyvMVhqvCTID8i8SyaEE16vPsDRTd6C0Tivfon_OhS1wYjysjX4Pr_5eomnpcobUCl3uYNCNu-P8q_nUo4SPTj3WbIdeUbozsxXLIeW0xsOo0N5dy38K5-u9Ff6dVVlYig",

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

    showActions: false,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,

    editableProperties: {
      "Title": "",
      "ContentType": "",
      "Queue": ""
    },

  }
}
