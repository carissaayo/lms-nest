export declare const saveImageToDisk: (image: any, userId: string) => Promise<string>;
export declare const saveMultipleImagesS3: (images: any[], path: string, allowDuplicate?: boolean) => Promise<string[] | null>;
export declare const saveImageS3: (image: any, path: string) => Promise<string>;
export declare const saveFileS3: (file: any, path: string) => Promise<string>;
export declare const deleteImageS3: (imageUrl: string) => Promise<void>;
export declare const deleteFileS3: (fileUrl: string) => Promise<void>;
