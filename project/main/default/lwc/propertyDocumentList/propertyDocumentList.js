import { LightningElement, api } from 'lwc';
import { generateUrl } from 'lightning/fileDownload';
import { NavigationMixin } from 'lightning/navigation';

export default class PropertyDocumentList extends NavigationMixin(LightningElement) {
    @api documents = [];

    // Handle View Document
    handleViewDocument(event) {
        const documentId = event.currentTarget.dataset.id;
        const fileId = event.currentTarget.dataset.fileId;

        console.log('View Document - documentId:', documentId, 'fileId:', fileId);

        if (fileId) {
            // Navigate to file preview using NavigationMixin
            this[NavigationMixin.Navigate]({
                type: 'standard__namedPage',
                attributes: {
                    pageName: 'filePreview'
                },
                state: {
                    recordIds: fileId,
                    selectedRecordId: fileId
                }
            });
        } else {
            console.error('No file ID found for document:', documentId);
        }
    }

    // Handle Download Document
    handleDownloadDocument(event) {
        const fileId = event.currentTarget.dataset.fileId;

        console.log('Download Document - fileId:', fileId);

        if (fileId) {
            try {
                const url = generateUrl(fileId);
                window.open(url, '_blank');
            } catch (error) {
                console.error('Error downloading file:', error);
            }
        } else {
            console.error('No file ID found for download');
        }
    }

    // Getter for checking if documents exist
    get hasDocuments() {
        return this.documents && this.documents.length > 0;
    }
}