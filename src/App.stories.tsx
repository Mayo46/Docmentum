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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6IktXUFBRbEZpMmduWURvbGhiaDFKTDlnUWdyUy1ZRGpZVjRVRURtZ2FaZlUiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0Mjg3NTA1LCJuYmYiOjE3ODQyODc1MDUsImV4cCI6MTc4NDI5MzE3OCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQWpDQTB6c3J4cTRHMXFxM0NwdFZvcUxHb0VkVU9JclVTSFRRRHR2eWhDb2FET0ErUjZkSEE0YW16TkJLeVlMeFNkRVVZV0NiVzE4SW1xb0NrZEgrdWFnPT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJUWllGN1dEVkxFaWdtcHRHQWtCX0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiN19WZUY0MzBlRDNtNlJ4b0VtcXJhaUdpcVdiRHFES3hwZ2VpcThfc1htWUJkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxIDE0IiwieG1zX3BmdGV4cCI6MTc4NDM3OTU3OCwieG1zX3N1Yl9mY3QiOiIzIDgiLCJ4bXNfdGNkdCI6MTc1MjU4NjEwOSwieG1zX3RudF9mY3QiOiIzIDYifQ.dU24erzlICcvYUv1FXGeDB0aVqLGz5xhgYzoA4ZbN3sKG3KIWn-oSvjy0EfPo2zv4IkcIeEWJ8agGL8bkZPNfPUDoECcJqI8ReemslWqI71rRSFJ2tJcHYq83dEWeSl2-JKH2nnyOwbR8YgybwCky8QWjC80zPhrna5c516qTl-z_kkbeLHRqe0Lm4AjoEc3S8bxSHGHSAzGZV4ohilCzWuLo__AKUVhDuaRJdRQGJ2E2Cr3LWf5NENo6-3qoP5tS_d7iDl3OvwZh4Qu2V7JejZB8haHAB5eq-Ll1vtsRUuX9Y2OI0t6DKvS4GPlutjGqTeSArDSHtr-r07vDPjPdA",

    // siteUrl: "https://genre.sharepoint.com/sites/G2Applications-DEV/FormsLibrary",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",

    // listName: "Documents",
    listName: "G2IndexingUnderwriting",

    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "MubashirTest",

    // Upload now derives the authenticated user from token claims.
    showHamburger: true,
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
