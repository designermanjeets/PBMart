const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { STORAGE_TYPE, UPLOAD_DIR, S3_CONFIG } = require('../config');
const { createLogger } = require('../utils/logger');
const logger = createLogger('file-storage-service');

class FileStorageService {
    constructor() {
        // Create upload directory if it doesn't exist (for local storage)
        if (STORAGE_TYPE === 'local') {
            if (!fs.existsSync(UPLOAD_DIR)) {
                fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            }
        }
        
        // Initialize S3 client if using S3
        if (STORAGE_TYPE === 's3') {
            this.s3 = new AWS.S3({
                region: S3_CONFIG.region,
                accessKeyId: S3_CONFIG.accessKey,
                secretAccessKey: S3_CONFIG.secretKey
            });
        }
    }
    
    async uploadFile(file, folder = 'documents') {
        try {
            if (STORAGE_TYPE === 'local') {
                return this.uploadLocal(file, folder);
            } else if (STORAGE_TYPE === 's3') {
                return this.uploadS3(file, folder);
            } else {
                throw new Error(`Unsupported storage type: ${STORAGE_TYPE}`);
            }
        } catch (error) {
            logger.error(`Error uploading file: ${error.message}`);
            throw error;
        }
    }
    
    async uploadLocal(file, folder) {
        try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const folderPath = path.join(UPLOAD_DIR, folder);
            
            // Create folder if it doesn't exist
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            
            const filePath = path.join(folderPath, fileName);
            
            // Write file to disk
            fs.writeFileSync(filePath, file.buffer);
            
            // Return file URL (relative path)
            return {
                fileName,
                fileUrl: `/${folder}/${fileName}`
            };
        } catch (error) {
            logger.error(`Error uploading file locally: ${error.message}`);
            throw error;
        }
    }
    
    async uploadS3(file, folder) {
        try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const key = `${folder}/${fileName}`;
            
            const params = {
                Bucket: S3_CONFIG.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            };
            
            const result = await this.s3.upload(params).promise();
            
            return {
                fileName,
                fileUrl: result.Location
            };
        } catch (error) {
            logger.error(`Error uploading file to S3: ${error.message}`);
            throw error;
        }
    }
    
    async deleteFile(fileUrl) {
        try {
            if (STORAGE_TYPE === 'local') {
                return this.deleteLocal(fileUrl);
            } else if (STORAGE_TYPE === 's3') {
                return this.deleteS3(fileUrl);
            } else {
                throw new Error(`Unsupported storage type: ${STORAGE_TYPE}`);
            }
        } catch (error) {
            logger.error(`Error deleting file: ${error.message}`);
            throw error;
        }
    }
    
    async deleteLocal(fileUrl) {
        try {
            // Convert URL to file path
            const filePath = path.join(UPLOAD_DIR, fileUrl.replace(/^\//, ''));
            
            // Check if file exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            return true;
        } catch (error) {
            logger.error(`Error deleting local file: ${error.message}`);
            throw error;
        }
    }
    
    async deleteS3(fileUrl) {
        try {
            // Extract key from URL
            const key = fileUrl.split('/').slice(3).join('/');
            
            const params = {
                Bucket: S3_CONFIG.bucketName,
                Key: key
            };
            
            await this.s3.deleteObject(params).promise();
            
            return true;
        } catch (error) {
            logger.error(`Error deleting S3 file: ${error.message}`);
            throw error;
        }
    }
}

module.exports = FileStorageService; 