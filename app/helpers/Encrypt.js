import crypto from 'crypto';
import Logger from './Logger.js';

const logger = new Logger('Token');

class Encrypt {
    static scrambleToken(str, position, numChars) {
        str = str.replace(/==/g, '.');
        str = str.replace(/\//g, '%');
        str = str.replace(/\+/g, '$');
        str = str.replace(/=/g, ':');

        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomCharString = Array.from({ length: numChars }, () => randomChars.charAt(Math.floor(Math.random() * randomChars.length))).join('');

        return str.slice(0, position) + randomCharString + str.slice(position);
    }

    static encrypt(plaintext, key) {
        try {
            const cipher = 'aes-256-gcm';
            const iv = crypto.randomBytes(12);
            const cipherObject = crypto.createCipheriv(cipher, key, iv);

            let ciphertext = cipherObject.update(plaintext, 'utf8', 'base64');
            ciphertext += cipherObject.final('base64');

            const authTag = cipherObject.getAuthTag();
            const preEncrypted = Buffer.concat([iv, authTag, Buffer.from(ciphertext, 'base64')]);

            let encrypted = preEncrypted.toString('base64');

            return this.scrambleToken(encrypted, 9, 17);
        } catch (error) {
            console.error(`Can\'t encrypt string: ${error}`);
            logger.log(`Can\'t encrypt string: ${error}`);
        }
    }
}

export default Encrypt;