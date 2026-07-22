export type DocumentLibraryActions = {
  editDocumentProperties?: boolean;
  checkinDocuments?: boolean;
  checkoutDocuments?: boolean;
  cancelDocumentCheckout?: boolean;
  deleteDocuments?: boolean;
  exportDocuments?: boolean;
  copyDocumentUrls?: boolean;
  addDocumentsToFavorites?: boolean;
  removeDocumentsToFavorites?: boolean;
  bulkUpdateClaimIDForSelectedDocuments?: boolean;
};