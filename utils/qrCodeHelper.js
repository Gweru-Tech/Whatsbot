/**
 * QR Code Helper Utilities
 */

class QRCodeHelper {
    /**
     * Generate ASCII QR code for terminal
     * @param {string} qrData - QR code data
     * @returns {string} - ASCII representation
     */
    static generateASCII(qrData) {
        // This is handled by qrcode-terminal package
        return qrData;
    }

    /**
     * Generate QR code URL for web display
     * @param {string} qrData - QR code data
     * @returns {string} - QR code image URL
     */
    static generateImageURL(qrData) {
        // Use a QR code API service
        const encodedData = encodeURIComponent(qrData);
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;
    }

    /**
     * Check if QR code is still valid
     * @param {Date} generatedAt - When QR was generated
     * @returns {boolean} - Is valid
     */
    static isQRValid(generatedAt) {
        const now = new Date();
        const diffMinutes = (now - generatedAt) / 1000 / 60;
        // QR codes typically expire after 2 minutes
        return diffMinutes < 2;
    }
}

module.exports = QRCodeHelper;
