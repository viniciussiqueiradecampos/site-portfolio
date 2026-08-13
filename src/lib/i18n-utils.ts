export const formatTranslatable = (en: string, pt: string) => {
    if (!pt) return en;
    return `${en} || ${pt}`;
};

export const parseTranslatable = (text: string, lang: string) => {
    if (!text) return '';
    const parts = text.split(' || ');
    if (parts.length < 2) return text;
    const isPt = lang && lang.toLowerCase().startsWith('pt');
    return isPt ? (parts[1] || parts[0]) : parts[0];
};

export const getTranslationParts = (text: string) => {
    if (!text) return { en: '', pt: '' };
    const parts = text.split(' || ');
    if (parts.length < 2) return { en: text, pt: '' };
    return { en: parts[0], pt: parts[1] };
};
