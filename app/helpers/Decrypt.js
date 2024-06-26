import crypto from 'crypto';
import Logger from './Logger.js';

const logger = new Logger('Token');

class Decrypt {
    static unScrambleToken(str, position, numChars) {
        let newStr = str.slice(0, position) + str.slice(position + numChars);

        newStr = newStr.replace(/:/g, '=');
        newStr = newStr.replace(/\$/g, '+');
        newStr = newStr.replace(/%/g, '/');
        newStr = newStr.replace(/\./g, '==');

        return newStr;
    }

    static decrypt(ciphertext, key) {
        try {
            let unScrambledToken = this.unScrambleToken(ciphertext, 9, 17)

            const cipher = 'aes-256-gcm';
            const encrypted = Buffer.from(unScrambledToken, 'base64');
            const iv = encrypted.slice(0, 12);
            const authTag = encrypted.slice(12, 28);
            const decipherObject = crypto.createDecipheriv(cipher, key, iv);

            decipherObject.setAuthTag(authTag);

            let ciphertextSliced = encrypted.slice(28);
            let plaintext = decipherObject.update(ciphertextSliced, 'base64', 'utf8');

            plaintext += decipherObject.final('utf8');

            return plaintext;
        } catch (error) {
            logger.log(`Can\'t dencrypt string: ${error}`);

            return {
                valid: false,
                message: error
            };
        }
    }
}

export default Decrypt;