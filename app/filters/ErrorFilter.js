import { StatusCodes } from 'http-status-codes';
import { camelCaseToLowercase } from '../helpers/TextTransform.js';

export function ErrorMessageFilter(error) {
    let errorMessage;

    switch (error.name) {
        case 'ValidationError':
            errorMessage = 'Error: ';

            for (let field in error.errors) {
                switch (error?.errors?.[field]?.path) {
                    case 'formTitle':
                        errorMessage += 'Please enter a Form Title';
                        break;

                    default:
                        errorMessage += ` ${error.errors[field].message}`;
                        break;
                }
            }

            break;

        case 'CastError':
            errorMessage = 'Invalid data format.';

            break;

        case 'MongoServerError':
            if (error.code === 11000) {
                const duplicateField = Object.keys(error.keyValue)[0];
                const duplicateValue = error.keyValue[duplicateField];

                errorMessage = `The ${camelCaseToLowercase(duplicateField)} "${duplicateValue}" already exists`;
            }

            break;

        default:
            errorMessage = 'An unexpected error occurred.';

            break;
    }

    error.status = StatusCodes.BAD_REQUEST;

    return errorMessage;
}