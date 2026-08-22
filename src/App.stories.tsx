import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6InJOWlZ4T0diNW5QYzlHZkVOMTMtX1dqV3lWRW9jYlZHTXBwcFVzM3BUS3MiLCJhbGciOiJSUzI1NiIsIng1dCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSIsImtpZCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg3NDA0Mjc3LCJuYmYiOjE3ODc0MDQyNzcsImV4cCI6MTc4NzQwOTM1OCwiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJwZmRyIl0sImFpbyI6IkFZUUFlLzhjQUFBQUI1dGFHenNrRDdEV3BLRFRNSUs2V05jdTFPZ0x2S3hYYkVWbmJmd0pqaTlObG1rdno3ODlvdEg5SGJrNlpjQWVyaXJJVEdzekUvdm5leFhDWmpvdEc1SGNiWkFERkhma0RmRUg2ZWdSRndGZk5MTElrb2Y4bnlIOGt1dm9NcnNWWU9DbVNqcjkrSmtKMTlxUTAwZ2FsT000dG9QdjJsUGlhNXZsakRuVFA1TT0iLCJhbHRzZWNpZCI6IjU6OjEwMDMyMDA0QjYzNTk3MkYiLCJhbXIiOlsicHdkIiwicnNhIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJlN2Q1NmI4Mi1kYmZlLTRjOWYtOWY3MS0xOGMyYjkzZGM1ZGYiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImZhbWlseV9uYW1lIjoiQWx0YWYiLCJnaXZlbl9uYW1lIjoiTXViYXNoaXIiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kYTU1YTE3Yy05MDZhLTRlZGEtODIzOS0xOGZlY2I2MDI5NjUvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiNTIuMTUxLjIyOC4xMTQiLCJuYW1lIjoiTXViYXNoaXIgQWx0YWYgKENvbnN1bHRhbnQpIiwib2lkIjoiOWUxODE5MzctYWVhYi00YTEyLTlkNTgtYjhkMjFmNDdjMDhhIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA1RTMyQzIzOEUiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUFBQUZaakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwN2Q0ZTNhLThmZDAtNDFmMS00MGU2LWFkMmYwN2YxNjFhMSIsInNpZ25pbl9zdGF0ZSI6WyJkdmNfbW5nZCIsImR2Y19jbXAiLCJpbmtub3dubnR3ayJdLCJzdWIiOiJRV083N1ljcVIxdVdZUk13eDB0U25vM3lYd2hTRzIzOUtnc1V3UnI2TW4wIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiI0S0I4dUlNTVpFV0E4Z3JRT2lydkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyIxM2JkMWM3Mi02ZjRhLTRkY2YtOTg1Zi0xOGQzYjgwZjIwOGEiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiI5IDMiLCJ4bXNfZnRkIjoiVUJqbzNXX01lSWhTUTFTVmFackFkTjJxbGNHdEVYc1VvcEs0UDZJcElRZ0JkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiI1IDI4IiwieG1zX3BmdGV4cCI6MTc4NzQ5NTc1OCwieG1zX3N0Ijp7InN1YiI6InBxRXA3R1cwTjdMTTdUclR2YVFfcGhUQXZNTWFLTTRSOF8zS3FiQlVhR0kifSwieG1zX3N1Yl9mY3QiOiIxOCAzIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMyA0In0.Qk3QJwrAwE_O56bGmVX9zKIP85ETezqvvmys5hO9aHcHxV4njYDK3qMdQZ2wWwU68l5hyxj0vVDSSfvisJOC9fjPYo2lpriJwAvGi9tmXgZwLKucDzTB5fHtbSIjFeE7ui8VnnJFvh2-n4cu75mTcdEpJmK5hrl2hBFUCp__P1QbCUYc6jp-pZuUW1defBZMfqMHhEt_v4uvuJmIrofgsABuN-Dzn2cLiwY90WxZwnbRsCSepBsyKFeqaxK2K1QMunM0nlpmhlVGtbuLXXiqShXVZO7JPTPfvBjwhYoONaBiuG3r1PJVzs_HNtWnimymeWXH937ciLikPteCjScjkQ";
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
