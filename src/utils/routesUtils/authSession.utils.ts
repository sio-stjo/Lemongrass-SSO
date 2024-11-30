import mysqlConnector from "../mysql.connector";
import secretsManagerUtils from "../secretsManager.utils";
import moment from "moment";

class AuthSessionUtils {
    public async checkUserPassword(email_hash: string, password: string) {
        const userEmail = await mysqlConnector.mysqlDB('sso_users').select(['ID', 'email', 'password_hash']).where({
            email_hash
        }).limit(1).first();

        if (!userEmail) return [false, 0];

        const passwordMatch = await secretsManagerUtils.compareHashData(password, userEmail.password_hash);
        return [passwordMatch, userEmail.ID];
    }

    public async generateAccessToken(IDUser: number) {
        const generatedToken = await secretsManagerUtils.generateSecret();
        const refreshToken = await secretsManagerUtils.generateSecret();
        const timeNow = new Date();

        const timeExpires = moment(timeNow, 'Europe/Paris')
            .add(1, 'days')
            .toDate();

        await mysqlConnector.mysqlDB('sso_tokens').insert({
            IDUser,
            access_token: generatedToken,
            refresh_token: refreshToken,
            createdAt: timeNow,
            expiresInStamp: timeExpires.getTime()
        });

        return {
            access_token: generatedToken,
            refresh_token: refreshToken,
            expiresInStamp: timeExpires.getTime()
        }
    }

    async getUserByToken(token: string, extra?: string) {
        const userData = await mysqlConnector.mysqlDB('sso_tokens').select(['IDUser', 'expiresInStamp']).where({
            access_token: token
        }).limit(1).first();

        if (!userData) return false;

        const parsedTimeStamp = new Date(userData.expiresInStamp);
        if (parsedTimeStamp < new Date()) return false;

        const userAutorisations = await mysqlConnector.mysqlDB('sso_users').select(['sso_users.name as name', 'sso_class.name as sso_class_name', 'encryptPartialKey', 'autorisations', 'email', 'classID']).where('sso_users.ID', userData.IDUser).join('sso_class', 'sso_users.classID', 'sso_class.ID').limit(1).first();

        if (!userAutorisations) return false;

        let parsedAutorisations;
        try {
            parsedAutorisations = JSON.parse(userAutorisations.autorisations);
        }catch {
            return false;
        }

        let decryptedName;
        let decryptedEmail;
        try {
            decryptedName = await secretsManagerUtils.decryptData(userAutorisations.name, userAutorisations.encryptPartialKey);
            decryptedEmail = await secretsManagerUtils.decryptData(userAutorisations.email, userAutorisations.encryptPartialKey);
        }catch {
            return false;
        }

        const dataReturn = {
            IDUser: userData.IDUser,
            name: decryptedName,
            authorization: parsedAutorisations
        };

        if (extra == "true") {
            // @ts-ignore
            dataReturn.classID = userAutorisations.sso_class_name;
            // @ts-ignore
            dataReturn.email = decryptedEmail;
        }

        return dataReturn;
    }

    async verifyRefreshToken(token: string, refresh_token: string, expires_in: string) {
        const userData = await mysqlConnector.mysqlDB('sso_tokens').select(['IDUser', 'expiresInStamp']).where({
            access_token: token,
            refresh_token,
            expiresInStamp: expires_in
        }).limit(1).first();

        if (!userData) return false;

        return {
            IDUser: userData.IDUser
        }
    }

    public async getAllAccounts() {
        const users = await mysqlConnector.mysqlDB('sso_users').select(['sso_users.ID as ID','sso_users.name as name_user', 'sso_class.name as class_name', 'encryptPartialKey', 'autorisations', 'startupToken']).join('sso_class', 'sso_users.classID', 'sso_class.ID');

        const promises = [];
        const parsedUsers: { typeAccount: number; name: string; className: any; }[] = [];

        for (const user of users) {
            promises.push(new Promise(async (resolve, reject) => {
                const userData = {
                    ID: user.ID,
                    typeAccount: 0,
                    name: '',
                    className: user.class_name,
                    onBoarding: (user.startupToken === '')
                };
                let userAutorisations;

                try {
                    userAutorisations = JSON.parse(user.autorisations);
                }catch {
                    userAutorisations = [];
                }

                if (userAutorisations.includes('lemongrass.cupcake.admin')) {
                    userData.typeAccount = 1;
                }

                const decryptName = await secretsManagerUtils.decryptData(user.name_user, user.encryptPartialKey);
                userData.name = decryptName;

                parsedUsers.push(userData);
                resolve(true);
            }));
        }

        await Promise.all(promises);

        return parsedUsers;
    }

    async getAllClass() {
        return await mysqlConnector.mysqlDB('sso_class').select(['ID', 'name']);
    }

    async getUserByID(userID: string) {
        const users = await mysqlConnector.mysqlDB('sso_users').select(['sso_users.ID as ID', 'startupToken', 'sso_users.name as name_user', 'email', 'sso_class.name as class_name', 'validatedAt', 'encryptPartialKey', 'autorisations', 'startupToken']).join('sso_class', 'sso_users.classID', 'sso_class.ID')
            .where({
                'sso_users.ID': userID
            }).limit(1).first();

        if (!users) return false;

        let userAutorisations;
        let nameDecrypted;
        let emailDecrypted;

        try {
            userAutorisations = JSON.parse(users.autorisations);
            nameDecrypted = await secretsManagerUtils.decryptData(users.name_user, users.encryptPartialKey);
            emailDecrypted = await secretsManagerUtils.decryptData(users.email, users.encryptPartialKey);
        }catch {
            userAutorisations = [];
        }

        const userData = {
            IDUser: users.ID,
            name: nameDecrypted,
            email: emailDecrypted,
            classID: users.class_name,
            validatedAt: users.validatedAt,
            authorization: userAutorisations,
            onBoarding: (users.startupToken === ''),
            startupToken: users.startupToken || ''
        };

        return userData;
    }
}

export default new AuthSessionUtils();