import crypto from 'crypto';
import bcrypt from "bcrypt";

class secretManager {
    public async generateSecret() {
        return crypto.randomBytes(32).toString('hex');
    }

    public async encryptData(data: string, secret: string) {
        const STATIC_SECRET = process.env.SECRET_AES_KEY;
        const ENCRYPTION_KEY = crypto.createHash('sha256').update(secret + STATIC_SECRET).digest();

        let iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv('aes-256-ctr', ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    public async decryptData(data: string, secret: string) {
        const STATIC_SECRET = process.env.SECRET_AES_KEY;
        const DECRYPTION_KEY = crypto.createHash('sha256').update(secret + STATIC_SECRET).digest();

        let textParts = data.split(':');
        // @ts-ignore
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-ctr', DECRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

    async compareHashData(password: string, password_hash: any) {
        return await bcrypt.compare(password, password_hash);
    }
}

export default new secretManager();