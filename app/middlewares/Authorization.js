import Decrypt from '../helpers/Decrypt.js';
import Logger from '../helpers/Logger.js';
import { StatusCodes } from 'http-status-codes';

class Authorization {
    static validatePermissions(groups, requiredPermissions) {
        let qualifiedGroupIDs = [];

        for (let groupId in groups) {
            // console.log(groupId);
            // console.log(groups[groupId].archives);

            if (groups[groupId].hasOwnProperty('archives')) {
                const groupArchivesPermissions = groups[groupId].archives;

                const allPermissionsMet = requiredPermissions.every(permission => groupArchivesPermissions[permission] === 1);

                if (allPermissionsMet) {
                    qualifiedGroupIDs.push(groupId);
                }
            }
        }

        if (qualifiedGroupIDs.length === 0) {
            return false;
        }

        return qualifiedGroupIDs;
    }

    static authorizeEndpointAccess(requiredPermissions) {
        return (req, res, next) => {
            if (!req.headers.hasOwnProperty('user-token')) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "No token provided." });
            }

            const decrypt = Decrypt.decrypt(req.headers['user-token'], process.env.NETWORK_PRIMARY_ENCRYPTION_KEY);

            if (decrypt.valid === false) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid token." });
            }

            req.decryptedToken = JSON.parse(decrypt);
            const decrypted = req.decryptedToken;

            // console.log(decrypted);

            const superUser = decrypted?.super_user && decrypted.super_user === 1 ? true : false;

            if (!superUser) {
                if (!decrypted.hasOwnProperty('privileges') || !Object.keys(decrypted.privileges).length) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized, insufficient permissions.' });
                }

                const groups = decrypted.privileges;
                const validatePermissions = this.validatePermissions(groups, requiredPermissions);

                // console.log(validatePermissions);

                if (validatePermissions === false) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized, insufficient permissions.' });
                }

                req.userGroupsIDs = validatePermissions;
            }

            req.superUser = superUser;

            next();
        }
    }
}

export default Authorization;