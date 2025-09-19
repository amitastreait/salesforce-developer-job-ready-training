import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import recallApprovalSubmission from '@salesforce/apex/RecallApprovalSubmissionController.recallApprovalSubmission';
import getApprovalSubmissionId from '@salesforce/apex/RecallApprovalSubmissionController.getApprovalSubmissionId';

export default class RecallApproval extends NavigationMixin(LightningElement) {
    @api recordId;
    comment = '';
    isLoading = false;
    commentError = '';

    approvalSubmissionId;

    @wire(getApprovalSubmissionId, { recordId: '$recordId' })
    wiredData({ error, data }) {
      if (data && data.success) {
        this.approvalSubmissionId = data.approvalSubmissionId;
      } else if (error) {
         console.error('Error:', error);
      }
    }

    handleCommentChange(event) {
        this.comment = event.target.value;
        if (this.commentError) {
            this.commentError = '';
        }
    }

    validateForm() {
        let isValid = true;
        this.commentError = '';
        if (!this.comment || this.comment.trim().length === 0) {
            this.commentError = 'Comment is required';
            isValid = false;
        } else if (this.comment.trim().length < 10) {
            this.commentError = 'Comment must be at least 10 characters long';
            isValid = false;
        }
        return isValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        this.handleRecallApproval();
    }
    async handleRecallApproval() {
        if (!this.validateForm()) {
            return;
        }
        this.isLoading = true;
        try {
            console.log(this.comment);
            const result = await recallApprovalSubmission({
                approvalSubmissionId: this.approvalSubmissionId,
                comment: this.comment.trim()
            });
            if(result.success){
                this.showToast('Success', result.message || 'Approval recalled successfully', 'success');
                this.comment = '';
                this.handleSuccess();
            }else{
                this.showToast('Error', result.message || 'An error occurred while recalling approval', 'error');
                this.comment = '';
            }
            
        } catch (error) {
            console.error('Error recalling approval:', error);
            let errorMessage = 'An error occurred while recalling approval';
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            this.showToast('Error', errorMessage, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleSuccess() {
        if (this.recordId) {
            this.refreshRecord();
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            duration: 4000
        });
        this.dispatchEvent(event);
    }

    navigateBack() {
        if (this.recordId) {
            this.navigateToRecord(this.recordId);
        } else {
            this[NavigationMixin.Navigate]({
                type: 'standard__namedPage',
                attributes: {
                    pageName: 'home'
                }
            });
        }
    }

    navigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    refreshRecord() {
        this.dispatchEvent(new CustomEvent('refresh'));
    }

    connectedCallback() {
        console.log('RecallApproval component initialized with recordId:', this.recordId);
    }

    errorCallback(error, stack) {
        console.error('Component error:', error, stack);
        this.showToast('Error', 'An unexpected error occurred', 'error');
    }
}