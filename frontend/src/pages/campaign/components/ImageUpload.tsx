import { Upload, X } from "lucide-react";

interface ImageUploadProps {
    previewUrls: string[];
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
}

export function ImageUpload({
    previewUrls,
    onImageChange,
    onRemoveImage,
}: ImageUploadProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-text mb-2">
                Campaign Images *
            </label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-light text-xs font-medium rounded">
                                Cover Image
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => onRemoveImage(index)}
                            className="absolute top-2 right-2 p-1 bg-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4 text-light" />
                        </button>
                    </div>
                ))}
                {previewUrls.length < 4 && (
                    <label className="relative flex items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <div className="text-center">
                            <Upload className="mx-auto w-8 h-8 text-text-secondary" />
                            <span className="mt-2 block text-sm font-medium text-text-secondary">
                                Add Image
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </label>
                )}
            </div>
            <p className="mt-2 text-sm text-text-secondary">
                Add up to 4 images. First image will be the cover image.
            </p>
        </div>
    );
}
