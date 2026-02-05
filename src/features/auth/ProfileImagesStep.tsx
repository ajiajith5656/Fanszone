import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import "../../styles/auth-flow.css";
import "../../styles/image-upload.css";

type ProfileImagesStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function ProfileImagesStep({
  onNext,
  onBack,
}: ProfileImagesStepProps) {
  const { signupData, updateSignupData } = useAuth();
  const [images, setImages] = useState<File[]>(signupData.images || []);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const validateImage = (file: File): boolean => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Each image must be under 10MB");
      return false;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return false;
    }

    return true;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of acceptedFiles) {
      if (validateImage(file)) {
        if (images.length + validFiles.length >= 10) {
          setError("Maximum 10 images allowed");
          break;
        }

        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
    disabled: images.length >= 10,
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    setError("");

    if (images.length < 3) {
      setError("Please upload at least 3 images");
      return;
    }

    setUploading(true);

    try {
      // Upload images to backend
      for (let i = 0; i < images.length; i++) {
        await apiService.uploadProfileImage(images[i], i);
      }

      updateSignupData({ images });
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to upload images. Please try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Add your photos</h1>
      </header>

      <main className="flow-card">
        <p className="helper-text">
          Upload 3-10 photos • Max 10MB each • Recommended: 1080×1350px
        </p>

        <div className="image-grid">
          {previews.map((preview, index) => (
            <div key={index} className="image-preview">
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeImage(index)}
              >
                ×
              </button>
              {index === 0 && <span className="primary-badge">Primary</span>}
            </div>
          ))}

          {images.length < 10 && (
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop images here...</p>
              ) : (
                <div className="dropzone-content">
                  <span className="upload-icon">+</span>
                  <p>Add photo</p>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="count-text">
          {images.length} of 10 photos • {images.length < 3 ? `${3 - images.length} more required` : "Ready to continue"}
        </p>

        {error && <p className="error-text">{error}</p>}

        <button
          className="primary-button"
          type="button"
          onClick={handleNext}
          disabled={uploading || images.length < 3}
        >
          {uploading ? "Uploading..." : "Next"}
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={onBack}
          disabled={uploading}
        >
          Back
        </button>
      </main>
    </div>
  );
}
