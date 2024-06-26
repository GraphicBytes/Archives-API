import Encrypt from './Encrypt.js';
import Logger from './Logger.js';
import { AxiosPOST } from './Axios.js';
import SubmissionHelpers from '../helpers/Submission.js';

const logger = new Logger('External');

export async function triggerLoadingDockProcessing(fileID, platform, publicFile = 0) {
    try {
        let userGroup;

        switch (platform) {
            case "######":
                userGroup = 'vfimjmw491ef1a8';
                break;

            default:
                userGroup = 'vfimjuy695768f5';
                break;
        }

        const loadingDockEndpoint = `${process.env.LOADING_DOCK}/process-file/`;
        const networkPassPhrase = Encrypt.encrypt(process.env.NETWORK_SUPER_USER_PASSPHRASE, process.env.NETWORK_PRIMARY_ENCRYPTION_KEY);
        
        const postData = {
            networkPassPhrase: networkPassPhrase,
            filePlatform: platform,
            fileID: fileID,
            fileUserGroup: userGroup,
            bePublic: publicFile
        };

        const result = await AxiosPOST(postData, loadingDockEndpoint);

        console.log('Loading Dock file processing result: ', result);
    } catch (error) {
        console.error('Loading Dock file processing error: ', error);

        logger.log(`Loading Dock file processing error: ${error}`);
    }
}

export async function sendToSwitchBoard(platform, formAdminData, submissionId, submissionData) {
    const formApiTriggers = formAdminData?.data?.formState?.apiTriggers;
    const qrCodeURL = `${process.env.WAREHOUSE_URL}/qr-code/${submissionId}.png`;

    if (formApiTriggers) {
        formApiTriggers.forEach(async (trigger) => {
            if (trigger?.apiDetails?.active) {
                let passed = true;
                let apiObjFields = {};

                if (trigger?.triggerConditions) {
                    passed = await SubmissionHelpers.validateTriggerConditions(submissionData, trigger?.triggerConditions);
                }

                if (!passed) {
                    return;
                }

                trigger.fieldLinks.forEach(link => {
                    if (submissionData[link.fieldName]) {
                        apiObjFields[link.thirdPartyFieldName] = submissionData[link.fieldName].value;
                    }

                    if (link.fieldName === 'qrCode' && link.thirdPartyFieldName) {
                        apiObjFields[link.thirdPartyFieldName] = qrCodeURL;
                    }
                });

                try {
                    const switchBoardEndpoint = `${process.env.SWITCH_BOARD}/push-to-api/${platform}/`;
                    const networkPassPhrase = Encrypt.encrypt(process.env.NETWORK_SUPER_USER_PASSPHRASE, process.env.NETWORK_PRIMARY_ENCRYPTION_KEY);

                    const postData = {
                        networkPassPhrase: networkPassPhrase,
                        apiType: trigger?.apiDetails?.type,
                        queueData: {
                            apiAccount: "emeardb3279c88b",
                            workspaceID: trigger?.apiDetails?.workspaceID,
                            listID: trigger?.apiDetails?.listID,
                            valuePairs: apiObjFields
                        }
                    };

                    const result = await AxiosPOST(postData, switchBoardEndpoint);

                    console.log('Switchboard request result: ', result);
                } catch (error) {
                    console.error('Switchboard request error: ', error);

                    logger.log(`Switchboard request error: ${error}`);
                }
            }
        });
    }
}