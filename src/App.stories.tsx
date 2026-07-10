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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkoxTE00Q3paZDQ0em5EaGt4b3BYSVRJWGVONmI0aEkyYVVlckVid19IX28iLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzgzNjkyMjc1LCJuYmYiOjE3ODM2OTIyNzUsImV4cCI6MTc4MzY5NjgyMiwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQWd5d1lWNzVkRldFYzNHMjcxeWx0bmU5emk1ZGIzNUVjYVpkNzNNWE9rbStCUTRBd0xXd2RGb0FxQ0xDQitQNHBCdDcwemM0cGR0Syt4RU9KaXNUQzJ3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJtaHMtRG9xbkdrdURGUlVpMFg0b0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoicG1oUkNxZUQtN3NkMF9DYXNDcXFCaFlvVURqdkwyajM3NHlXc19LcWRFa0JkWE56YjNWMGFDMWtjMjF6IiwieG1zX2lkcmVsIjoiNiAxIiwieG1zX3BmdGV4cCI6MTc4Mzc4MzIyMiwieG1zX3N1Yl9mY3QiOiIzIDEwIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMjAgMyJ9.gPY1vENhKhFKmMX62wKUlkH2T-T_QO16Ujc_n8N8BlLPC98SuOp5j_ChKc7hXz0jm6BfTxWcEQdJKieKbvBlen6l3qM2rwFpBonuG9DW40HhhfUqjY2Cgo3mjp5gTBtRe95CZFKQfDlDyjXdzeiff2mk_aIgKRv14Qpgixp40hHDun5mrWSqOMbzF4DhBNlPnWEPMq32U9L-B-g1ok3D7B2NUZS-lenWaX7P2AoQtbw09c6A4pVe6h1O70Mpz8XHXdROkDeLhgnle_henz7twzototi4PIL7m35ggN_yNPXuIFXjz0vMJiaDIx6I786DFpPkSqUEkeUbR9J-RK5Gsg",

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
    showRowCheckbox: false,

    editableProperties: {
      "Title": "",
      "ContentType": "",
      "Queue": ""
    },

  }
}

