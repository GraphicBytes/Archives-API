export function camelCaseToLowercase(camelCaseString) {
    return camelCaseString
        // Insert a space before all caps
        .replace(/([A-Z])/g, ' $1')
        // Uppercase the first character and make the rest lowercase
        .toLowerCase();
}