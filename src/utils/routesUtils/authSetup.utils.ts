import mysqlConnector from "../mysql.connector";
import secretsManagerUtils from "../secretsManager.utils";

class AuthSetupUtils {
    public async getUserByStartupToken(startupToken: string) {
        const userData = await mysqlConnector.mysqlDB('sso_users').select(['sso_users.name as user_name', 'sso_class.name as className', 'encryptPartialKey']).where({
            startupToken
        }).join('sso_class', 'sso_users.classID', 'sso_class.ID').limit(1).first();

        let decryptedName;

        try {
            decryptedName = await secretsManagerUtils.decryptData(userData.user_name, userData.encryptPartialKey);
        }
        catch {
            return false;
        }

        return {
            name: decryptedName,
            classID: userData.className,
        };
    }

    public async registerUser(startupToken: string, email: string, hashPassword: string, emailHash: string) {
        const userData = await mysqlConnector.mysqlDB('sso_users').select(['encryptPartialKey']).where({
            startupToken
        }).limit(1).first();

        if (!userData) return false;

        const encryptEmail = await secretsManagerUtils.encryptData(email, userData.encryptPartialKey);

        await mysqlConnector.mysqlDB('sso_users').update({
            email: encryptEmail,
            email_hash: emailHash,
            password_hash: hashPassword,
            validatedAt: new Date(),
            startupToken: ''
        }).where({
            startupToken
        });
    }

    public async createNewAccount(name: string, classID: string) {
        const newPartialSecret = await secretsManagerUtils.generateSecret();
        const startupToken = await secretsManagerUtils.generateSecret();

        const encryptName = await secretsManagerUtils.encryptData(name, newPartialSecret);

        await mysqlConnector.mysqlDB('sso_users').insert({
            name: encryptName,
            encryptPartialKey: newPartialSecret,
            autorisations: '[]',
            classID,
            startupToken
        });
    }


}

export default new AuthSetupUtils();