import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6InZ2OEV1dC1KWlEydWViOFpVQVpkcWdkbmxfeUZGdXVZRlZKeVpad1pWNG8iLCJhbGciOiJSUzI1NiIsIng1dCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSIsImtpZCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg1OTM5Mjk2LCJuYmYiOjE3ODU5MzkyOTYsImV4cCI6MTc4NTk0NDc4NywiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQUdoQVZOMDNBazBkZVJsWEJyWE5ubTVwTzFpQzJSK2J2Ulk5OU4velBYZTRsL294VEd3UmszKzRqUDJXVnBCWllieXhLbFBuTkp5YzhpbHNvY0N1VmJ6dW8xRlJEbDkrUUV3RmJ4QjNFYk1IQ1lnZFJVWExwZnB4WVlZL1ZVM0NQbUJ1dmY0a2FBZm4wc3NkU09nV25qa3BxVnBmQkZadWIvS2RxQVF1R2c4UW1nd2szQkQwWWN6VGNLODVwU1FoRyIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDRCNjM1OTcyRiIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiAoQ29uc3VsdGFudCkiLCJvaWQiOiI5ZTE4MTkzNy1hZWFiLTRhMTItOWQ1OC1iOGQyMWY0N2MwOGEiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDVFMzJDMjM4RSIsInJoIjoiMS5BV01Cb3BFbExfSWNxa2FaMklsR2RsbGx5UU1BQUFBQUFBQUF3QUFBQUFBQUFBQUFBRlpqQVEuIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIEZpbGVzLlJlYWQgRmlsZXMuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFNpdGVzLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuU2VhcmNoLkFsbCBTaXRlcy5TZWxlY3RlZCBUZXJtU3RvcmUuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgVXNlci5SZWFkV3JpdGUuQWxsIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDBiYjFhODktNGE4My03NzE0LWYyYTktMWU5N2RhZWI4YWQ1Iiwic2lnbmluX3N0YXRlIjpbImlua25vd25udHdrIiwia21zaSJdLCJzdWIiOiJRV083N1ljcVIxdVdZUk13eDB0U25vM3lYd2hTRzIzOUtnc1V3UnI2TW4wIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiJoV09TbHB3R0RVcWdrUmppckhQSEFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyIxM2JkMWM3Mi02ZjRhLTRkY2YtOTg1Zi0xOGQzYjgwZjIwOGEiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiSzktcmk4WnlTVkV1RFQ1cUhRTTRhQkJ2VEprbjhIRDVQMmR1VXBuVnh2MEJkWE56YjNWMGFDMWtjMjF6IiwieG1zX2lkcmVsIjoiNSAxMCIsInhtc19wZnRleHAiOjE3ODYwMzExODcsInhtc19zdCI6eyJzdWIiOiJwcUVwN0dXME43TE03VHJUdmFRX3BoVEF2TU1hS000UjhfM0txYkJVYUdJIn0sInhtc19zdWJfZmN0IjoiMjAgMyIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjMgMTQifQ.EboV6pwC0E4W2grdq9VvXBEC4vFfU4lW-WAd05ZNa__LZkOhCYBNBNwlgrHnfGcU99Cqt6QSmi2NlhTdcszK-I_34GzUwHzCWjpMRAMh2ek3LdHTQOYj5FOTPXY8LUR9VbTQmo-b2T2wQ0wMZrJBPq-8lcEJO6Ac4miukMXxWVZOQnNe1I9gM8x5DPWDYr3FTLlWouHK5Qw68LSMc87nHL-hJE6OUCYmbLS_Q9WAxO6okWUQ1Eoor9KnYy17Yw2ibLKqjHpAfHCnzR8vxVx3xRDqU2ODxcFpF-kWTDwA6Q41SmiJCr7hnYRiGJSsJQZ2xbZBkv0ye7OseNr0FfhmGw";
const meta: Meta<typeof DocumentWrapper> = {
  title: "App",
  component: DocumentWrapper,
  argTypes: {
    documentSetName: {
      control: { type: "text" },
    },
    documentType: {
      control: { type: "select" },
      options: ["library", "favorites", "checkout"],
    },
    dashboardName: {
      control: { type: "text" },
    },
  },
  args: {
    // Required so Storybook can track selection callbacks when switching controls/args.
    onSelectionChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DocumentWrapper>;

export const Underwriting: Story = {
  args: {
    graphToken:
      "eyJ0eXAiOiJKV1QiLCJub25jZSI6IlhEV1JWOVZCRWx4X3Nvb1laZ1hRTUc4RlRRelFHUTYxTWVzcWJudTFtRzQiLCJhbGciOiJSUzI1NiIsIng1dCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSIsImtpZCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg1OTI2NDIzLCJuYmYiOjE3ODU5MjY0MjMsImV4cCI6MTc4NTkzMTY5OSwiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQVpEZWpQTjJjUFhRRkFDalRjLzl4bEpUTUZ4ZjRzMEh6M0Q4VGFFMjAvaHVWMXBYVkRRMkR0NjcxVFpwUkFIR2dnUW94Yk03eURPc2ZQZFZzcGtFdDhNNktnK1REK2VXTVBIV2d3eXZwaFZiWUd4VjgvVjE0dnhtdGxPUGs3TVpIdXpEN3ZYMmx2aDhwazdxMm1rYjRvaHhmNll1MUhKYXdJM2lqVUR1a1RKNStsRGRtOE1vUlY1Y0w0d2ttUVR3SSIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDIwQTZDRENFRSIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6IlFhc2ltLlNpZGRpcXVlQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI4LjM2LjE5Mi40IiwibmFtZSI6IlFhc2ltIFNpZGRpcXVlIChDb25zdWx0YW50KSIsIm9pZCI6ImYzNDczNzM2LTdmZWQtNDc4Zi04ZGIwLTY5ZmNlMWE3NDJjMCIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNURBRTdBMkYzIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFCQUFjdGpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWQiOiIwMDZjZDM3YS03NDc4LTY0ZTYtN2QzYy0zZjk0ZDZkMTE4NWEiLCJzaWduaW5fc3RhdGUiOlsiaW5rbm93bm50d2siLCJrbXNpIl0sInN1YiI6ImNjVnIxaUtSenY3dEk4dUdRR01pWXBoT2d3Q3l0aTByYlNHZDUxUzNaR2ciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkiLCJ1bmlxdWVfbmFtZSI6IlFhc2ltLlNpZGRpcXVlQGdlbmVyYWxzdGFyLmNvbSIsInV0aSI6IjhxVVR3TFJaQ2tPYnczWldKdzdsQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjEzYmQxYzcyLTZmNGEtNGRjZi05ODVmLTE4ZDNiODBmMjA4YSJdLCJ4bXNfYWNkIjoxNzYxOTA0OTk0LCJ4bXNfYWN0X2ZjdCI6IjMgOSIsInhtc19mdGQiOiJ1cU5HRzlFY0UxalhsM2xXRjk1MF9xYk9tc0gwS0pfTi1JYVVIY2JnZHp3QmRYTjNaWE4wTXkxa2MyMXoiLCJ4bXNfaWRyZWwiOiIyNCA1IiwieG1zX3BmdGV4cCI6MTc4NjAxODA5OSwieG1zX3N0Ijp7InN1YiI6ImlDc1VTYlhFbXJ3WWZaQXZzNURCOGZNY3luc0JCTUlGVmxLRDJLVXB3UVUifSwieG1zX3N1Yl9mY3QiOiI2IDMiLCJ4bXNfdGNkdCI6MTc1MjU4NjEwOSwieG1zX3RudF9mY3QiOiIzIDgifQ.AFm84IzhfDKvTBeOJhDAUvoK3yHV0ViESuSKb0DPqZWlnokP7HeDBzjp5rbg6j5RZX5Trk5W7T9mAoYcV_S7Hsi3t2u2TWlBDox5ihb5K-KRHpVHWZOU3035NYPd1H1WkvyE2pMP0rEJK7cEM8lTdfnTBQ0odAWZlxe-SPXZKWzTYZR3G5MMMxaciQDDRil6suZoRcYfIUM38DIUxN5YfrE_L1HMAW0Bx8jRXSLll_JMtyxQdp0YNUh9KL0CeOt3P91ozq5eYkXIBPcAI1ODwUJJf3KX7Jb5Wj92SU2KfLnh-qmBXIJcYaEwPE05T8E1Faw-QmU8TJGsdE6tcaK8sg",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-Dev2",
    listName: "G2IndexingClaims",
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
    columns: `
    CheckoutUser,
    Name,
    ContentTypes,
    Queue
   
  `,

    showToolbar: true,
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Favorites",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    documentType: "favorites",
    onSelectionChange: fn(),

    // editableProperties: {
    //   "Name": "",
    //   "ClaimID": "",
    //   "Queue": "",
    //   "Company": ""
    // },
    onFavorite: async (itemIds: string[]) => {
      console.log("onFavorite called with:", itemIds);
      // await myProjectApi.addFavorites(itemIds);
    },

    onUnfavorite: async (itemIds: string[]) => {
      console.log("onUnfavorite called with:", itemIds);
      // await myProjectApi.removeFavorites(itemIds);
    },

    favoriteItemIDs: ["01BLIGMWNBNKNBAJZ4IFAJPAXZBJTVPCNC"],
  },
};

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
      Name: "",
      ClaimID: "",
      Queue: "",
      Company: "",
    },
    onFavorite: async (itemIds: string[]) => {
      console.log("onFavorite called with:", itemIds);
      // await myProjectApi.addFavorites(itemIds);
    },
    onUnfavorite: async (itemIds: string[]) => {
      console.log("onUnfavorite called with:", itemIds);
      // await myProjectApi.removeFavorites(itemIds);
    },
  },
};

export const Claims: Story = {
  args: {
    graphToken: graphToken,

    // siteUrl: "https://genstargenesis.sharepoint.com/sites/Claims-GeneralStar-Dev",
    // listName: "Documents",
    // documentSetName: "0001e60e-fb02-41ba-8df2-2889dea2b692/Forms",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-Dev2",
    listName: "G2IndexingClaims",

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

    // listName: "Documents",
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

    // editableProperties: {
    //   "Document Name": "",
    //   "ClaimID": "",
    //   "Queue": "",
    //   "Company": ""
    // },
    onFavorite: async (itemIds: string[]) => {
      console.log("onFavorite called with:", itemIds);
      // await myProjectApi.addFavorites(itemIds);
    },
    onUnfavorite: async (itemIds: string[]) => {
      console.log("onUnfavorite called with:", itemIds);
      // await myProjectApi.removeFavorites(itemIds);
    },
    favoriteItemIDs: [],
  },
};

export const ClaimsGenesisDev: Story = {
  args: {
    graphToken: graphToken,

    siteUrl: "https://genstargenesis.sharepoint.com/sites/Claims-Genesis-Dev",

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
    columns: `
    Name,
    CheckoutUser,
    DateReceived,
    ClaimID,
    Modified,
    Created,
    CreatedBy,
    SubCategory,
    Category,
  `,

    showToolbar: true,

    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Library",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    documentType: "library",
    onSelectionChange: fn(),

    // editableProperties: {
    //   "Name": "",
    //   "ClaimID": "",
    //   "Queue": "",
    //   "Company": ""
    // },
    onFavorite: async (itemIds: string[]) => {
      console.log("onFavorite called with:", itemIds);
      // await myProjectApi.addFavorites(itemIds);
    },
    onUnfavorite: async (itemIds: string[]) => {
      console.log("onUnfavorite called with:", itemIds);
      // await myProjectApi.removeFavorites(itemIds);
    },
  },
};
