import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import DocumentWrapper from './components/DocumentWrapper'


const graphToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjVEd3ZtZnktenhQNHNzRFlMbTByUlR1cXhkcjZndHdqVWVGWWdrUkRtZUkiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg1MjMyMjgxLCJuYmYiOjE3ODUyMzIyODEsImV4cCI6MTc4NTIzNjgyMCwiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQUl3TEdNY2JYMWliNDNvM2trd05TY0JoQzFWbkNjRGxJRnFDWDNRS3ZjY3hYSTBUdFdUM3ZyZkNtS1VyNXlUcnJmbGtSWVp3T0xMdHFUcUZYZVFuaTBOWmFxa0Y5L3gwdHZFeFpYbzQvMWp3THpkZ2EyMzN5TWUydkhJeld0WGJiRGxNcHdmeCt5NU10dlNsZ3ZJdVZaL016OStmNlRzL0JtaEh3Nkdtb3krUFJ0MmZQQ0dEVGhkRVF2a1hnVThKYiIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDIwQTZDRENFRiIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6IlNhYWQuU2hhaEBnZW5lcmFsc3Rhci5jb20iLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kYTU1YTE3Yy05MDZhLTRlZGEtODIzOS0xOGZlY2I2MDI5NjUvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiOC4zNi4xOTIuNCIsIm5hbWUiOiJTYWFkIFNoYWggKENvbnN1bHRhbnQpIiwib2lkIjoiMTVmMWU2ZDktZjgzMC00MDgzLWE5NjktMWMzNDM0MmNmOTgyIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA1RUE4MzAxOUUiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUJBQWExakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwM2U5Nzg5LWU1MGQtZjJlZi1mNDlkLWNjNTZlMzFmMDdmYSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6Ill3WWhtUzJ0QlJlWEdFWXdUS2xfTWc5QVVTWEtnV1EtLXh1MDFpY0ZxRFEiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkiLCJ1bmlxdWVfbmFtZSI6IlNhYWQuU2hhaEBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiJobnh6VF9KQURVeUVMaUk3M1ZoVkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyIxM2JkMWM3Mi02ZjRhLTRkY2YtOTg1Zi0xOGQzYjgwZjIwOGEiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoic19rOGZNa2FZdmdEc0hOUTRPTXFRUFVPMlpiNncwZm9uWTNsUlgyNlQ4c0JkWE56YjNWMGFDMWtjMjF6IiwieG1zX2lkcmVsIjoiNSA0IiwieG1zX3BmdGV4cCI6MTc4NTMyMzIyMCwieG1zX3N0Ijp7InN1YiI6IkFadEJMUVg1OHQ3OGlmQW1PaHVpSnY1MUlWdXZ5QVVPOGNaUUtpVk5KNjQifSwieG1zX3N1Yl9mY3QiOiIxNCAzIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiNCAzIn0.ZpQtFdUqXtN8LssJM8OEjmTV022OKwwVW8D_1RZHTm0BUy4Fk8SOS6T87vnn6KnDzMxApez6xFx9WM0A8RDJHH4SVStN3BcRCpBS_9xyJRG3FPa7gWmv9zNmcunuf2JuiUdQigQTAJTurF4T6aYBBxhCTs1iKZqOs79a5hN55uSIwR6K33tZaHzAinlIPpFtwRTNNx6-6rm-ehFsukSGI1iNnCA7eCHGxD-6q7qyNnTsQr7hZJMYMGRqcVNYYaXMitmkIj9Pro4VtW5MrpS_S03E5etM1ZFMlVHQd4HDzWS1edo7i2fsnS2yq1vj2Etx6L_ibgklLKybl-3JfWT07Q"
const meta: Meta<typeof DocumentWrapper> = {
  title: 'App',
  component: DocumentWrapper,
  argTypes: {
    documentSetName: {
      control: { type: 'text' },
    },
    documentType: {
      control: { type: 'select' },
      options: ['library', 'favorites', 'checkout'],
    },
    dashboardName: {
      control: { type: 'text' },
    },
  },
  args: {
    // Required so Storybook can track selection callbacks when switching controls/args.
    onSelectionChange: fn(),
  }
}

export default meta

type Story = StoryObj<typeof DocumentWrapper>

export const Underwriting: Story = {
  args: {
    graphToken: graphToken,
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-Dev",
    listName: "G2IndexingUnderwriting",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "MubashirTest",

    actions: {
      editDocumentProperties: true,
      bulkUpdateClaimIDForSelectedDocuments: true,
      checkoutDocuments: true,
      checkinDocuments: true,
      cancelDocumentCheckout: true,
      deleteDocuments: true,
      exportDocuments: true,
      copyDocumentUrls: true,
      addDocumentsToFavorites: true,
      removeDocumentsToFavorites: true,
    },

    // checkout columns
    columns: `CheckedOut,
    checkoutUserEmail,
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
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "Favorites",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    documentType: "checkout",
    onSelectionChange: fn(),
    editableProperties: {
      "Name": "",
      "ClaimID": "",
      "Queue": "",
      "Company": ""
    },
  }
}


export const DocumentumMigration01: Story = {
  args: {
    graphToken: graphToken,
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-Dev",
    actions: {
      editDocumentProperties: true,
      bulkUpdateClaimIDForSelectedDocuments: true,
      checkoutDocuments: true,
      checkinDocuments: true,
      cancelDocumentCheckout: true,
      deleteDocuments: true,
      exportDocuments: true,
      copyDocumentUrls: true,
      addDocumentsToFavorites: true,
      removeDocumentsToFavorites: true,
    },
    listName: "DocumentumMigration01",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",
    columns: `CheckedOut,
    checkoutUserEmail,
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
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "DocumentumMigration01",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    documentType: "library",
    onSelectionChange: fn(),
    editableProperties: {
      "Name": "",
      "ClaimID": "",
      "Queue": "",
      "Company": ""
    },

  }
}


export const Claims: Story = {
  args: {
    graphToken: graphToken,

    siteUrl: "https://genstargenesis.sharepoint.com/sites/Claims-GeneralStar-Dev",
    // listName: "Documents",
    // documentSetName: "0001e60e-fb02-41ba-8df2-2889dea2b692/Forms",
    // siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",

    actions: {
      editDocumentProperties: true,
      bulkUpdateClaimIDForSelectedDocuments: true,
      checkoutDocuments: true,
      checkinDocuments: true,
      cancelDocumentCheckout: true,
      deleteDocuments: true,
      exportDocuments: true,
      copyDocumentUrls: true,
      addDocumentsToFavorites: true,
      removeDocumentsToFavorites: true,
    },

    listName: "Documents",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",

    // checkout columns
    columns: `CheckedOut,
    checkoutUserEmail,
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

    //Favorite columns
    // columns: `ClaimsG2,DateReceived,Name,ClaimID,ContractID,
    //        Company,UserModifiedDate,CreationDate,CreatorName,SubCategory,
    //        Category,Recipient,BatchID,IndexOperator,CheckedOutBy,
    //        CheckedOutDate`,
    showToolbar: true,

    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "Favorites",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    documentType: "checkout",
    onSelectionChange: fn(),

    editableProperties: {
      "Name": "",
      "ClaimID": "",
      "Queue": "",
      "Company": ""
    },

  }
}


