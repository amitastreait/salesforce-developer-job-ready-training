/**
 * Calculation Utilities
 * Import as: import CalcUtils from 'c/calculationUtils'
 */

class CalculationUtils {
    
    // Basic Math Operations
    add(a, b) {
        return Number(a) + Number(b);
    }

    subtract(a, b) {
        return Number(a) - Number(b);
    }

    multiply(a, b) {
        return Number(a) * Number(b);
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Cannot divide by zero');
        }
        return Number(a) / Number(b);
    }

    // Percentage Calculations
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return (Number(value) / Number(total)) * 100;
    }

    percentageOf(number, percentage) {
        return (Number(number) * Number(percentage)) / 100;
    }

    // Financial Calculations
    calculateDiscount(originalPrice, discountPercent) {
        const discount = this.percentageOf(originalPrice, discountPercent);
        return originalPrice - discount;
    }

    calculateTax(amount, taxPercent) {
        return this.percentageOf(amount, taxPercent);
    }

    calculateTotalWithTax(amount, taxPercent) {
        const tax = this.calculateTax(amount, taxPercent);
        return amount + tax;
    }

    // Statistical Operations
    calculateAverage(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        const sum = numbers.reduce((acc, num) => acc + Number(num), 0);
        return sum / numbers.length;
    }

    findMin(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        return Math.min(...numbers);
    }

    findMax(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        return Math.max(...numbers);
    }

    // Rounding
    roundTo(number, decimals = 2) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(number * multiplier) / multiplier;
    }

    // Interest Calculations
    calculateCompoundInterest(principal, rate, years) {
        const rateDecimal = rate / 100;
        return principal * Math.pow(1 + rateDecimal, years);
    }

    calculateSimpleInterest(principal, rate, years) {
        return (principal * rate * years) / 100;
    }

    // EMI Calculation
    calculateEMI(principal, rate, months) {
        const monthlyRate = rate / 12 / 100;
        if (monthlyRate === 0) {
            return principal / months;
        }
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
        return this.roundTo(emi, 2);
    }

    // Business Calculations
    calculatePricePerSqFt(totalPrice, squareFeet) {
        if (squareFeet === 0) return 0;
        return this.roundTo(totalPrice / squareFeet, 2);
    }

    calculateCartTotal(items) {
        if (!Array.isArray(items)) return 0;
        
        return items.reduce((total, item) => {
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 0);
            return total + (price * quantity);
        }, 0);
    }

    calculateCommission(saleAmount, commissionPercent) {
        return this.percentageOf(saleAmount, commissionPercent);
    }

    calculateProfitMargin(sellingPrice, costPrice) {
        if (sellingPrice === 0) return 0;
        const profit = sellingPrice - costPrice;
        return this.calculatePercentage(profit, sellingPrice);
    }

    convertCurrency(amount, exchangeRate) {
        return this.roundTo(amount * exchangeRate, 2);
    }
}

// Export single instance (Singleton pattern)
const calcUtils = new CalculationUtils();
export default calcUtils;

// Also export individual functions for flexibility
export const {
    add,
    subtract,
    multiply,
    divide,
    calculatePercentage,
    percentageOf,
    calculateDiscount,
    calculateTax,
    calculateTotalWithTax,
    calculateAverage,
    findMin,
    findMax,
    roundTo,
    calculateCompoundInterest,
    calculateSimpleInterest,
    calculateEMI,
    calculatePricePerSqFt,
    calculateCartTotal,
    calculateCommission,
    calculateProfitMargin,
    convertCurrency
} = calcUtils;