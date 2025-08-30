export declare class S3Service {
    uploadImage(file: Express.Multer.File, folder?: string): Promise<string>;
    deleteImage(key: string): Promise<{
        deleted: boolean;
    }>;
}
