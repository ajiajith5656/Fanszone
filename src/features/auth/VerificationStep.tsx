import { useState, useRef } from "react";
import "../../styles/auth-flow.css";
import "../../styles/verification.css";

type VerificationStepProps = {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
};

export default function VerificationStep({
  onNext,
  onSkip,
  onBack,
}: VerificationStepProps) {
  const [ageProof, setAgeProof] = useState<File | null>(null);
  const [ageProofPreview, setAgeProofPreview] = useState<string>("");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleAgeProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setAgeProof(file);
    setAgeProofPreview(URL.createObjectURL(file));
    setError("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera access.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelfie(file);
          setSelfiePreview(URL.createObjectURL(file));
          stopCamera();
        }
      }, "image/jpeg");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!ageProof) {
      setError("Please upload age proof document");
      return;
    }

    if (!selfie) {
      setError("Please capture a live selfie");
      return;
    }

    setUploading(true);

    try {
      // Mock upload - UI only
      await new Promise(resolve => setTimeout(resolve, 1000));
      onNext();
    } catch (err: any) {
      setError("Verification upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Verify your identity</h1>
      </header>

      <main className="flow-card verification-card">
        <p className="helper-text">
          Get verified to build trust and unlock more features
        </p>

        <div className="verification-section">
          <h3>Age Proof</h3>
          <p className="sub-text">Upload Aadhaar or any government-issued ID</p>

          {ageProofPreview ? (
            <div className="document-preview">
              <img src={ageProofPreview} alt="Age proof" />
              <button
                type="button"
                className="remove-btn"
                onClick={() => {
                  setAgeProof(null);
                  setAgeProofPreview("");
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleAgeProofUpload}
                hidden
              />
              Upload document
            </label>
          )}
        </div>

        <div className="verification-section">
          <h3>Live Selfie</h3>
          <p className="sub-text">Take a photo to verify your face</p>

          {selfiePreview ? (
            <div className="document-preview">
              <img src={selfiePreview} alt="Selfie" />
              <button
                type="button"
                className="remove-btn"
                onClick={() => {
                  setSelfie(null);
                  setSelfiePreview("");
                }}
              >
                Retake
              </button>
            </div>
          ) : cameraActive ? (
            <div className="camera-container">
              <video ref={videoRef} autoPlay playsInline />
              <canvas ref={canvasRef} hidden />
              <div className="camera-controls">
                <button
                  type="button"
                  className="capture-btn"
                  onClick={capturePhoto}
                >
                  Capture
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={stopCamera}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="upload-btn"
              onClick={startCamera}
            >
              Open camera
            </button>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          className="primary-button"
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? "Submitting..." : "Submit for verification"}
        </button>

        <button
          className="ghost-button"
          type="button"
          onClick={onSkip}
          disabled={uploading}
        >
          Skip for now
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
