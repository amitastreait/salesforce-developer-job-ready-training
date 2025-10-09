import { LightningElement } from 'lwc';

// Method 1: Import entire module as namespace
import * as CalcUtils from 'c/calculationUtils';

// Or Method 2: Import default export
// import CalcUtils from 'c/calculationUtils';

export default class PropertyCalculator extends LightningElement {
    propertyPrice = 500000;
    downPaymentPercent = 20;
    interestRate = 7.5;
    loanTenure = 240; // months
    maintenancePerSqFt = 5;
    squareFeet = 1200;
    taxPercent = 1.5;
    
    results = {};

    connectedCallback() {
        this.calculateAll();
    }

    calculateAll() {
        // Calculate down payment
        const downPayment = CalcUtils.percentageOf(
            this.propertyPrice, 
            this.downPaymentPercent
        );
        
        // Calculate loan amount
        const loanAmount = CalcUtils.subtract(this.propertyPrice, downPayment);
        
        // Calculate EMI
        const emi = CalcUtils.calculateEMI(
            loanAmount, 
            this.interestRate, 
            this.loanTenure
        );
        
        // Calculate total payment
        const totalPayment = CalcUtils.multiply(emi, this.loanTenure);
        
        // Calculate total interest
        const totalInterest = CalcUtils.subtract(totalPayment, loanAmount);
        
        // Calculate price per sqft
        const pricePerSqFt = CalcUtils.calculatePricePerSqFt(
            this.propertyPrice, 
            this.squareFeet
        );
        
        // Calculate annual maintenance
        const annualMaintenance = CalcUtils.multiply(
            this.maintenancePerSqFt, 
            this.squareFeet
        );
        const monthlyMaintenance = CalcUtils.divide(annualMaintenance, 12);
        
        // Calculate property tax
        const propertyTax = CalcUtils.calculateTax(
            this.propertyPrice, 
            this.taxPercent
        );
        const monthlyTax = CalcUtils.divide(propertyTax, 12);
        
        // Calculate total monthly cost
        const totalMonthlyCost = CalcUtils.add(
            CalcUtils.add(emi, monthlyMaintenance),
            monthlyTax
        );
        
        // Calculate affordability metrics
        const threeYearCost = CalcUtils.multiply(totalMonthlyCost, 36);
        const fiveYearCost = CalcUtils.multiply(totalMonthlyCost, 60);
        const tenYearCost = CalcUtils.multiply(totalMonthlyCost, 120);
        
        // Store results
        this.results = {
            downPayment: CalcUtils.roundTo(downPayment, 2),
            loanAmount: CalcUtils.roundTo(loanAmount, 2),
            emi: CalcUtils.roundTo(emi, 2),
            totalPayment: CalcUtils.roundTo(totalPayment, 2),
            totalInterest: CalcUtils.roundTo(totalInterest, 2),
            pricePerSqFt: CalcUtils.roundTo(pricePerSqFt, 2),
            monthlyMaintenance: CalcUtils.roundTo(monthlyMaintenance, 2),
            monthlyTax: CalcUtils.roundTo(monthlyTax, 2),
            totalMonthlyCost: CalcUtils.roundTo(totalMonthlyCost, 2),
            threeYearCost: CalcUtils.roundTo(threeYearCost, 2),
            fiveYearCost: CalcUtils.roundTo(fiveYearCost, 2),
            tenYearCost: CalcUtils.roundTo(tenYearCost, 2)
        };
    }

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = Number(event.target.value);
        this.calculateAll();
    }

    // Getters for display
    get displayDownPayment() {
        return `$${this.results.downPayment?.toLocaleString() || 0}`;
    }

    get displayLoanAmount() {
        return `$${this.results.loanAmount?.toLocaleString() || 0}`;
    }

    get displayEMI() {
        return `$${this.results.emi?.toLocaleString() || 0}`;
    }

    get displayTotalPayment() {
        return `$${this.results.totalPayment?.toLocaleString() || 0}`;
    }

    get displayTotalInterest() {
        return `$${this.results.totalInterest?.toLocaleString() || 0}`;
    }

    get displayPricePerSqFt() {
        return `$${this.results.pricePerSqFt || 0}`;
    }

    get displayTotalMonthlyCost() {
        return `$${this.results.totalMonthlyCost?.toLocaleString() || 0}`;
    }

    get displayThreeYearCost() {
        return `$${this.results.threeYearCost?.toLocaleString() || 0}`;
    }

    get displayFiveYearCost() {
        return `$${this.results.fiveYearCost?.toLocaleString() || 0}`;
    }

    get displayTenYearCost() {
        return `$${this.results.tenYearCost?.toLocaleString() || 0}`;
    }
}