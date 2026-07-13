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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImVTMVZ4OVladkd2ampfMmViMjdOVGFEQ0p0TUQyVVhRa0F3dWtHNTFrUHciLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzgzOTQ5MjQ0LCJuYmYiOjE3ODM5NDkyNDQsImV4cCI6MTc4Mzk1MzU0NSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQTU3WE5XZ21kM2FpajJMSFRQYnFPcCtnUUNqMnVMM3pjOUhZUTdGbldNcWVvYzk0ZnJYV1VDdDdvRWNxaU51UkQxdzJ5MWxtQ01XU080TEZwYjI1T2l3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJoSWIteUVDN2lrT09oMDM4eGJNakFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoidzR1LWktNVVBelUyXzM0bFFsXzlXbkhXcGVQa3NRak1kQld6c00tcGRhZ0JkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxIDI4IiwieG1zX3BmdGV4cCI6MTc4NDAzOTk0NSwieG1zX3N1Yl9mY3QiOiIzIDgiLCJ4bXNfdGNkdCI6MTc1MjU4NjEwOSwieG1zX3RudF9mY3QiOiIzIDgifQ.m4VeF9qi1lGFqZR1X2IIYP_lbYVgBavlu_iJsyxOENbbd7IuTPXaymtytPhYRN-vykW3FgRTJZM8b_iSp6DL_VoKmlGNEOj6IhJuRQNgftJO4Oi3QjXg33d75ByJxJNh9HQ3FoHp6B2l8yjae3n6Yq6EhYnHjgVZHKHPM655zwHtsbelnZheafr5FqMUxoh4HcyAXH6vdwrS1MNl7H-DNHwC7C8WICAnp39NwG_m5XfBdViuJBFR8B_8DnQ83P3tiDjIYXYu1AlC3rrqhaBv02bbvN1hfa0aFYxfr8VDKwpEJv9uXGHYK-k2xjpBoILnYGkwMfIAo8bkBH4DWiXzHg",

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

