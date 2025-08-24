// Camera utilities for exam image capture
import { captureWithHandDetection, validateHandGesture } from './handDetection';

export interface CameraOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  quality?: number;
  deviceId?: string;
}

export class CameraCapture {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;

  constructor(
    private videoElement: HTMLVideoElement,
    private canvasElement: HTMLCanvasElement
  ) {
    this.video = videoElement;
    this.canvas = canvasElement;
  }

  async startCamera(options: CameraOptions = {}): Promise<void> {
    const {
      width = 640,
      height = 480,
      facingMode = 'user',
      deviceId
    } = options;

    try {
      const videoConstraints: MediaTrackConstraints = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: width }, height: { ideal: height } }
        : { width: { ideal: width }, height: { ideal: height }, facingMode };

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      if (this.video) {
        this.video.srcObject = this.stream;

        // Wait for metadata so videoWidth/videoHeight are available
        await new Promise<void>((resolve, reject) => {
          const v = this.video!;
          const onReady = () => {
            v.removeEventListener('loadedmetadata', onReady);
            v.removeEventListener('canplay', onReady);
            resolve();
          };
          const onError = (e: Event) => {
            v.removeEventListener('error', onError);
            reject(new Error('Video element failed to load stream'));
          };

          if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
            resolve();
          } else {
            v.addEventListener('loadedmetadata', onReady, { once: true });
            v.addEventListener('canplay', onReady, { once: true });
            v.addEventListener('error', onError, { once: true });
          }
        });

        await this.video.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  }

  captureImage(quality: number = 0.8, cropToHand: boolean = true): {
    image: string | null;
    handDetected: boolean;
    validation?: { isValid: boolean; confidence: number; feedback: string }
  } {
    if (!this.video || !this.canvas) {
      throw new Error('Video or canvas element not found');
    }

    if (cropToHand) {
      // Use advanced hand detection and cropping
      const result = captureWithHandDetection(this.video, this.canvas, quality);

      if (result.image) {
        // Validate the captured hand gesture
        const validation = validateHandGesture(this.canvas);
        return {
          image: result.image,
          handDetected: result.handDetected,
          validation
        };
      }

      return { image: null, handDetected: false };
    } else {
      // Original full-frame capture
      const context = this.canvas.getContext('2d');
      if (!context) {
        throw new Error('Unable to get canvas context');
      }

      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      return {
        image: this.canvas.toDataURL('image/jpeg', quality),
        handDetected: false
      };
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  async uploadImage(imageData: string, questionId: number, setId: number): Promise<string> {
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          questionId,
          setId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }
}

// Helper function to check camera support
export function isCameraSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Helper function to request camera permissions
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

// Helper function to compress image
export function compressImage(
  imageData: string,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.src = imageData;
  });
}

// Utility for image validation
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use JPEG, PNG, or WebP images.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please use images smaller than 5MB.'
    };
  }

  return { valid: true };
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
