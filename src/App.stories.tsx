import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImlIRk8xVzJBdi1ES21iSF9qTGFRS2d5NGhYLWp1alBxb2ZiTjJLSy1xU3MiLCJhbGciOiJSUzI1NiIsIng1dCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSIsImtpZCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg3NTY5NzY2LCJuYmYiOjE3ODc1Njk3NjYsImV4cCI6MTc4NzU3Mzc1NCwiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJwZmRyIl0sImFpbyI6IkFZUUFlLzhjQUFBQWc0MkdLQW5wQXhoWEU1QWxSazBOS2VzZkVYdUNXOHB3UWszcS9nWXl5NFJBUm1JcnVXelNKRlZMOHppMnBGdjBTTnVPNWZlOWFIQ0EyRWV3bVV6QUIrcDFVTlRON3IyMm93dCtNZlpjdDRBMXF0cEZlZzV2a2xlSmhsYnJEc2FNVjViL3gzQmx0TGh5ek4xMjVNOXhxa1FlNUxNT0RQZGpKZGxlZHVuRkw2UT0iLCJhbHRzZWNpZCI6IjU6OjEwMDMyMDA0QjYzNTk3MkYiLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJlN2Q1NmI4Mi1kYmZlLTRjOWYtOWY3MS0xOGMyYjkzZGM1ZGYiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImZhbWlseV9uYW1lIjoiQWx0YWYiLCJnaXZlbl9uYW1lIjoiTXViYXNoaXIiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kYTU1YTE3Yy05MDZhLTRlZGEtODIzOS0xOGZlY2I2MDI5NjUvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiNTIuMTUxLjIyOC4xMTQiLCJuYW1lIjoiTXViYXNoaXIgQWx0YWYgKENvbnN1bHRhbnQpIiwib2lkIjoiOWUxODE5MzctYWVhYi00YTEyLTlkNTgtYjhkMjFmNDdjMDhhIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA1RTMyQzIzOEUiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUFBQUZaakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwN2Q0ZTNhLThmZDAtNDFmMS00MGU2LWFkMmYwN2YxNjFhMSIsInNpZ25pbl9zdGF0ZSI6WyJkdmNfbW5nZCIsImR2Y19jbXAiLCJpbmtub3dubnR3ayJdLCJzdWIiOiJRV083N1ljcVIxdVdZUk13eDB0U25vM3lYd2hTRzIzOUtnc1V3UnI2TW4wIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiJaUnlPQ09RemEwLWpGSWdRam1LWkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyIxM2JkMWM3Mi02ZjRhLTRkY2YtOTg1Zi0xOGQzYjgwZjIwOGEiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiM0I3MmVqQk5YcnpyVU04S2JZWjhvcEdUcHNPTndKci1NOFZYLW5QOGhHWUJkWE4zWlhOME15MWtjMjF6IiwieG1zX2lkcmVsIjoiNSAzMCIsInhtc19wZnRleHAiOjE3ODc2NjAxNTQsInhtc19zdCI6eyJzdWIiOiJwcUVwN0dXME43TE03VHJUdmFRX3BoVEF2TU1hS000UjhfM0txYkJVYUdJIn0sInhtc19zdWJfZmN0IjoiMyAxNCIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjMgMTYifQ.Ki5Z6vRCnLBmcvZjnoAxZBt-lYlVsAGwIiT-MvUzkwb-atsJUGyrydwA0SyKS4Z--kXK5PmR-msZLOz2TcNJjpBoUBJq28Vuot2D5LLQZ65sKXGgCc0mLl5FHNkQXqYVf1JjGp_fWmApV5jacilL6wNLaAM9EN2BChMwGNAXLTDHSK9DS3MI9vdQQRfug1EK1xOVK0s4WFDfnGpcn_Fm1iIsYThdwsxJqflitwZMhBGu34hOcOUB4UAUpyziRhLU7P1sCzVqn-u7fEW3W4iUA62NlKv9vYOTT8_hVWYOapiEYWyq2Xduu15qwq7aahVnpFDsHESgj6EeU_55HXtBAQ";
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
    graphToken: graphToken,
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
    ClaimsG2,DateReceived,CheckoutUser,Name,CheckedOutMachineName,ClaimID,ContractID,Company,
        UserModifiedDate,CreationDate,CreatorName,SubCategory,Category,Recipient,BatchID,
        IndexOperator,CheckedOutBy,CheckedOutDate
   
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

    listName: "G2Documents",
    contentTypesLibrary: "G2Documents",
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

    onFavorite: async (itemIds: string[]) => {
      console.log("onFavorite called with:", itemIds);
      // await myProjectApi.addFavorites(itemIds);
    },
    onUnfavorite: async (itemIds: string[]) => {
      console.log("onUnfavorite called with:", itemIds);
      // await myProjectApi.removeFavorites(itemIds);
    },
    editableProperties: {
      DocumentType: "",
      DocumentName: "",
      ReceivedDate: "",
      Category: "",
      SubCategory: "",
      ClaimWorkflow: "",
      Recipient: "",
      SendNotification: "",
      Comments: "",
      ClaimID: "",
      CheckedOutBy: "",
      CheckedOutDate: "",
    },
  },
};

export const FinancialSupportingDocumentsDev: Story = {
  args: {
    graphToken: graphToken,

    siteUrl:
      "https://genstargenesis.sharepoint.com/sites/FinancialSupportingDocuments-Dev",

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

    listName: "G2Documents",
    contentTypesLibrary: "G2Documents",
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

    onFavorite: async (itemIds: string[]) => {
      console.log("onFavorite called with:", itemIds);
      // await myProjectApi.addFavorites(itemIds);
    },
    onUnfavorite: async (itemIds: string[]) => {
      console.log("onUnfavorite called with:", itemIds);
      // await myProjectApi.removeFavorites(itemIds);
    },
    //     editableProperties: {
    //   "DocumentType": "",
    //   "DocumentName": "",
    //   "ReceivedDate": "",
    //   "SubCategory": "",
    //   "Category": "",
    //   "ClaimWorkflow": "",
    //   "Recipient": "",
    //   "SendNotification": "",
    //   "Comments": ""
    // },
  },
};