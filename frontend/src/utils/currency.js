/**
 * Formats a number as a currency string.
 * @param {number} amount - The amount to format.
 * @returns {string} - The formatted currency string (e.g., "Tk 1,200").
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '';

    // You can change 'Tk' to 'BDT' or '$' here to update it globally
    const currencySymbol = 'Tk';

    // Optional: Use Intl.NumberFormat for better formatting (commas, decimals)
    // return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount).replace('BDT', 'Tk');

    // Simple implementation as requested
    return `${currencySymbol} ${Math.round(amount)}`;
};
