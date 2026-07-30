import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import DocumentWrapper from './components/DocumentWrapper'


const graphToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImppcWNfanZXTFFvMkhWSlgxam9VVC02YTZ1Nm1fa0ltc1ZoWXJyLUFNdXciLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg1Mzk1MzE4LCJuYmYiOjE3ODUzOTUzMTgsImV4cCI6MTc4NTQwMDU1MywiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQWpJY3R1MG9uVHlTaStuT3ZuM09rekQ3UWl6WTJPYzlCelNGcjhRTlJrUTVsa0FPb0c3cSt3ekNDVzdUMGZyTXlld254ckVEMFI0SzROT3RZVGo1SENuWHo5ckJld3hUVlRmcWlzb1NQTkxHNzJlRFdFTVFiOHU2M1hZckxOVTZpWi85a29hbkwzNDJyM3drMkNFMTVmb3Bmb24wTWZGeGsxdzhnakdkS2EybktjWFprYWtWZWRWNzU4eEYzY2xpLyIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDRCNjM1OTcyRiIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiAoQ29uc3VsdGFudCkiLCJvaWQiOiI5ZTE4MTkzNy1hZWFiLTRhMTItOWQ1OC1iOGQyMWY0N2MwOGEiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDVFMzJDMjM4RSIsInJoIjoiMS5BV01Cb3BFbExfSWNxa2FaMklsR2RsbGx5UU1BQUFBQUFBQUF3QUFBQUFBQUFBQUFBRlpqQVEuIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIEZpbGVzLlJlYWQgRmlsZXMuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFNpdGVzLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuU2VhcmNoLkFsbCBTaXRlcy5TZWxlY3RlZCBUZXJtU3RvcmUuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgVXNlci5SZWFkV3JpdGUuQWxsIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDBiYjFhODktNGE4My03NzE0LWYyYTktMWU5N2RhZWI4YWQ1Iiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiUVdPNzdZY3FSMXVXWVJNd3gwdFNubzN5WHdoU0cyMzlLZ3NVd1JyNk1uMCIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJOQSIsInRpZCI6IjJmMjU5MWEyLTFjZjItNDZhYS05OWQ4LTg5NDY3NjU5NjVjOSIsInVuaXF1ZV9uYW1lIjoibXViYXNoaXIuYWx0YWZAZ2VuZXJhbHN0YXIuY29tIiwidXRpIjoiaWp4bDA4RUltVXVyNkxtX2RweS1BQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19hY2QiOjE3NjE5MDQ5OTQsInhtc19hY3RfZmN0IjoiMyA5IiwieG1zX2Z0ZCI6InFWcWF0SUNkaWU4LWV5OE90UGdPdUZWbzh0ZzlpU3dxNEx6d3p6VjVaRzBCZFhOemIzVjBhQzFrYzIxeiIsInhtc19pZHJlbCI6IjE4IDUiLCJ4bXNfcGZ0ZXhwIjoxNzg1NDg2OTUzLCJ4bXNfc3QiOnsic3ViIjoicHFFcDdHVzBON0xNN1RyVHZhUV9waFRBdk1NYUtNNFI4XzNLcWJCVWFHSSJ9LCJ4bXNfc3ViX2ZjdCI6IjggMyIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjE2IDMifQ.b1V_O64mkUtCLkH-FR9gZXf1roHBPERfCGurxvXsiUOqz4S7zWqradW-Ro5whILybWggV7hV0_4S0F4_fT8eNQG0luyjq5q35NyQhvDTgQWJ4smj0m0XoOk55NZEd3Lwq_9VTTRin9qUe5i6NptvD2UkMm03qLmDyQk0kfso1QDo7YBxvH55lZdD1hrlagd-ZFgotW02ljQ6O7Sje_IrAWayqqFYQgirFDHeQsdd0bVlrIMUnLhKROKnIsiujFQeKQY5dMrOBSuPhDVeMCO6x1LXqpzuLthN9tk-4VF_dLBz3zU-0vt9FaMKLXfL6jKCT72bEYRJlSF19SnCjOqaYg"
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
    // editableProperties: {
    //   "Name": "",
    //   "ClaimID": "",
    //   "Queue": "",
    //   "Company": ""
    // },
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
    // editableProperties: {
    //   "Name": "",
    //   "ClaimID": "",
    //   "Queue": "",
    //   "Company": ""
    // },

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


