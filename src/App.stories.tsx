import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import DocumentWrapper from './components/DocumentWrapper'


const graphToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IndPSnVLYWtZSnZ6RmVGNFd4cS1ONndsVW80VTNudDgwdzJMUXFWNGFBWGsiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0NjMxMTkzLCJuYmYiOjE3ODQ2MzExOTMsImV4cCI6MTc4NDYzNTczMSwiYWNjdCI6MSwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFaUUFhLzhjQUFBQTM0cFNVbGZ6bWs5dW9GbFZzeTA2NllOcWtxS2xoclNjR0FyK2srdDdwVEZZb1VPempLUHJDVS96SHp5Sk5yejFrczQyVkxJRjlIQ0ZMTkhYYkt3c3VKNU93bVFPNVV6Y2xsV0h4c2NGOFB2WWprbEZxcm1xSCtNeVREbUpwNlBVem1ZSkxSTHVzUUo3TmIrejNNZ3B1RWJ6UGJjMFBPRnE1WFJsaGVPRkk4NHRsRktLeG5LNUNZa0NHSWFpbDhBTCIsImFsdHNlY2lkIjoiNTo6MTAwMzIwMDIwQTZDRENFRiIsImFtciI6WyJwd2QiLCJyc2EiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRzIgRG9jcyBSZXNvdXJjZSBVSSBOb25Qcm9kIiwiYXBwaWQiOiJiMTMwNTEzMS1lNzIyLTRhZGEtOTUwMy1jZGM2N2Y5NzMwNzAiLCJhcHBpZGFjciI6IjAiLCJlbWFpbCI6IlNhYWQuU2hhaEBnZW5lcmFsc3Rhci5jb20iLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kYTU1YTE3Yy05MDZhLTRlZGEtODIzOS0xOGZlY2I2MDI5NjUvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiOC4zNi4xOTIuNCIsIm5hbWUiOiJTYWFkIFNoYWggKENvbnN1bHRhbnQpIiwib2lkIjoiMTVmMWU2ZDktZjgzMC00MDgzLWE5NjktMWMzNDM0MmNmOTgyIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA1RUE4MzAxOUUiLCJyaCI6IjEuQVdNQm9wRWxMX0ljcWthWjJJbEdkbGxseVFNQUFBQUFBQUFBd0FBQUFBQUFBQUJBQWExakFRLiIsInNjcCI6IkRpcmVjdG9yeS5SZWFkLkFsbCBGaWxlcy5SZWFkIEZpbGVzLlJlYWQuQWxsIEZpbGVzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBTaXRlcy5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLlNlYXJjaC5BbGwgU2l0ZXMuU2VsZWN0ZWQgVGVybVN0b3JlLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZFdyaXRlLkFsbCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwM2U5Nzg5LWU1MGQtZjJlZi1mNDlkLWNjNTZlMzFmMDdmYSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6Ill3WWhtUzJ0QlJlWEdFWXdUS2xfTWc5QVVTWEtnV1EtLXh1MDFpY0ZxRFEiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkiLCJ1bmlxdWVfbmFtZSI6IlNhYWQuU2hhaEBnZW5lcmFsc3Rhci5jb20iLCJ1dGkiOiIzNEkxbVNsRGhrQzBrcHlVcE50aEFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyIxM2JkMWM3Mi02ZjRhLTRkY2YtOTg1Zi0xOGQzYjgwZjIwOGEiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiI5IDMiLCJ4bXNfZnRkIjoiR0FxNVhFTFpqYWhIUWR2UGFneVo5UjVKNkMwR0JNTUYwOEpkeE45TFpGTUJkWE51YjNKMGFDMWtjMjF6IiwieG1zX2lkcmVsIjoiMjAgNSIsInhtc19wZnRleHAiOjE3ODQ3MjIxMzEsInhtc19zdCI6eyJzdWIiOiJBWnRCTFFYNTh0NzhpZkFtT2h1aUp2NTFJVnV2eUFVTzhjWlFLaVZOSjY0In0sInhtc19zdWJfZmN0IjoiMyAxMCIsInhtc190Y2R0IjoxNzUyNTg2MTA5LCJ4bXNfdG50X2ZjdCI6IjggMyJ9.Tjh0EKTgSEeD3R9c2U87MWPRl2ZgB1kbPE3xIfS1N_aYg8_4b-eUESoGlY0z6s1vM56DhC9pEXvRX33uvB7Bpn_BElSyYUy_t-yieFiXcLajNyL5kukJWIer6jlYa2HqnIExu-9jPTiTkTb7oW7OhLhIYCYXU2dIsmZgnx54gC73d1b__-BaMu4RXTChetNzHRRu5_xE_BPVnqn4BUS5nHhs2uJ66QAqtV90IEaSUCsQvwfN1WnGrD1NS91jOPZu_ouf8RFiaWjDv1tKsQwa6DL7Q4V0Tiyczbzmi3SGHptnp2Vvd_4vC7o1FnwDMWdTifvIypW7lewqOx-3DUwGVA";
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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6Iklkc1NqMUw0dXVpVFFaMzNFeFliVUFGM1lwMGRnVG9uTERTSnpRdmlCSDAiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0NzEyMzgyLCJuYmYiOjE3ODQ3MTIzODIsImV4cCI6MTc4NDcxNzA1OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQS9lM0tyYmR5N0NqVjFmZllaVEE5MWtUbER1Z0s1em5JQVUwcmRBZnE3VkpDS3ljbmZVT2NUdHNHMDRMS2pWdVpVd0NRNjRNcjhJNGJKMFQvTmowS2N3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJ3MUVnbXgwLWdVU01wSTFNTVA2T0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiazhoSFZTMTNpWVY4YXN6aFUta0tfNFJMUnFTZU4wWUwxM0lKUGo4UkI4d0JkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxNiAxIiwieG1zX3BmdGV4cCI6MTc4NDgwMzQ1OSwieG1zX3N1Yl9mY3QiOiIzIDEwIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMyAxMCJ9.DfZuaMPw3LzzfaQHfm1ETPKig6a32C5Exc1TbcelXnFzlWYbQeuxByPCqzFf_03Ep-vEVNvbSYD6jTQ9-IbbVslp01FcrZUA6eDleULQwpRIBdDixGYuF7h-CBESttTGjqVc0ibvEll82o7S5OMAKANWhfBn_VFPj_qay_6wEptKFmNJY-Uv0kHGEwJWWLYAD6g0J2SVUveZnz97WKzSabo2A86WqGd1DqORccYg1mEEHiNWU_c36a8hO_eqeCE54L0KcUKginSrVamwETuch5k4TAEACrc1_-CmFLmL5-EgXIudr-5FXssIvAuwq9FHiH-sLv2c8NUb4Mg0vzDxhQ",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-Dev",
    listName: "G2IndexingUnderwriting",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "MubashirTest",

    spUserId: 46,
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
    columns: `ID,
    Name,
    CheckoutUser,
    ContentType,
    Queue,
    Modified,
    Created,
    CreatedBy,
  `,

    showToolbar: true,
    showActions: true,
    showBreadcrumb: true,
    showUploadControls: false,
    showRowCheckbox: true,
    dashboardName: "Library Home",
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
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6Iklkc1NqMUw0dXVpVFFaMzNFeFliVUFGM1lwMGRnVG9uTERTSnpRdmlCSDAiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0NzEyMzgyLCJuYmYiOjE3ODQ3MTIzODIsImV4cCI6MTc4NDcxNzA1OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQS9lM0tyYmR5N0NqVjFmZllaVEE5MWtUbER1Z0s1em5JQVUwcmRBZnE3VkpDS3ljbmZVT2NUdHNHMDRMS2pWdVpVd0NRNjRNcjhJNGJKMFQvTmowS2N3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJ3MUVnbXgwLWdVU01wSTFNTVA2T0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiazhoSFZTMTNpWVY4YXN6aFUta0tfNFJMUnFTZU4wWUwxM0lKUGo4UkI4d0JkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxNiAxIiwieG1zX3BmdGV4cCI6MTc4NDgwMzQ1OSwieG1zX3N1Yl9mY3QiOiIzIDEwIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMyAxMCJ9.DfZuaMPw3LzzfaQHfm1ETPKig6a32C5Exc1TbcelXnFzlWYbQeuxByPCqzFf_03Ep-vEVNvbSYD6jTQ9-IbbVslp01FcrZUA6eDleULQwpRIBdDixGYuF7h-CBESttTGjqVc0ibvEll82o7S5OMAKANWhfBn_VFPj_qay_6wEptKFmNJY-Uv0kHGEwJWWLYAD6g0J2SVUveZnz97WKzSabo2A86WqGd1DqORccYg1mEEHiNWU_c36a8hO_eqeCE54L0KcUKginSrVamwETuch5k4TAEACrc1_-CmFLmL5-EgXIudr-5FXssIvAuwq9FHiH-sLv2c8NUb4Mg0vzDxhQ",

    // siteUrl: "https://genre.sharepoint.com/sites/G2Applications-DEV/FormsLibrary",
    // listName: "Documents",
    // documentSetName: "0001e60e-fb02-41ba-8df2-2889dea2b692/Forms",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",

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

    listName: "G2IndexingUnderwriting",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",

    // checkout columns
    columns: `
    Name,
    CheckedOutMachineName,
    ClaimID,
    ContractID,
    CheckedOut,
    checkoutUserEmail,
    ClaimsG2,
    CheckoutUser,
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

    // spUserId: 46
  }
}

export const Checkout: Story = {
  args: {
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6Iklkc1NqMUw0dXVpVFFaMzNFeFliVUFGM1lwMGRnVG9uTERTSnpRdmlCSDAiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0NzEyMzgyLCJuYmYiOjE3ODQ3MTIzODIsImV4cCI6MTc4NDcxNzA1OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQS9lM0tyYmR5N0NqVjFmZllaVEE5MWtUbER1Z0s1em5JQVUwcmRBZnE3VkpDS3ljbmZVT2NUdHNHMDRMS2pWdVpVd0NRNjRNcjhJNGJKMFQvTmowS2N3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJ3MUVnbXgwLWdVU01wSTFNTVA2T0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiazhoSFZTMTNpWVY4YXN6aFUta0tfNFJMUnFTZU4wWUwxM0lKUGo4UkI4d0JkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxNiAxIiwieG1zX3BmdGV4cCI6MTc4NDgwMzQ1OSwieG1zX3N1Yl9mY3QiOiIzIDEwIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMyAxMCJ9.DfZuaMPw3LzzfaQHfm1ETPKig6a32C5Exc1TbcelXnFzlWYbQeuxByPCqzFf_03Ep-vEVNvbSYD6jTQ9-IbbVslp01FcrZUA6eDleULQwpRIBdDixGYuF7h-CBESttTGjqVc0ibvEll82o7S5OMAKANWhfBn_VFPj_qay_6wEptKFmNJY-Uv0kHGEwJWWLYAD6g0J2SVUveZnz97WKzSabo2A86WqGd1DqORccYg1mEEHiNWU_c36a8hO_eqeCE54L0KcUKginSrVamwETuch5k4TAEACrc1_-CmFLmL5-EgXIudr-5FXssIvAuwq9FHiH-sLv2c8NUb4Mg0vzDxhQ",
    siteUrl: "https://genstargenesis.sharepoint.com/sites/Indexing-dev",
    listName: "G2IndexingUnderwriting",
    contentTypesLibrary: "ContentTypesLibraryTest",
    documentSetName: "",
    spUserId: 43,
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
    dashboardName: "Checkout",

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
export const Favorite: Story = {
  args: {
    graphToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6Iklkc1NqMUw0dXVpVFFaMzNFeFliVUFGM1lwMGRnVG9uTERTSnpRdmlCSDAiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSIsImtpZCI6ImFGa21LVkZjLTRXVjZzWENCdk5aa1hJNTA1WSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZjI1OTFhMi0xY2YyLTQ2YWEtOTlkOC04OTQ2NzY1OTY1YzkvIiwiaWF0IjoxNzg0NzEyMzgyLCJuYmYiOjE3ODQ3MTIzODIsImV4cCI6MTc4NDcxNzA1OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsiYzEiLCJwZmRyIl0sImFpbyI6IkFVUUF1LzhjQUFBQS9lM0tyYmR5N0NqVjFmZllaVEE5MWtUbER1Z0s1em5JQVUwcmRBZnE3VkpDS3ljbmZVT2NUdHNHMDRMS2pWdVpVd0NRNjRNcjhJNGJKMFQvTmowS2N3PT0iLCJhbXIiOlsicHdkIiwicnNhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkcyIERvY3MgUmVzb3VyY2UgVUkgTm9uUHJvZCIsImFwcGlkIjoiYjEzMDUxMzEtZTcyMi00YWRhLTk1MDMtY2RjNjdmOTczMDcwIiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJjYTZhOWZhNy1iZTdlLTRjNTAtODgxYS01OWRiODJiZDBjYWIiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI1Mi4xNTEuMjI4LjExNCIsIm5hbWUiOiJNdWJhc2hpciBBbHRhZiIsIm9pZCI6ImVmNThjM2UxLTIxMDEtNDc4Mi1iM2NmLWQ5YWFkODBjM2QxYSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwNEUxQzQ2QzNBIiwicmgiOiIxLkFXTUJvcEVsTF9JY3FrYVoySWxHZGxsbHlRTUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFLVmpBUS4iLCJzY3AiOiJEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZCBGaWxlcy5SZWFkLkFsbCBGaWxlcy5SZWFkV3JpdGUgR3JvdXAuUmVhZC5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5TZWFyY2guQWxsIFNpdGVzLlNlbGVjdGVkIFRlcm1TdG9yZS5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWQiOiIwMDQxMmY5YS1mZjY1LTVmYTktMDMwNC1hYWJmMDRjMzEyODciLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJ6NlB2RGNYS2l1T0llOGNidzdFQ3dKSk1YQTB5QW9uc1VFdkFqbzBENnE4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiMmYyNTkxYTItMWNmMi00NmFhLTk5ZDgtODk0Njc2NTk2NWM5IiwidW5pcXVlX25hbWUiOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJtdWJhc2hpci5hbHRhZkBnZW5zdGFyZ2VuZXNpcy5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJ3MUVnbXgwLWdVU01wSTFNTVA2T0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjZCI6MTc2MTkwNDk5NCwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiazhoSFZTMTNpWVY4YXN6aFUta0tfNFJMUnFTZU4wWUwxM0lKUGo4UkI4d0JkWE5sWVhOMExXUnpiWE0iLCJ4bXNfaWRyZWwiOiIxNiAxIiwieG1zX3BmdGV4cCI6MTc4NDgwMzQ1OSwieG1zX3N1Yl9mY3QiOiIzIDEwIiwieG1zX3RjZHQiOjE3NTI1ODYxMDksInhtc190bnRfZmN0IjoiMyAxMCJ9.DfZuaMPw3LzzfaQHfm1ETPKig6a32C5Exc1TbcelXnFzlWYbQeuxByPCqzFf_03Ep-vEVNvbSYD6jTQ9-IbbVslp01FcrZUA6eDleULQwpRIBdDixGYuF7h-CBESttTGjqVc0ibvEll82o7S5OMAKANWhfBn_VFPj_qay_6wEptKFmNJY-Uv0kHGEwJWWLYAD6g0J2SVUveZnz97WKzSabo2A86WqGd1DqORccYg1mEEHiNWU_c36a8hO_eqeCE54L0KcUKginSrVamwETuch5k4TAEACrc1_-CmFLmL5-EgXIudr-5FXssIvAuwq9FHiH-sLv2c8NUb4Mg0vzDxhQ",
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


