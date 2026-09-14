import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6Im9OdHpIS3BZeXU5R1d6bWpvTDVacHBFcGdRdkF5ZTJaNmljSkVaenJuNGciLCJhbGciOiJSUzI1NiIsIng1dCI6IlQ1aDQwcTdHMHg0OXFuNDFsTTkta0tqcEQ5OCIsImtpZCI6IlQ1aDQwcTdHMHg0OXFuNDFsTTkta0tqcEQ5OCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg5MzYzNzM5LCJuYmYiOjE3ODkzNjM3MzksImV4cCI6MTc4OTM2ODcxNiwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJwZmRyIl0sImFpbyI6IkFZUUFlLzhlQUFBQTh2ZGkrRTAwWjRtdnNxejFpcHlzM1c5Z0pqNjZWUXFabUpWOUExRGYxOERzc00zbXNvemdzZlViUDhuaWNCTnN5ZFRobnJMdGgxMHdyS3N3QnhBbHlpeGtodnZsb3cxcFUvZVZab25GcTVMSDJjZklCa1gwMHZvNHFqZk94RlJOZWFpcEhBY2xxaHprOVE4RndTcUljdWFMOGVyeEFkb3Zjc3B1TFJ1N2Z0az0iLCJhbHRzZWNpZCI6IjU6OjEwMDMyMDA0QjYzNTk3MkYiLCJhbXIiOlsicHdkIiwicnNhIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJlN2Q1NmI4Mi1kYmZlLTRjOWYtOWY3MS0xOGMyYjkzZGM1ZGYiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiAoQ29uc3VsdGFudCkiLCJvaWQiOiJiMjI0ZWEwZi04M2NlLTRjMGMtYTkxNi1kM2JlN2UyNmRjMGQiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDYzQjE5NUIzMCIsInJoIjoiMS5BV01Cb3BFbExfSWNxa2FaMklsR2RsbGx5UU1BQUFBQUFBQUF3QUFBQUFBQUFBQUFBRlpqQVEuIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIEZpbGVzLlJlYWQgRmlsZXMuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFNpdGVzLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuU2VhcmNoLkFsbCBTaXRlcy5TZWxlY3RlZCBUZXJtU3RvcmUuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgVXNlci5SZWFkV3JpdGUuQWxsIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDA3ZDRlM2EtOGZkMC00MWYxLTQwZTYtYWQyZjA3ZjE2MWExIiwic2lnbmluX3N0YXRlIjpbImR2Y19tbmdkIiwiZHZjX2NtcCIsImlua25vd25udHdrIl0sInN1YiI6IlFXTzc3WWNxUjF1V1lSTXd4MHRTbm8zeVh3aFNHMjM5S2dzVXdScjZNbjAiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkiLCJ1bmlxdWVfbmFtZSI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsInV0aSI6InVHOEpEcGx2djAyelZKZUppY18zQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfYWNkIjoxNzYxOTA0OTk0LCJ4bXNfYWN0X2ZjdCI6IjMgOSIsInhtc19mdGQiOiJkRUV3ZzBRSUIwcDRvdEFmYkhXZTZINFVjYUpsbVlEanhjdl9jeGQ3eWtnQmRYTmxZWE4wTFdSemJYTSIsInhtc19pZHJlbCI6IjEgMjAiLCJ4bXNfcGZ0ZXhwIjoxNzg5NDU1MTE2LCJ4bXNfc3QiOnsic3ViIjoicHFFcDdHVzBON0xNN1RyVHZhUV9waFRBdk1NYUtNNFI4XzNLcWJCVWFHSSJ9LCJ4bXNfc3ViX2ZjdCI6IjMgNiIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjMgMTIifQ.dPgNuMYz7RYgJm1b8oLAp8b1RskqCuFH4otOkOm4lyeTv-SZPdXoV36Fwev3d6iRc6HHQ8t5vUdWmz1dlZIqd6eY3I3WwgsS3Y9RZVTGxdLg1-zDz3TTcsDmmDMsqfxqsDq72q0qpz-U50wtOkIeRuv_uFdS0d7quizxAMjgNaC81o6u5Wtue8CmCQSZTzwe7P1G-5sW4PGqTTSuauEW2OfjgOmxYPLsxPhJtPC_aGpqHoX_q1oLyZQqaElnKn55NnsdJVWJmV2XvcQ4qkFk1e6V1H5PWY507DmJuwRzGOxSdSMlWnU49w3cUrbHWunskYxTCWrj9NIDk1PTyfgEmw";
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
    //   "DocumentName": "",
    //   "ClaimID": "",
    //   "SubCategory": "",
    //   "Category": "",
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
    userEmail: "Mubashir.Altaf@GENERALSTAR.COM",
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
    // editableProperties: {
    //   DocumentType: "",
    //   DocumentName: "",
    //   ReceivedDate: "",
    //   SubCategory: "",
    //   Category: "",
    //   ClaimWorkflow: "",
    //   Recipient: "",
    //   SendNotification: "",
    //   Comments: "",
    //   ClaimID: "",
    //   CheckedOutDate: "",
    //   CheckedOutBy: "",
    // },
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
        displayName: "Received Date",
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
        key: "Recipient",
        displayName: "Recipient",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "text",
      },
      {
        key: "SendNotification",
        displayName: "Send Notification",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "boolean",
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
        key: "ClaimIDSelection",
        displayName: "Claim ID Selection",
        group: "claim",
        readOnly: true,
        required: false,
        columnType: "text",
      },
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
        key: "Companies",
        displayName: "Genre Company",
        group: "claim",
        readOnly: true,
        required: true,
        columnType: "text",
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
        key: "Recipient",
        displayName: "Recipient",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "text",
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
