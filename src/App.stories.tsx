import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import DocumentWrapper from './components/DocumentWrapper'

const graphToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImIwcXk4ZGJrSDU3U3JFRTJ0dWFSdWtGbVAyQUJycDFXS1Vtd1dSNkNKTFUiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0OTAzOTE0LCJuYmYiOjE3ODQ5MDM5MTQsImV4cCI6MTc4NDkwODEwMywiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQXQ3YlM3TjJDck9vaWdkTkQ5UTdIclZ0WkpmTVRPVVhxRDF2anhYdFpzbVpud1ZlSDF3Y3d0LzBIT1l4bXNjdG5FaFhScU1QMENDdmphS2RlV3lnaGVhWjdIS2VZVEh4MGJTVkxxMHhNNVlRU2NwWG4xV2NlL2xQcFhEc2ovcTJyVzFsV0w1TjBZN0NsbUFjcDdMcmtyT1d2ZlRmbGZIUnpPVy9kNUJGRGVmSi8ycEtoMzk5bUJyZDFnZCs3QW5wRiIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDRCNjM1OTcyRiIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiAoQ29uc3VsdGFudCkiLCJvaWQiOiI5ZTE4MTkzNy1hZWFiLTRhMTItOWQ1OC1iOGQyMWY0N2MwOGEiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDVFMzJDMjM4RSIsInJoIjoiMS5BV01Cb3BFbExfSWNxa2FaMklsR2RsbGx5UU1BQUFBQUFBQUF3QUFBQUFBQUFBQUFBRlpqQVEuIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIEZpbGVzLlJlYWQgRmlsZXMuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFNpdGVzLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuU2VhcmNoLkFsbCBTaXRlcy5TZWxlY3RlZCBUZXJtU3RvcmUuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgVXNlci5SZWFkV3JpdGUuQWxsIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDBiYjFhODktNGE4My03NzE0LWYyYTktMWU5N2RhZWI4YWQ1Iiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiUVdPNzdZY3FSMXVXWVJNd3gwdFNubzN5WHdoU0cyMzlLZ3NVd1JyNk1uMCIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJOQSIsInRpZCI6IjJmMjU5MWEyLTFjZjItNDZhYS05OWQ4LTg5NDY3NjU5NjVjOSIsInVuaXF1ZV9uYW1lIjoibXViYXNoaXIuYWx0YWZAZ2VuZXJhbHN0YXIuY29tIiwidXRpIjoiUjRQbGwzdk50a092eDZqOU40WTBBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19hY2QiOjE3NjE5MDQ5OTQsInhtc19hY3RfZmN0IjoiOSAzIiwieG1zX2Z0ZCI6InpKM3NsX2NTd0pBd0RLZ2MtM20zSjVDNEFscU8xZk9KcXV3bENDNUNzQ1VCZFhObFlYTjBMV1J6YlhNIiwieG1zX2lkcmVsIjoiMTAgNSIsInhtc19wZnRleHAiOjE3ODQ5OTQ1MDMsInhtc19zdCI6eyJzdWIiOiJwcUVwN0dXME43TE03VHJUdmFRX3BoVEF2TU1hS000UjhfM0txYkJVYUdJIn0sInhtc19zdWJfZmN0IjoiMyAxMiIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjQgMyJ9.nPQZI8562q_E-2EDvsCdqCN9LjtyJ7n-oywF-nb226raMLGPqR5wOotnFrPdlrnbMpVfDsog1FFha0xL18Gi_ZVq31M1jO3yG3X4lEpjxlq_4egMH8OgFcfuAMYlSTlIrFdwmWRUu2TDRziRuYfCsPKR_BSGYPTfx-P0VaZ9Le34vZUTTIQj14BiLr3Cu9ShbJCxGOaRf6veKVx9lRvJQb8OA0Z7bb2MQkBTWrT2PRYrgOYGxnR3rKyjO3Gs0AsTz0bXQVOH347efm7PQbI3-_PPlx7ocj2eGVxFZRnmv1ZSSJ6fUu9legskMMMR_PWQ0r5JuCzEEKXJQV3r-eHitQ"
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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImIwcXk4ZGJrSDU3U3JFRTJ0dWFSdWtGbVAyQUJycDFXS1Vtd1dSNkNKTFUiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0OTAzOTE0LCJuYmYiOjE3ODQ5MDM5MTQsImV4cCI6MTc4NDkwODEwMywiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQXQ3YlM3TjJDck9vaWdkTkQ5UTdIclZ0WkpmTVRPVVhxRDF2anhYdFpzbVpud1ZlSDF3Y3d0LzBIT1l4bXNjdG5FaFhScU1QMENDdmphS2RlV3lnaGVhWjdIS2VZVEh4MGJTVkxxMHhNNVlRU2NwWG4xV2NlL2xQcFhEc2ovcTJyVzFsV0w1TjBZN0NsbUFjcDdMcmtyT1d2ZlRmbGZIUnpPVy9kNUJGRGVmSi8ycEtoMzk5bUJyZDFnZCs3QW5wRiIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDRCNjM1OTcyRiIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiAoQ29uc3VsdGFudCkiLCJvaWQiOiI5ZTE4MTkzNy1hZWFiLTRhMTItOWQ1OC1iOGQyMWY0N2MwOGEiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDVFMzJDMjM4RSIsInJoIjoiMS5BV01Cb3BFbExfSWNxa2FaMklsR2RsbGx5UU1BQUFBQUFBQUF3QUFBQUFBQUFBQUFBRlpqQVEuIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIEZpbGVzLlJlYWQgRmlsZXMuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFNpdGVzLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuU2VhcmNoLkFsbCBTaXRlcy5TZWxlY3RlZCBUZXJtU3RvcmUuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgVXNlci5SZWFkV3JpdGUuQWxsIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDBiYjFhODktNGE4My03NzE0LWYyYTktMWU5N2RhZWI4YWQ1Iiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiUVdPNzdZY3FSMXVXWVJNd3gwdFNubzN5WHdoU0cyMzlLZ3NVd1JyNk1uMCIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJOQSIsInRpZCI6IjJmMjU5MWEyLTFjZjItNDZhYS05OWQ4LTg5NDY3NjU5NjVjOSIsInVuaXF1ZV9uYW1lIjoibXViYXNoaXIuYWx0YWZAZ2VuZXJhbHN0YXIuY29tIiwidXRpIjoiUjRQbGwzdk50a092eDZqOU40WTBBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19hY2QiOjE3NjE5MDQ5OTQsInhtc19hY3RfZmN0IjoiOSAzIiwieG1zX2Z0ZCI6InpKM3NsX2NTd0pBd0RLZ2MtM20zSjVDNEFscU8xZk9KcXV3bENDNUNzQ1VCZFhObFlYTjBMV1J6YlhNIiwieG1zX2lkcmVsIjoiMTAgNSIsInhtc19wZnRleHAiOjE3ODQ5OTQ1MDMsInhtc19zdCI6eyJzdWIiOiJwcUVwN0dXME43TE03VHJUdmFRX3BoVEF2TU1hS000UjhfM0txYkJVYUdJIn0sInhtc19zdWJfZmN0IjoiMyAxMiIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjQgMyJ9.nPQZI8562q_E-2EDvsCdqCN9LjtyJ7n-oywF-nb226raMLGPqR5wOotnFrPdlrnbMpVfDsog1FFha0xL18Gi_ZVq31M1jO3yG3X4lEpjxlq_4egMH8OgFcfuAMYlSTlIrFdwmWRUu2TDRziRuYfCsPKR_BSGYPTfx-P0VaZ9Le34vZUTTIQj14BiLr3Cu9ShbJCxGOaRf6veKVx9lRvJQb8OA0Z7bb2MQkBTWrT2PRYrgOYGxnR3rKyjO3Gs0AsTz0bXQVOH347efm7PQbI3-_PPlx7ocj2eGVxFZRnmv1ZSSJ6fUu9legskMMMR_PWQ0r5JuCzEEKXJQV3r-eHitQ",
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
    columns: `
    CheckoutUser,
    Name,
    ContentType,
    Modified,
    Created,
    CreatedBy,
  `,

    showToolbar: true,
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "Home",
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
    listName: "Documents",

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

    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",

    // checkout columns
    columns: `
    Name,
    CheckoutUser,
    CheckedOutMachineName,
    ClaimID,
    ContractID,
    CheckedOut,
    checkoutUserEmail,
    ClaimsG2,
    
    CheckedOutDate,
    DateReceived,
    
    Company,
    Modified,
    Created,
    CreatedBy,
    SubCategory,
    BatchID,
  `,
    showToolbar: true,

    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "Home",

    documentType: "library",
    onSelectionChange: fn(),

    editableProperties: {
      "Name": "",
      "ClaimID": "",
      "Queue": "",
      "Company": ""
    },
    userEmail: "mubashir.altaf@generalstar.com"

  }
}

export const Checkout: Story = {
  args: {
    graphToken: graphToken,
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Claims-GeneralStar-Dev",
    listName: "Documents",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",

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
    dashboardName: "Checkout",
    documentType: "checkout",
    onSelectionChange: fn(),

    editableProperties: {
      "Name": "",
      "ClaimID": "",
      "Queue": "",
      "Company": ""
    },

    userEmail: "mubashir.altaf@generalstar.com"
  }
}
export const Favorite: Story = {
  args: {
    graphToken: graphToken,
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",
    listName: "G2IndexingUnderwriting",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",
    // spUserId: 43,
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
    //Favorite columns
    columns: `ClaimsG2,DateReceived,Name,ClaimID,ContractID,
           Company,UserModifiedDate,CreationDate,CreatorName,SubCategory,
           Category,Recipient,BatchID,IndexOperator,CheckedOutBy,
           CheckedOutDate`,
    showToolbar: true,

    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "Favorites",

    documentType: "favorites",
    onSelectionChange: fn(),

    editableProperties: {
      "Name": "",
      "ClaimID": "",
      "Queue": "",
      "Company": ""
    },
  }
}


