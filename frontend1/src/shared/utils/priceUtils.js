/**
 * Utility functions for price calculations
 * Extracted from multiple components to promote reusability
 */

/**
 * Calculate the original price from discounted price
 * @param {number} price - Current discounted price
 * @param {number} discount - Discount percentage (0-100)
 * @returns {number} - Original price before discount
 */
export const calculateOriginalPrice = (price, discount) => {
  if (discount === 0 || discount === null || discount === undefined) {
    return price;
  }
  return Math.round(price / (1 - discount / 100));
};

/**
 * Calculate discount amount in currency
 * @param {number} price - Current price
 * @param {number} discount - Discount percentage
 * @returns {number} - Savings amount
 */
export const calculateSavings = (price, discount) => {
  const originalPrice = calculateOriginalPrice(price, discount);
  return originalPrice - price;
};

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = '₹') => {
  return `${currency}${price.toLocaleString('en-IN')}`;
};

/**
 * Check if product has a discount
 * @param {number} discount - Discount percentage
 * @returns {boolean} - True if discount exists
 */
export const hasDiscount = (discount) => {
  return discount > 0;
};

/**
 * Calculate price range for filtering
 * @param {string} rangeKey - Range key (e.g., 'under-1000', '1000-5000')
 * @returns {[number, number]} - [min, max] price range
 */
export const getPriceRange = (rangeKey) => {
  const ranges = {
    'under-1000': [0, 1000],
    '1000-5000': [1000, 5000],
    '5000-25000': [5000, 25000],
    'above-25000': [25000, Infinity]
  };
  return ranges[rangeKey] || [0, Infinity];
};

/**
 * Check if price is within range
 * @param {number} price - Price to check
 * @param {string} rangeKey - Range key
 * @returns {boolean} - True if price is in range
 */
export const isPriceInRange = (price, rangeKey) => {
  const [min, max] = getPriceRange(rangeKey);
  return price >= min && price < max;
};
