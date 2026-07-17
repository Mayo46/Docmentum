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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjFMc0JqUzBkZ2NCcVlRTjdfYU5jV0VnM2tDdnBLYlU4QTRnZ0FsYXptMGsiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0MzA1NjkzLCJuYmYiOjE3ODQzMDU2OTMsImV4cCI6MTc4NDMxMTI4MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQXlqQlBLaWlLeFg5K0w1cEJXUGd2WENVRzlCM290b1NyVG1kdmkyWU4wcjhqcFJ4K2dUYlhQbzNCaUlWQlFpWEQ5WkNJeWwvTUVYY1JxYTZXMUF5aEF3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJnS3pJUzcxNGprV3hoLXFrdE5XdkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiRE4tRmNESy1TWTlvTXZzMHgyU09oZFpia2RiRVVrTUZkcGhxcFRvVDRhb0JkWE4zWlhOME15MWtjMjF6IiwieG1zX2lkcmVsIjoiMSAxOCIsInhtc19wZnRleHAiOjE3ODQzOTc2ODEsInhtc19zdWJfZmN0IjoiMyAxMiIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjE4IDMifQ.K1_i16ai7Ot-cjx7eSoaOSYlmqXvsGHrz_19zhGQqdPGWoE4mU-T__TfRQYOxKJDe8BkxSAq0ZYLfYiZMBaJul3xaCwvGikC6fKwEWJA4Tvkggxw76p7U15Sr0_ZNjP4__FGf3MZeE6iPs4ortBcgtFVT35os2LqfVikc9tqje8xXnc1bFyZxC5tj7IUj-KF7We8KhPXNFb0zm_-pQ8yCtbiRK0K_rg4NwSow9DwEdjFlQJ5nAh5si0VdGp_9w7I-LCGtzWu8q8GqcT--NzW7CKMBQqsZgMmleQaNVDfJRL5GF6P9ECuJaAIsOVbnvG5DeirT39g-R_IE7drNwC6zA",

    // siteUrl: "https://genre.sharepoint.com/sites/G2Applications-DEV/FormsLibrary",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",

    // listName: "Documents",
    listName: "G2IndexingUnderwriting",

    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "MubashirTest",

    // Upload now derives the authenticated user from token claims.
    actions: {
      editProperties: true,
      checkout: true,
      cancelCheckout: true,
      delete: true,
      export: true,
      copyUrl: true,
      addToFavorites: true,
    },

    columns: `CheckedOut,
    ClaimsG2,
    CheckoutUser,
    CheckedOutDate,
    DateReceived,
    Name,
    CheckedOutMachineName,
    ClaimID,
    ContractID,
    Company,
    Modified,
    Created,
    CreatedBy,
    SubCategory,
    Category,
    Recipient,
    BatchID,
    IndexOperator
  `,
    showToolbar: true,
    showActions: false,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Checkout Documents",

    editableProperties: {
      "Title": "",
      "ContentType": "",
      "Queue": ""
    },

  }
}
