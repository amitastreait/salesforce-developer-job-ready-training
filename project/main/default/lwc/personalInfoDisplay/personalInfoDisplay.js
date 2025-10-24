import { LightningElement, api } from 'lwc';

export default class PersonalInfoDisplay extends LightningElement {
    @api personalInfo = {};

    get displayPhone() {
        return this.personalInfo?.phone || 'Not provided';
    }

    get displayMobile() {
        return this.personalInfo?.mobile || 'Not provided';
    }

    get displayTitle() {
        return this.personalInfo?.title || 'Not provided';
    }

    get displayDepartment() {
        return this.personalInfo?.department || 'Not provided';
    }

    get displayCompany() {
        return this.personalInfo?.company || 'Not provided';
    }

    get displayBirthdate() {
        return this.personalInfo?.birthdate
            ? new Date(this.personalInfo.birthdate).toLocaleDateString()
            : 'Not provided';
    }
}