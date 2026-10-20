import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6IldKX053UndvSTZ1V3JhNkR0UjlaSHI3am10cFhaajVxRWRsSTFmZ3FXb3MiLCJhbGciOiJSUzI1NiIsIng1dCI6InJ5QngtNjVqTm94SDRGUUhfNnphck5qYU5mNCIsImtpZCI6InJ5QngtNjVqTm94SDRGUUhfNnphck5qYU5mNCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzkyNDk2NzUzLCJuYmYiOjE3OTI0OTY3NTMsImV4cCI6MTc5MjUwMDgxOCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJwZmRyIl0sImFpbyI6IkFiUUFTLzhlQUFBQUlNcndmNVZoa2dWY2ZBRzhXWDNFMTNMcytqN3haV1Jqb0JQempkUnlkb3ptcXBWL2l4aVlVdG1wMmpYeXppMUtYMEVXSE8wa2JSTk1pTGo5N0NxZUJUam1ZeHFFVUVwTkM4TzNGb0pCai9yWEROeHorZXRBNXB1VkdRQTZ4OEo2Z3FyVVJWU0pVOFpWdE5LSFhYbUcvazhGUHhqUEx6elVQazNUWkJHUXo1NkFZdGx3c0REcHhaN3VKMkhjbHBSM3hrWkxPYWFUTTd0NUhwdisxelZ0aGd6QWVHSmtrT0R3WUs3bjRvcHVTZFE9IiwiYWx0c2VjaWQiOiI1OjoxMDAzMjAwNEI2MzU5NzJGIiwiYW1yIjpbInB3ZCIsInJzYSIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHMiBEb2NzIFJlc291cmNlIFVJIE5vblByb2QiLCJhcHBpZCI6ImIxMzA1MTMxLWU3MjItNGFkYS05NTAzLWNkYzY3Zjk3MzA3MCIsImFwcGlkYWNyIjoiMCIsImRldmljZWlkIjoiZTdkNTZiODItZGJmZS00YzlmLTlmNzEtMThjMmI5M2RjNWRmIiwiZW1haWwiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kYTU1YTE3Yy05MDZhLTRlZGEtODIzOS0xOGZlY2I2MDI5NjUvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiNTIuMTUxLjIyOC4xMTQiLCJuYW1lIjoiTXViYXNoaXIgQWx0YWYgKENvbnN1bHRhbnQpIiwib2lkIjoiYjIyNGVhMGYtODNjZS00YzBjLWE5MTYtZDNiZTdlMjZkYzBkIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA2M0IxOTVCMzAiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUFBQUZaakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwN2Q0ZTNhLThmZDAtNDFmMS00MGU2LWFkMmYwN2YxNjFhMSIsInNpZ25pbl9zdGF0ZSI6WyJkdmNfbW5nZCIsImR2Y19jbXAiLCJpbmtub3dubnR3ayJdLCJzdWIiOiJRV083N1ljcVIxdVdZUk13eDB0U25vM3lYd2hTRzIzOUtnc1V3UnI2TW4wIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiJidEVWN0h4U2FFRzRJaTM4aDBfTkFnIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiI5IDMiLCJ4bXNfYXVkX2d1aWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJ4bXNfZnRkIjoiMUVlZ1lxeGNCa25nRVFQUXNCLXRWcm5ja0ZPTkc0QlNhNnI0S2hHSGF1SUJkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiI0IDEiLCJ4bXNfcGZ0ZXhwIjoxNzkyNTg3MjE4LCJ4bXNfc3QiOnsic3ViIjoicHFFcDdHVzBON0xNN1RyVHZhUV9waFRBdk1NYUtNNFI4XzNLcWJCVWFHSSJ9LCJ4bXNfc3ViX2ZjdCI6IjMgNiIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjE2IDMifQ.dWRJRXjw7tz61SeFnGJ0WEzfyPJIVSzNLzMseV7UHn8bQnOFvSaYs1ifqMLtAzDkW-fDe9OyfUlgZmPsitEmp6DHzkheBU6MECanwLSRV9xIaINHUA11HCTNx25EkqEc4Puv0sZWYxJyUoA7RdKsb0zLHbAaPzZqgqA-OhuKR9uD_uMRyrRX7wH7p0_-c5BkR_oAwIBKHMRd4AL85l8ozmA2i4LY-v_NMna06atiB0MA5B6tex_JTgxzxJlE-Vme4J7bw2e5bFy7BHoQBgieyyMb2t3h73NFxeKZqDVLWHiqsH4mXX82smmNoxpL2jcPlrr-L-q-Zm4YrjLwIJDFVg";
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
      options: ["Admin", "Viewer", "Importer"],
    },
  },
  args: {
    // Required so Storybook can track selection callbacks when switching controls/args.
    onSelectionChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DocumentWrapper>;

export const ClaimsGenesisDev: Story = {
  args: {
    graphToken: graphToken,

    siteUrl: "https://genstargenesis.sharepoint.com/sites/Claims-Genesis-Dev",

    actions: {
      editDocumentProperties: true,
      bulkUpdateClaimIDForSelectedDocuments: false,
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
    columns:
      "OriginalDocumentName,NamedInsured,ReceivedDate,CheckoutUser,Name,CheckedOutMachineName,ClaimID,StatutoryClaimID,ClaimType,ClaimWorkflow,Comments,DocumentName,Format,DocumentType,Geography,ModifiedDate,ObjectID,FromAddress,ContractID,G2CompanyName,UserModifiedDate,CreationDate,CreatorName,SubCategory,_Category,Recipient,BatchID,IndexOperator,CheckedOutBy,CheckedOutDate",

    showToolbar: true,
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Library",
    userEmail: "mubashir.altaf@generalstar.com",
    userRole: "Admin",
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
      // await myProjectApi.deleteDocuments(itemIds,docSetId);
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
    dropdownList: "claimDocIdentifier",
    notificationUsers: [
      {
        active: true,
        branchID: 0,
        businessPhone: null,
        createdBy: "98c64bd7-eac5-44bd-8fa6-a6cfb5a2a8f8",
        createdDate: "2024-09-27T13:37:36.153",
        emailAddress: "Hasan.Nasir@GENERALSTAR.COM",
        emailSignature: "<p>Test Signature Development<br></p>",
        firstName: "Hasan",
        genServeID: null,
        lastName: "Nasir",
        managerID: null,
        modifiedBy: "caf01fa9-32de-4bae-81c9-2c47c79a1d76",
        modifiedDate: "2025-12-31T13:51:31.917",
        profile: null,
        userDomainID: "GRN\\Hanasir",
        userID: "caf01fa9-32de-4bae-81c9-2c47c79a1d76",
        userRoles: [],
      },
      {
        active: true,
        branchID: 0,
        businessPhone: null,
        createdBy: "6e1d67ad-d1c8-4f9f-8ef4-8f73179013ec",
        createdDate: "2025-02-20T10:27:24.123",
        emailAddress: "junaid.arif@generalstar.com",
        emailSignature: "",
        firstName: "Junaid",
        genServeID: null,
        lastName: "Arif",
        managerID: null,
        modifiedBy: "6e1d67ad-d1c8-4f9f-8ef4-8f73179013ec",
        modifiedDate: "2025-05-09T14:35:12.867",
        profile:
          '{"appPreferences":[{"zipCodes":[{"zipCode":"05450","city":"Enosburg Falls","state":"VT","latitude":44.90107345581055,"longitude":-72.7960433959961,"default":true}],"appTypeID":"5106305D-DB81-4548-A7D7-4DF58A7AE860"}]}',
        userDomainID: "GRN\\junarif",
        userID: "6e1d67ad-d1c8-4f9f-8ef4-8f73179013ec",
        userRoles: [],
      },
    ],
  },
};

export const FinancialSupportingDocumentsDev: Story = {
  args: {
    graphToken: graphToken,
    siteUrl:
      "https://genstargenesis.sharepoint.com/sites/FinancialSupportingDocuments-Dev",
    actions: {
      editDocumentProperties: true,
      bulkUpdateClaimIDForSelectedDocuments: false,
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
    columns: `OriginalDocumentName,DocumentName,Name,DocumentType,_Category,SubCategory,Comments,DateRecieved,Recipients,Function,CompanyName,Sensitivity,
    _Source,Specialization,BatchID,FromAddress,Recipient,CreatedDate,CreatorName,CheckedOutDate,CheckedOutBy,ModifiedDate,ModifiedBy`,

    showToolbar: true,
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: true,
    showRowCheckbox: true,
    dashboardName: "Library",
    userEmail: "Saad.Shah@GENERALSTAR.COM",
    userRole: "Admin",
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
      // await myProjectApi.deleteDocuments(itemIds,docSetId);
    },
    editableProperties: [
      // Document Information
      {
        key: "DocumentType",
        displayName: "Document Type",
        group: "document",
        readOnly: false,
        required: true,
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
        displayName: "Date Received",
        group: "document",
        readOnly: false,
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
        key: "Recipient",
        displayName: "Recipients",
        group: "document",
        readOnly: false,
        required: true,
        columnType: "choice",
      },
      {
        key: "Specialization",
        displayName: "Specialization",
        group: "document",
        readOnly: false,
        required: false,
        columnType: "choice",
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
        key: "Sensitivity",
        displayName: "Sensitivity",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      // Enterprise Information
      {
        key: "DocumentumBatchID",
        displayName: "Documentum Batch ID",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "CreatedBy",
        displayName: "Created By",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "CreatedDate",
        displayName: "Created Date",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "dateTime",
      },
      {
        key: "_source",
        displayName: "Source",
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
        key: "FromAddress",
        displayName: "From Address",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },

      {
        key: "ModifiedBy",
        displayName: "Modified By",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
      {
        key: "Version",
        displayName: "Version",
        group: "enterprise",
        readOnly: true,
        required: false,
        columnType: "text",
      },
    ],
    dropdownList: "FinancialSupportingDocIdentifier",

    notificationUsers: [
      {
        active: true,
        branchID: 0,
        businessPhone: null,
        createdBy: "98c64bd7-eac5-44bd-8fa6-a6cfb5a2a8f8",
        createdDate: "2024-09-27T13:37:36.153",
        emailAddress: "Hasan.Nasir@GENERALSTAR.COM",
        emailSignature: "<p>Test Signature Development<br></p>",
        firstName: "Hasan",
        genServeID: null,
        lastName: "Nasir",
        managerID: null,
        modifiedBy: "caf01fa9-32de-4bae-81c9-2c47c79a1d76",
        modifiedDate: "2025-12-31T13:51:31.917",
        profile: null,
        userDomainID: "GRN\\Hanasir",
        userID: "caf01fa9-32de-4bae-81c9-2c47c79a1d76",
        userRoles: [],
      },
      {
        active: true,
        branchID: 0,
        businessPhone: null,
        createdBy: "6e1d67ad-d1c8-4f9f-8ef4-8f73179013ec",
        createdDate: "2025-02-20T10:27:24.123",
        emailAddress: "junaid.arif@generalstar.com",
        emailSignature: "",
        firstName: "Junaid",
        genServeID: null,
        lastName: "Arif",
        managerID: null,
        modifiedBy: "6e1d67ad-d1c8-4f9f-8ef4-8f73179013ec",
        modifiedDate: "2025-05-09T14:35:12.867",
        profile:
          '{"appPreferences":[{"zipCodes":[{"zipCode":"05450","city":"Enosburg Falls","state":"VT","latitude":44.90107345581055,"longitude":-72.7960433959961,"default":true}],"appTypeID":"5106305D-DB81-4548-A7D7-4DF58A7AE860"}]}',
        userDomainID: "GRN\\junarif",
        userID: "6e1d67ad-d1c8-4f9f-8ef4-8f73179013ec",
        userRoles: [],
      },
    ],
  },
};

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
    columns: `ClaimsG2,ReceivedDate,CheckoutUser,Name,CheckedOutMachineName,
        ClaimID,ContractID,Company,UserModifiedDate,CreationDate,CreatorName,
        SubCategory,Category,BatchID,IndexOperator,CheckedOutBy,CheckedOutDate`,
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
    onDeleteDocuments: async (itemIds: string[], docSetId: string) => {
      console.log("onDeleteDocuments called with:", itemIds, docSetId);
      // await myProjectApi.deleteDocuments(itemIds,docSetId);
    },

    favoriteItemIDs: ["01BLIGMWNBNKNBAJZ4IFAJPAXZBJTVPCNC"],
  },
};
