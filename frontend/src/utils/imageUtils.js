/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise that resolves to base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // reader.result contains the base64 string
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convert multiple files to base64 strings
 * @param {File[]} files - Array of files to convert
 * @returns {Promise<string[]>} - Promise that resolves to array of base64 strings
 */
export const filesToBase64 = async (files) => {
  const base64Promises = files.map(file => fileToBase64(file));
  return Promise.all(base64Promises);
};

