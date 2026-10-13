export function isAttachmentReferenceUsable(uri: string): boolean { return Boolean(uri.trim()) && /^(file|content|ph|assets|https?):/i.test(uri.trim()); }
