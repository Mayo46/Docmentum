import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImlXSXFIRmhjeGRJMUh2VVZnY3RyYzFTbjU3WjlSVkNaNjZOTWJmR1FqdDQiLCJhbGciOiJSUzI1NiIsIng1dCI6IlQ1aDQwcTdHMHg0OXFuNDFsTTkta0tqcEQ5OCIsImtpZCI6IlQ1aDQwcTdHMHg0OXFuNDFsTTkta0tqcEQ5OCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg5NjI0MDE2LCJuYmYiOjE3ODk2MjQwMTYsImV4cCI6MTc4OTYyOTE1NSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJwZmRyIl0sImFpbyI6IkFZUUFlLzhlQUFBQUt5cTFTVktncnZvelZMRERnaVhHNXpSWFl4OG9GMWNhMXYxUnhZWEJxUlFucVhnK1crZTBLYXQ1STNpMVlMMTZDTEsxK0hhK21mdUJuTm84TWlrUDJVTkdIOWlmdHNwTHNMbGZqajE4VERLN3ZTblhWaFpXU2RyQ1RJMVRGaHFVY3hnZ3pZaWl6U21rNGJGQUIzdEw2bFh1RENuckhGTStWTk1IbHk4enhVaz0iLCJhbHRzZWNpZCI6IjU6OjEwMDMyMDA0QjYzNTk3MkYiLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJlN2Q1NmI4Mi1kYmZlLTRjOWYtOWY3MS0xOGMyYjkzZGM1ZGYiLCJlbWFpbCI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2RhNTVhMTdjLTkwNmEtNGVkYS04MjM5LTE4ZmVjYjYwMjk2NS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiAoQ29uc3VsdGFudCkiLCJvaWQiOiJiMjI0ZWEwZi04M2NlLTRjMGMtYTkxNi1kM2JlN2UyNmRjMGQiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDYzQjE5NUIzMCIsInJoIjoiMS5BV01Cb3BFbExfSWNxa2FaMklsR2RsbGx5UU1BQUFBQUFBQUF3QUFBQUFBQUFBQUFBRlpqQVEuIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIEZpbGVzLlJlYWQgRmlsZXMuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFNpdGVzLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuU2VhcmNoLkFsbCBTaXRlcy5TZWxlY3RlZCBUZXJtU3RvcmUuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgVXNlci5SZWFkV3JpdGUuQWxsIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDA3ZDRlM2EtOGZkMC00MWYxLTQwZTYtYWQyZjA3ZjE2MWExIiwic2lnbmluX3N0YXRlIjpbImR2Y19tbmdkIiwiZHZjX2NtcCIsImlua25vd25udHdrIl0sInN1YiI6IlFXTzc3WWNxUjF1V1lSTXd4MHRTbm8zeVh3aFNHMjM5S2dzVXdScjZNbjAiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkiLCJ1bmlxdWVfbmFtZSI6Im11YmFzaGlyLmFsdGFmQGdlbmVyYWxzdGFyLmNvbSIsInV0aSI6IktDY29PclU5dDB5RW41eHA0UlFaQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfYWNkIjoxNzYxOTA0OTk0LCJ4bXNfYWN0X2ZjdCI6IjMgOSIsInhtc19mdGQiOiI5aXMtOEt2RktoTE9xQ3J3QWJSa1UzUzhIeGxIc25wV1NqVGZ4M3BlRHhzQmRYTnpiM1YwYUMxa2MyMXoiLCJ4bXNfaWRyZWwiOiIxIDIwIiwieG1zX3BmdGV4cCI6MTc4OTcxNTU1NSwieG1zX3N0Ijp7InN1YiI6InBxRXA3R1cwTjdMTTdUclR2YVFfcGhUQXZNTWFLTTRSOF8zS3FiQlVhR0kifSwieG1zX3N1Yl9mY3QiOiIxNCAzIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMyAxNiJ9.hxFcqh4pTv8pkv2tnsud39zs2EhcLFowaGWZNY3A51TKiK4OWFilcOFCTkIKDGKQLm6zIEv6B8J7Tyy8LRfxKL9pPiPJ6RC6kZbuAhhMN98KMpgMTZHPN-3Aoppiz4eliY25M2umjHJG2O4JBFmym1VP2yZyyzSYjUAjCoHuzTOSvLZNYGPR_H3tAEEoPsM9mFVqbODLSRnzr7GlTMhGGKQAWG1NX-1iNjQFG6Rt2Cpq9m-G5WtEg3iGwbz8oZQx5Q903VjhxPIZWB9aYNV1hOclRSAaoP7YiTrAr3EO0go1s1hp3Jw6YIjKT-1Vf2JViywW_qHHbohQHN0vtfj_yg";
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
        key: "DateReceived",
        displayName: "Date Received",
        group: "document",
        readOnly: true,
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
