import { LightningElement, track } from 'lwc';

const columns = [
    {
        label: 'Picture',
        fieldName: 'pictureUrl',
        type: 'customPictureType',
        typeAttributes: {
            pictureUrl: { fieldName: 'pictureUrl' },
            context: { fieldName: 'Id' }
        },
        cellAttributes: { alignment: 'center' }
    },
    {
        label: 'Name',
        fieldName: 'name',
        type: 'customLink',
        typeAttributes: {
            recordId: { fieldName: 'Id' },
            nameField: { fieldName: 'name' },
            openUrl: false
        }
    },
    {
        label: 'Email',
        fieldName: 'email',
        type: 'email'
    },
    {
        label: 'Status',
        fieldName: 'status',
        type: 'picklist',
        editable: true,
        typeAttributes: {
            placeholder: 'Choose Status',
            options: { fieldName: 'statusOptions' },
            value: { fieldName: 'status' },
            context: { fieldName: 'Id' },
            variant: 'label-hidden',
            name: 'status',
            label: 'Status'
        }
    },
    {
        label: 'Active',
        fieldName: 'isActive',
        type: 'toggle',
        typeAttributes: {
            value: { fieldName: 'isActive' },
            context: { fieldName: 'Id' }
        }
    },
    {
        label: 'Annual Revenue',
        fieldName: 'revenue',
        type: 'customNumber',
        editable: true,
        typeAttributes: {
            status: 'done',
            currencyCode: 'USD',
            min: 0,
            required: true
        }
    },
    {
        label: 'Discount %',
        fieldName: 'discount',
        type: 'customNumber',
        editable: true,
        typeAttributes: {
            status: 'done',
            percent: true,
            min: 0,
            required: false
        }
    },
    {
        label: 'Account',
        fieldName: 'accountId',
        type: 'lookup',
        editable: true,
        typeAttributes: {
            objectApiName: 'Account',
            label: 'Account',
            placeholder: 'Search Accounts...',
            displayValue: { fieldName: 'accountName' },
            filter: null,
            displayInfo: {
                primaryField: 'Name',
                additionalFields: ['Type']
            },
            matchingInfo: {
                primaryField: { fieldPath: 'Name' },
                additionalFields: [
                    { fieldPath: 'Type' }
                ]
            },
            context: { fieldName: 'Id' }
        }
    }
];

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomTableDemo extends LightningElement {
    columns = columns;
    data = [];
    @track draftValues = [];

    connectedCallback() {
        this.loadDemoData();
    }

    loadDemoData() {
        const statusOptions = [
            { label: 'New', value: 'New' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
            { label: 'On Hold', value: 'On Hold' }
        ];

        this.data = [
            {
                Id: '001',
                name: 'John Smith',
                email: 'john.smith@example.com',
                pictureUrl: 'https://www.lightningdesignsystem.com/assets/images/avatar1.jpg',
                status: 'New',
                statusOptions: statusOptions,
                isActive: true,
                revenue: 150000,
                discount: 10,
                accountId: null,
                accountName: null
            },
            {
                Id: '002',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@example.com',
                pictureUrl: 'https://www.lightningdesignsystem.com/assets/images/avatar2.jpg',
                status: 'In Progress',
                statusOptions: statusOptions,
                isActive: true,
                revenue: 250000,
                discount: 15,
                accountId: null,
                accountName: null
            },
            {
                Id: '003',
                name: 'Michael Brown',
                email: 'michael.brown@example.com',
                pictureUrl: 'https://www.lightningdesignsystem.com/assets/images/avatar3.jpg',
                status: 'Completed',
                statusOptions: statusOptions,
                isActive: false,
                revenue: 180000,
                discount: 5,
                accountId: null,
                accountName: null
            },
            {
                Id: '004',
                name: 'Emily Davis',
                email: 'emily.davis@example.com',
                pictureUrl: 'https://www.lightningdesignsystem.com/assets/images/avatar1.jpg',
                status: 'On Hold',
                statusOptions: statusOptions,
                isActive: true,
                revenue: 320000,
                discount: 20,
                accountId: null,
                accountName: null
            },
            {
                Id: '005',
                name: 'David Wilson',
                email: 'david.wilson@example.com',
                pictureUrl: 'https://www.lightningdesignsystem.com/assets/images/avatar2.jpg',
                status: 'In Progress',
                statusOptions: statusOptions,
                isActive: false,
                revenue: 95000,
                discount: 8,
                accountId: null,
                accountName: null
            }
        ];
    }

    handleSave(event) {
        const draftValues = event.detail.draftValues;

        console.log('Saving Draft Values:', JSON.stringify(draftValues, null, 2));

        const updatedData = this.data.map(row => {
            const draft = draftValues.find(d => d.Id === row.Id);
            if (draft) {
                const updatedRow = { ...row, ...draft };

                // Handle lookup field: Use cached account name if available
                if (draft.accountId && draft.accountId !== row.accountId) {
                    console.log('Account lookup changed for row:', row.Id, 'New Account ID:', draft.accountId);
                    updatedRow.accountName = `Account ${draft.accountId}`;
                }

                return updatedRow;
            }
            return row;
        });

        this.data = updatedData;
        this.draftValues = [];
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Records updated successfully',
                variant: 'success'
            })
        );
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        console.log('Row Action:', action.name, 'Row:', row);
    }

    handleCellChange(event) {
        console.log('Cell Change Event:', JSON.stringify(event.detail));
        const draftValues = event.detail.draftValues;
        if (!draftValues || !Array.isArray(draftValues) || draftValues.length === 0) {
            console.error('Invalid cellchange event. Missing or empty draftValues array');
            return;
        }
        // Process each draft value from the event
        draftValues.forEach(draft => {
            const recordId = draft.Id;
            Object.keys(draft).forEach(fieldName => {
                if (fieldName !== 'Id') {
                    const value = draft[fieldName];
                    console.log('Cell Changed:', fieldName, recordId, value);
                    this.updateDraftValues(recordId, fieldName, value);

                    // Special handling for accountId lookup field
                    if (fieldName === 'accountId' && value) {
                        
                    }
                }
            });
        });
    }

    handleToggleChange(event) {
        console.log('Toggle Event:', JSON.stringify(event.detail));
        const recordId = event.detail.data?.context;
        const value = event.detail.data?.value;
        const fieldName = 'isActive';
        if (!recordId || value === undefined) {
            console.error('Invalid toggle event. Missing required fields:', { recordId, value });
            return;
        }
        this.updateDraftValues(recordId, fieldName, value);
        this.data = this.data.map(row => {
            if (row.Id === recordId) {
                return { ...row, [fieldName]: value };
            }
            return row;
        });
    }

    handleLookupChange(event) {
        console.log('Lookup Event:', JSON.stringify(event.detail));
        const recordId = event.detail?.context;
        const value = event.detail?.value;
        const fieldName = 'accountId';
        if (!recordId || value === undefined) {
            console.error('Invalid lookup event. Missing required fields:', { recordId, value });
            return;
        }
        this.updateDraftValues(recordId, fieldName, value);
        this.data = this.data.map(row => {
            if (row.Id === recordId) {
                return { ...row, [fieldName]: value };
            }
            return row;
        });
    }

    updateDraftValues(recordId, fieldName, value) {
        const existingIndex = this.draftValues.findIndex(item => item.Id === recordId);

        if (existingIndex >= 0) {
            this.draftValues[existingIndex] = {
                ...this.draftValues[existingIndex],
                [fieldName]: value
            };
        } else {
            this.draftValues = [
                ...this.draftValues,
                { Id: recordId, [fieldName]: value }
            ];
        }
        console.log('Updated Draft Values:', JSON.stringify(this.draftValues, null, 2));
    }


    handleLookupSelected(event) {
        console.log('Lookup Selected Event:', JSON.stringify(event.detail));

        const accountId = event.detail.recordId;
        const accountName = event.detail.recordName;

    }
}