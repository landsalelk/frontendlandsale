// Image Upload Service for Property Listings
import { getStorage, BUCKETS } from '../../../lib/appwrite/client';
import { ID } from 'appwrite';

export interface UploadedImage {
    id: string;
    url: string;
    name: string;
    size: number;
}

export class ImageUploadService {
    private static instance: ImageUploadService;
    private pendingImages: UploadedImage[] = [];

    static getInstance(): ImageUploadService {
        if (!ImageUploadService.instance) {
            ImageUploadService.instance = new ImageUploadService();
        }
        return ImageUploadService.instance;
    }

    // Convert base64 to File object
    private base64ToFile(base64: string, filename: string, mimeType: string): File {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], filename, { type: mimeType });
    }

    // Upload a single image from base64
    async uploadImageFromBase64(
        base64Data: string,
        filename: string,
        mimeType: string
    ): Promise<UploadedImage | null> {
        try {
            const storage = getStorage();
            const file = this.base64ToFile(base64Data, filename, mimeType);

            // Generate unique ID
            const fileId = ID.unique();

            // Upload to Appwrite storage
            const response = await storage.createFile(
                BUCKETS.LISTING_IMAGES,
                fileId,
                file
            );

            // Get the file URL
            const fileUrl = storage.getFileView(BUCKETS.LISTING_IMAGES, response.$id);

            const uploadedImage: UploadedImage = {
                id: response.$id,
                url: fileUrl.toString(),
                name: filename,
                size: file.size
            };

            // Add to pending images
            this.pendingImages.push(uploadedImage);

            return uploadedImage;
        } catch (error) {
            console.error('Failed to upload image:', error);
            return null;
        }
    }

    // Upload multiple images
    async uploadMultipleImages(
        images: Array<{ base64: string; filename: string; mimeType: string }>
    ): Promise<UploadedImage[]> {
        const results: UploadedImage[] = [];

        for (const image of images) {
            const result = await this.uploadImageFromBase64(
                image.base64,
                image.filename,
                image.mimeType
            );
            if (result) {
                results.push(result);
            }
        }

        return results;
    }

    // Get all pending images for current listing
    getPendingImages(): UploadedImage[] {
        return [...this.pendingImages];
    }

    // Get image URLs only
    getPendingImageUrls(): string[] {
        return this.pendingImages.map(img => img.url);
    }

    // Clear pending images after publishing
    clearPendingImages(): void {
        this.pendingImages = [];
    }

    // Remove a pending image
    async removePendingImage(imageId: string): Promise<boolean> {
        try {
            const storage = getStorage();

            // Delete from storage
            await storage.deleteFile(BUCKETS.LISTING_IMAGES, imageId);

            // Remove from pending list
            this.pendingImages = this.pendingImages.filter(img => img.id !== imageId);

            return true;
        } catch (error) {
            console.error('Failed to remove image:', error);
            return false;
        }
    }

    // Get image count
    getImageCount(): number {
        return this.pendingImages.length;
    }
}

export default ImageUploadService;
