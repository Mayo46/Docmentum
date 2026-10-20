import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjZQQWxsNDIyUmc2SFFuN3R6SHJpaHZHSDhNd3dubmxnZUFOVXVpeXBpZnMiLCJhbGciOiJSUzI1NiIsIng1dCI6InJ5QngtNjVqTm94SDRGUUhfNnphck5qYU5mNCIsImtpZCI6InJ5QngtNjVqTm94SDRGUUhfNnphck5qYU5mNCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzkyNDgxMTI3LCJuYmYiOjE3OTI0ODExMjcsImV4cCI6MTc5MjQ4NTEyOCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJwZmRyIl0sImFpbyI6IkFiUUFTLzhlQUFBQWtHbVZnYVZVVGNWaERTeEJDSVRvU3ZKN2hTd3NEQU1DS1VwZWt3N1J1engvWk5VTlNuWVFtVjh2SXIrcDk5OUlWV1ZibytNazc5bjVYVFJ0T3R0SGhmNXhzTko5ZHZpdXcxNG8ydW5BU3drNHBDV1VQeThUd3FFY1pHNkFtQnY4YWEzQlFOQXRVUnpMRGdrc1p5SGFNYjRaNmFEMmhTZ2FlUDM0MVFjS1RhN2ZrZDAxbDJDaDM4a0l0dW84cGdPRm9MeDlScXVwWGx0V3cxdmtOOFhCWS9uREFZVG5aNDlLeG03NFF0SWZLalk9IiwiYWx0c2VjaWQiOiI1OjoxMDAzMjAwNEI2MzU5NzJGIiwiYW1yIjpbInB3ZCIsInJzYSIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHMiBEb2NzIFJlc291cmNlIFVJIE5vblByb2QiLCJhcHBpZCI6ImIxMzA1MTMxLWU3MjItNGFkYS05NTAzLWNkYzY3Zjk3MzA3MCIsImFwcGlkYWNyIjoiMCIsImRldmljZWlkIjoiZTdkNTZiODItZGJmZS00YzlmLTlmNzEtMThjMmI5M2RjNWRmIiwiZW1haWwiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kYTU1YTE3Yy05MDZhLTRlZGEtODIzOS0xOGZlY2I2MDI5NjUvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiNTIuMTUxLjIyOC4xMTQiLCJuYW1lIjoiTXViYXNoaXIgQWx0YWYgKENvbnN1bHRhbnQpIiwib2lkIjoiYjIyNGVhMGYtODNjZS00YzBjLWE5MTYtZDNiZTdlMjZkYzBkIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA2M0IxOTVCMzAiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUFBQUZaakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwN2Q0ZTNhLThmZDAtNDFmMS00MGU2LWFkMmYwN2YxNjFhMSIsInNpZ25pbl9zdGF0ZSI6WyJkdmNfbW5nZCIsImR2Y19jbXAiLCJpbmtub3dubnR3ayJdLCJzdWIiOiJRV083N1ljcVIxdVdZUk13eDB0U25vM3lYd2hTRzIzOUtnc1V3UnI2TW4wIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiI5dFRTSG9CdzRrQzR6dC1qWTVKZEFnIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfYXVkX2d1aWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJ4bXNfZnRkIjoiZnVpZ0poRVNPSndzSXYybnhTZzBVb0d5QzJjNlVUU0h1OFlzbndMTlhrOEJkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxIDMwIiwieG1zX3BmdGV4cCI6MTc5MjU3MTUyOCwieG1zX3N0Ijp7InN1YiI6InBxRXA3R1cwTjdMTTdUclR2YVFfcGhUQXZNTWFLTTRSOF8zS3FiQlVhR0kifSwieG1zX3N1Yl9mY3QiOiIyIDMiLCJ4bXNfdGNkdCI6MTc1MjU4NjEwOSwieG1zX3RudF9mY3QiOiIxNCAzIn0.QBUr0lO586Vsu6MTaWPU9fAymS7oy2QzTSRd59CJMM8dkOcUNdsLMTMdnY1IZ3cu_8YCnAuqP9u3ts2MpzmgerQCbXezsMkt13rsq12JkQU3oWSVinFluEacpWWlKOGaAW2UBOf_m64GGMMfkE_4VG72D61uGB5H0F1zk3nNGhLTjQZ5JAdCPPd4DF6EFeLYbvfivmUSY5VOaS6mIdYq2Wlq0T1AIUKqvXwhcIYmEeGRlYJQLZIPnvuEUOO6dbFOL_d_UI9Y65tRJeTt8mTJ0cmVxBeqmMCxtJ4vMS0ANZnSbaRn1EckwKVq8tS8AntK9Liq0t_g0xGjZaAQ34CVRw";
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
    userRole: {
      control: { type: "select" },
      options: ["admin", "viewer", "importer"],
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
    siteUrl:
      "https://genstargenesis.sharepoint.com/sites/UW-BrokerageMedical-Dev",
    listName: "Documents",
    contentTypesLibrary: "",
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
        ReceivedDate,CheckoutUser,Name,CheckedOutMachineName,ClaimID,ContractID,Company,
        UserModifiedDate,CreationDate,CreatorName,SubCategory,_Category,Recipient,BatchID,
        IndexOperator,CheckedOutBy,CheckedOutDate
  `,

    showToolbar: true,
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Favorites",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    userRole: "admin",
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

    onDeleteDocuments: async (itemIds: string[], docSetId: string) => {
      console.log("onDeleteDocuments called with:", itemIds, docSetId);
      // await myProjectApi.deleteDocuments(itemIds, docSetId);
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
    ReceivedDate,
    ClaimID,
    Modified,
    Created,
    CreatedBy,
    SubCategory,
    _Category,
  `,

    showToolbar: true,

    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Library",
    userEmail: "Mubashir.Altaf@GENERALSTAR.COM",
    userRole: "importer",
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
    onDeleteDocuments: async (itemIds: string[], docSetId: string) => {
      console.log("onDeleteDocuments called with:", itemIds, docSetId);
      // await myProjectApi.deleteDocuments(itemIds, docSetId);
    },
    editableProperties: [
      // Document Information
      {
        key: "DocumentType",
        displayName: "Document Type",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "choice",
      },
      {
        key: "OriginalDocumentName",
        displayName: "Original Document Name",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "text",
      },
      {
        key: "DocumentName",
        displayName: "Document Name",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "text",
      },
      {
        key: "ReceivedDate",
        displayName: "Date Received",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "dateTime",
      },
      {
        key: "_Category",
        displayName: "Category",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "choice",
      },
      {
        key: "SubCategory",
        displayName: "Sub Category",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "choice",
      },
      {
        key: "ClaimWorkflow",
        displayName: "Claim Workflow",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "choice",
      },
      {
        key: "_Comments",
        displayName: "Comments",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "text",
      },

      // Claim Information
      {
        key: "ClaimID",
        displayName: "Claim ID",
        group: "claim",
        readOnly: true,
        required: true,
        columnType: "text",
      },
      {
        key: "ContractID",
        displayName: "Contract ID",
        group: "claim",
        readOnly: true,
        required: true,
        columnType: "text",
      },
      {
        key: "ClaimCloseDate",
        displayName: "Claim Close Date",
        group: "claim",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },
      {
        key: "G2CompanyName",
        displayName: "Genre Company",
        group: "claim",
        readOnly: true,
        required: true,
        columnType: "choice",
      },
      {
        key: "Created",
        displayName: "Created",
        group: "claim",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },
      {
        key: "CheckedOutBy",
        displayName: "Checked Out By",
        group: "claim",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "CheckedOutDate",
        displayName: "Checked Out Date",
        group: "claim",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },
    ],
    dropdownList: "ClaimDocIdentifier",
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
    ReceivedDate,
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
    userRole: "admin",
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
    onDeleteDocuments: async (itemIds: string[], docSetId: string) => {
      console.log("onDeleteDocuments called with:", itemIds, docSetId);
      // await myProjectApi.deleteDocuments(itemIds, docSetId);
    },
    editableProperties: [
      // Document Information
      {
        key: "DocumentType",
        displayName: "Document Type",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "choice",
      },
      {
        key: "OriginalDocumentName",
        displayName: "Original Document Name",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "text",
      },
      {
        key: "DocumentName",
        displayName: "Document Name",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "text",
      },
      {
        key: "_Category",
        displayName: "Category",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "choice",
      },
      {
        key: "SubCategory",
        displayName: "Sub Category",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "choice",
      },
      {
        key: "_Comments",
        displayName: "Comments",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "text",
      },
      {
        key: "ReceivedDate",
        displayName: "Received Date",
        group: "document",
        readOnly: true,
        required: true,
        columnType: "dateTime",
      },
      {
        key: "Function",
        displayName: "Function",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "choice",
      },
      {
        key: "G2CompanyName",
        displayName: "Genre Company",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "choice",
      },
      {
        key: "Created",
        displayName: "Created",
        group: "document",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },
      {
        key: "CheckedOutBy",
        displayName: "Checked Out By",
        group: "document",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "CheckedOutDate",
        displayName: "Checked Out Date",
        group: "document",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },

      // Enterprise Information
      {
        key: "Area",
        displayName: "Area",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "BatchID",
        displayName: "Batch ID",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "CreatorName",
        displayName: "Creator Name",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "DMSSource",
        displayName: "DMS Source",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "Format",
        displayName: "Format",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "HoldApplied",
        displayName: "Hold Applied",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "boolean",
      },
      {
        key: "Sender",
        displayName: "Sender",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "FullContentSize",
        displayName: "Full Content Size",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "number",
      },
      {
        key: "Type",
        displayName: "Type",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "UserModifiedDate",
        displayName: "User Modified Date",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },
      {
        key: "VersionLabel",
        displayName: "Version Label",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "VersionDescription",
        displayName: "Version Description",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
    ],
    dropdownList: "FinancialSupportingDocIdentifier",
  },
};
