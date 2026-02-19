import { supabase } from './supabase';

export const storageAPI = {
    /**
     * Upload an image file to Supabase Storage
     * @param file - The file to upload
     * @param folder - Optional folder path (e.g., 'covers', 'gallery')
     * @returns The public URL of the uploaded image
     */
    async uploadImage(
        file: File,
        folder: string = '',
        onProgress?: (progress: number) => void
    ): Promise<string | null> {
        try {
            // Pre-flight size check — 50MB hard limit on client side
            const MAX_SIZE_MB = 50;
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                alert(`❌ Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB.\nO limite máximo é ${MAX_SIZE_MB}MB.`);
                return null;
            }

            console.log(`📤 Uploading file: ${file.name} (Type: ${file.type}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB) to ${folder}`);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = folder ? `${folder}/${fileName}` : fileName;

            const { data, error } = await supabase.storage
                .from('project-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type || 'application/octet-stream',
                    onUploadProgress: (progress: any) => {
                        if (onProgress && progress.total) {
                            const percent = (progress.loaded / progress.total) * 100;
                            onProgress(percent);
                        }
                    }
                } as any);

            if (error) {
                console.error('❌ Supabase Storage Error:', error);

                let errorMsg = `STORAGE ERROR: ${error.message}`;

                // Supabase bucket size limit
                if (error.message?.toLowerCase().includes('size') || error.message?.toLowerCase().includes('exceeded')) {
                    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                    errorMsg = `❌ Upload bloqueado pelo Supabase\n\nO arquivo "${file.name}" tem ${sizeMB}MB e excedeu o limite configurado no bucket.\n\nSolução:\n1. Acesse supabase.com → Storage → project-images → Configurações\n2. Aumente o "File size limit" para 50MB ou mais\n3. Clique em Save e tente novamente`;
                }

                alert(errorMsg);
                return null;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(data.path);

            console.log('✅ Image uploaded successfully:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('❌ Error in uploadImage:', error);
            return null;
        }
    },


    /**
     * Delete an image from Supabase Storage
     * @param url - The public URL of the image to delete
     */
    async deleteImage(url: string): Promise<boolean> {
        try {
            // Extract path from URL
            const urlParts = url.split('/project-images/');
            if (urlParts.length < 2) return false;

            const filePath = urlParts[1];

            const { error } = await supabase.storage
                .from('project-images')
                .remove([filePath]);

            if (error) {
                console.error('Error deleting image:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteImage:', error);
            return false;
        }
    },

    /**
     * Convert File to base64 data URL for preview
     */
    fileToDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};
