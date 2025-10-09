/**
 * Data Manipulation Utility Functions
 * Provides reusable data manipulation functions
 */

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by property
 * @param {Array} array - Array to group
 * @param {String} key - Property to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

/**
 * Sort array by property
 * @param {Array} array - Array to sort
 * @param {String} key - Property to sort by
 * @param {String} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export function sortBy(array, key, direction = 'asc') {
    if (!Array.isArray(array)) return [];
    
    const cloned = [...array];
    const multiplier = direction === 'asc' ? 1 : -1;
    
    return cloned.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        return (aVal > bVal ? 1 : -1) * multiplier;
    });
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @param {String} key - Optional key for object arrays
 * @returns {Array} Array without duplicates
 */
export function removeDuplicates(array, key = null) {
    if (!Array.isArray(array)) return [];
    
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    
    return [...new Set(array)];
}

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {String} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered array
 */
export function filterBySearch(array, searchTerm, searchFields) {
    if (!Array.isArray(array) || !searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            if (!value) return false;
            return String(value).toLowerCase().includes(term);
        });
    });
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {Number} size - Size of each chunk
 * @returns {Array} Array of chunks
 */
export function chunkArray(array, size) {
    if (!Array.isArray(array)) return [];
    
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Find item by property value
 * @param {Array} array - Array to search
 * @param {String} key - Property key
 * @param {*} value - Value to find
 * @returns {Object|null} Found item or null
 */
export function findByProperty(array, key, value) {
    if (!Array.isArray(array)) return null;
    return array.find(item => item[key] === value) || null;
}

/**
 * Flatten nested array
 * @param {Array} array - Array to flatten
 * @returns {Array} Flattened array
 */
export function flattenArray(array) {
    if (!Array.isArray(array)) return [];
    return array.flat(Infinity);
}

/**
 * Get unique values from array
 * @param {Array} array - Array to process
 * @param {String} key - Optional key for object arrays
 * @returns {Array} Array of unique values
 */
export function getUniqueValues(array, key = null) {
    if (!Array.isArray(array)) return [];
    
    if (key) {
        return [...new Set(array.map(item => item[key]))];
    }
    
    return [...new Set(array)];
}

/**
 * Merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function mergeObjects(target, source) {
    return { ...target, ...source };
}

/**
 * Pick specific properties from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} New object with picked properties
 */
export function pickProperties(obj, keys) {
    if (!obj) return {};
    
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

/**
 * Omit specific properties from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} New object without omitted properties
 */
export function omitProperties(obj, keys) {
    if (!obj) return {};
    
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}