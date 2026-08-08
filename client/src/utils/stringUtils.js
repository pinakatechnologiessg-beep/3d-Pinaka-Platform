export const generateProductSlug = (name) => {
    if (!name) return '';
    // Replace all non-alphanumeric characters with a hyphen
    // Then replace multiple consecutive hyphens with a single hyphen
    // Finally trim hyphens from the start and end
    return name
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
