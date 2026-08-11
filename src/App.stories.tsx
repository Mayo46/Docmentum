import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import DocumentWrapper from "./components/DocumentWrapper";

const graphToken =
  "eyJ0eXAiOiJKV1QiLCJub25jZSI6IktlVTR2TkZ0dU1UbUJOc2kzU2NsYjFBOWEzNEIwWXIyX3ZvcEdxYmNDT0kiLCJhbGciOiJSUzI1NiIsIng1dCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSIsImtpZCI6ImZFdHFyaEtUMWJYQUdhZlNkUW9OMXZYVFJwSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg2NDM1Nzk1LCJuYmYiOjE3ODY0MzU3OTUsImV4cCI6MTc4NjQ0MTQyMiwiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsicDEiLCJjMSIsInBmZHIiXSwiYWlvIjoiQVpRQWEvOGNBQUFBS0xNemVhbm11MDVlSzRJN29pbExOYk1tbkpFbXZTcnhENVVvRVBjK2dhMkhGYTdOcEx2NllXMVpma1pnL2dQU1AwQ1Zzb3EvNUQ5emw3TmI5a2JmdHViZ01DWllkdGlWNzdLWUZ4QW1nUkRLYTI5a2h3WWRYWU5lb3V5SnF2clVDSENha2Jhem5RMnZ6OVpvWGEySFdwZk9FaEtHTmlncTg4UG5WOFYwY05RU1hsSi9FcnFzRk5aRDJybm11TnIyIiwiYWx0c2VjaWQiOiI1OjoxMDAzMjAwNEI2MzU5NzJGIiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJHMiBEb2NzIFJlc291cmNlIFVJIE5vblByb2QiLCJhcHBpZCI6ImIxMzA1MTMxLWU3MjItNGFkYS05NTAzLWNkYzY3Zjk3MzA3MCIsImFwcGlkYWNyIjoiMCIsImVtYWlsIjoibXViYXNoaXIuYWx0YWZAZ2VuZXJhbHN0YXIuY29tIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZGE1NWExN2MtOTA2YS00ZWRhLTgyMzktMThmZWNiNjAyOTY1LyIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjUyLjE1MS4yMjguMTE0IiwibmFtZSI6Ik11YmFzaGlyIEFsdGFmIChDb25zdWx0YW50KSIsIm9pZCI6IjllMTgxOTM3LWFlYWItNGExMi05ZDU4LWI4ZDIxZjQ3YzA4YSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNUUzMkMyMzhFIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFGWmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWQiOiIwMGJiMWE4OS00YTgzLTc3MTQtZjJhOS0xZTk3ZGFlYjhhZDUiLCJzaWduaW5fc3RhdGUiOlsiaW5rbm93bm50d2siXSwic3ViIjoiUVdPNzdZY3FSMXVXWVJNd3gwdFNubzN5WHdoU0cyMzlLZ3NVd1JyNk1uMCIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJOQSIsInRpZCI6IjJmMjU5MWEyLTFjZjItNDZhYS05OWQ4LTg5NDY3NjU5NjVjOSIsInVuaXF1ZV9uYW1lIjoibXViYXNoaXIuYWx0YWZAZ2VuZXJhbHN0YXIuY29tIiwidXRpIjoiQmxsaG9yTEhqVTJKc3lGeTB5SWFBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19hY2QiOjE3NjE5MDQ5OTQsInhtc19hY3RfZmN0IjoiMyA5IiwieG1zX2Z0ZCI6IkNJSXZrcEZmZXlwaGxiaE9SbmJ4b0pWampsVUlNLW85cHROcDYyNEVJLWNCZFhOemIzVjBhQzFrYzIxeiIsInhtc19pZHJlbCI6IjUgNiIsInhtc19wZnRleHAiOjE3ODY1Mjc4MjIsInhtc19zdCI6eyJzdWIiOiJwcUVwN0dXME43TE03VHJUdmFRX3BoVEF2TU1hS000UjhfM0txYkJVYUdJIn0sInhtc19zdWJfZmN0IjoiMTYgMyIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjEwIDMifQ.HYsFwX2kmuaUjAaRpgHR_TQ2D-Ahbi-mHUOZo3gtj4spCvyJxgSfJ8tLsqHdxUMleUepMJYMGZ4YarZaJ8lSNuZMZTT_ckXltbpVJfoHkv9F6KCgr83JWcrFYpbnJpptl65ttHYPY1eyNfgEvLldvvIPnFcvV-8kjHmpsVYMFfM6xr39BnG4WIslKG3UU-OjooZIwS2QEgbXGf2Rq1rzPBYH8XWHZFhdMlACvu07VwSIzfSGJ3z75WpGSPhak5rEaVhSmPSNMcjP6snnawJ5TdwBHClNBa7DdUofJXnR7eVfTp-weDePtUGWlAcPrb-T2q1Dq0n8s6vRrrKhnhi-ug";
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
