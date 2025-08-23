// Hand detection utilities for precise cropping
// This module provides hand detection and cropping functionality

export interface HandBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
}

export interface HandDetectionResult {
    hands: HandBounds[];
    success: boolean;
    error?: string;
}

/**
 * Simple hand detection using image analysis
 * This is a basic implementation that can be enhanced with ML libraries
 */
export function detectHandBounds(
    canvas: HTMLCanvasElement,
    videoWidth: number,
    videoHeight: number
): HandDetectionResult {
    try {
        const context = canvas.getContext('2d');
        if (!context) {
            return { hands: [], success: false, error: 'No canvas context' };
        }

        // Create a temporary video element for analysis
        const tempVideo = document.createElement('video');
        tempVideo.width = videoWidth;
        tempVideo.height = videoHeight;

        // Analyze the current frame for hand features (excluding face area)
        const analysis = analyzeForHandFeatures(tempVideo, canvas);

        if (analysis.hasHand && analysis.confidence > 40) {
            // Return a hand area that excludes the top portion (face area)
            const handArea: HandBounds = {
                x: Math.max(0, videoWidth * 0.05),
                y: Math.max(videoHeight * 0.3, videoHeight * 0.1), // Start below face area
                width: Math.min(videoWidth * 0.9, videoWidth - videoWidth * 0.05),
                height: Math.min(videoHeight * 0.6, videoHeight - videoHeight * 0.3), // Exclude top 30%
                confidence: analysis.confidence / 100
            };

            return {
                hands: [handArea],
                success: true
            };
        } else {
            // Fallback to lower-frame detection area when no specific hand detected
            const lowerFrameArea: HandBounds = {
                x: 0,
                y: videoHeight * 0.25, // Start from 25% down to avoid face
                width: videoWidth,
                height: videoHeight * 0.75, // Bottom 75% of frame
                confidence: 0.3
            }; return {
                hands: [lowerFrameArea],
                success: true
            };
        }
    } catch (error) {
        return {
            hands: [],
            success: false,
            error: error instanceof Error ? error.message : 'Detection failed'
        };
    }
}

/**
 * Crop image to focus on detected hand with padding - optimized for anywhere detection
 */
export function cropToHand(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    handBounds: HandBounds,
    padding: number = 40
): string | null {
    try {
        const context = canvas.getContext('2d');
        if (!context) return null;

        // For full-frame detection, use intelligent cropping
        if (handBounds.width >= video.videoWidth * 0.7 || handBounds.height >= video.videoHeight * 0.7) {
            // If bounds cover most of the frame, do a smart center crop
            const cropSize = Math.min(video.videoWidth, video.videoHeight) * 0.8;
            const cropX = (video.videoWidth - cropSize) / 2;
            const cropY = (video.videoHeight - cropSize) / 2;

            canvas.width = cropSize;
            canvas.height = cropSize;

            context.drawImage(
                video,
                cropX, cropY, cropSize, cropSize,
                0, 0, cropSize, cropSize
            );

            return canvas.toDataURL('image/jpeg', 0.9);
        }

        // For specific hand detection, crop around the detected area
        const cropX = Math.max(0, handBounds.x - padding);
        const cropY = Math.max(0, handBounds.y - padding);
        const cropWidth = Math.min(
            video.videoWidth - cropX,
            handBounds.width + (padding * 2)
        );
        const cropHeight = Math.min(
            video.videoHeight - cropY,
            handBounds.height + (padding * 2)
        );

        // Make it square by using the larger dimension
        const cropSize = Math.max(cropWidth, cropHeight);
        const finalCropX = Math.max(0, cropX - (cropSize - cropWidth) / 2);
        const finalCropY = Math.max(0, cropY - (cropSize - cropHeight) / 2);

        // Ensure we don't go outside video bounds
        const adjustedCropX = Math.min(finalCropX, video.videoWidth - cropSize);
        const adjustedCropY = Math.min(finalCropY, video.videoHeight - cropSize);
        const adjustedCropSize = Math.min(cropSize, video.videoWidth - adjustedCropX, video.videoHeight - adjustedCropY);

        // Set canvas to square for consistent hand images
        canvas.width = adjustedCropSize;
        canvas.height = adjustedCropSize;

        // Draw the cropped area
        context.drawImage(
            video,
            adjustedCropX, adjustedCropY, adjustedCropSize, adjustedCropSize,
            0, 0, adjustedCropSize, adjustedCropSize
        );

        return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
        console.error('Error cropping to hand:', error);
        return null;
    }
}

/**
 * Enhanced capture with automatic hand detection and cropping
 */
export function captureWithHandDetection(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    quality: number = 0.8
): { image: string | null; handDetected: boolean; bounds?: HandBounds } {
    try {
        // First, detect hand bounds
        const detection = detectHandBounds(canvas, video.videoWidth, video.videoHeight);

        if (detection.success && detection.hands.length > 0) {
            // Use the first detected hand
            const primaryHand = detection.hands[0];
            const croppedImage = cropToHand(canvas, video, primaryHand, 60);

            return {
                image: croppedImage,
                handDetected: true,
                bounds: primaryHand
            };
        } else {
            // Fallback to center crop if no hand detected
            const context = canvas.getContext('2d');
            if (!context) return { image: null, handDetected: false };

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const cropSize = Math.min(videoWidth, videoHeight) * 0.7;
            const cropX = (videoWidth - cropSize) / 2;
            const cropY = (videoHeight - cropSize) / 2;

            canvas.width = cropSize;
            canvas.height = cropSize;

            context.drawImage(
                video,
                cropX, cropY, cropSize, cropSize,
                0, 0, cropSize, cropSize
            );

            return {
                image: canvas.toDataURL('image/jpeg', quality),
                handDetected: false
            };
        }
    } catch (error) {
        console.error('Error in hand detection capture:', error);
        return { image: null, handDetected: false };
    }
}

/**
 * Validate if the cropped area likely contains a hand gesture
 */
export function validateHandGesture(canvas: HTMLCanvasElement): {
    isValid: boolean;
    confidence: number;
    feedback: string;
} {
    try {
        const context = canvas.getContext('2d');
        if (!context) {
            return {
                isValid: false,
                confidence: 0,
                feedback: 'Unable to analyze image'
            };
        }

        // Basic validation - check if image has sufficient contrast and content
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let totalBrightness = 0;
        let edgePixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = (r + g + b) / 3;

            totalBrightness += brightness;

            // Simple edge detection - look for significant brightness changes
            if (i > 4 && Math.abs(brightness - (pixels[i - 4] + pixels[i - 3] + pixels[i - 2]) / 3) > 30) {
                edgePixels++;
            }
        }

        const avgBrightness = totalBrightness / (pixels.length / 4);
        const edgeRatio = edgePixels / (pixels.length / 4);

        // Determine if image likely contains a hand
        const hasGoodContrast = avgBrightness > 50 && avgBrightness < 200;
        const hasEnoughDetail = edgeRatio > 0.1;

        const confidence = Math.min(
            (hasGoodContrast ? 50 : 20) + (hasEnoughDetail ? 50 : 20),
            100
        );

        return {
            isValid: hasGoodContrast && hasEnoughDetail,
            confidence,
            feedback: hasGoodContrast && hasEnoughDetail
                ? 'Good hand positioning detected'
                : 'Please position your hand more clearly in the frame'
        };
    } catch (error) {
        return {
            isValid: false,
            confidence: 0,
            feedback: 'Unable to validate hand gesture'
        };
    }
}

/**
 * Real-time hand detection for automatic capture
 */
export interface HandDetectionState {
    isDetecting: boolean;
    stableFrames: number;
    lastDetectionTime: number;
    confidence: number;
}

/**
 * Analyze video frame for hand presence using improved hand-specific detection
 */
export function analyzeForHandFeatures(video: HTMLVideoElement, canvas: HTMLCanvasElement): {
    hasHand: boolean;
    confidence: number;
    skinPixels: number;
    edgePixels: number;
} {
    const context = canvas.getContext('2d');
    if (!context) {
        return { hasHand: false, confidence: 0, skinPixels: 0, edgePixels: 0 };
    }

    // Set canvas size and draw current frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let skinPixels = 0;
    let edgePixels = 0;
    let totalPixels = 0;
    let fingerLikePatterns = 0;
    let bestHandRegion = { x: 0, y: 0, score: 0 };

    // Scan frame in regions, but EXCLUDE the top area where faces typically appear
    const stepSize = 6; // Optimized for performance
    const regionSize = 80;
    const regions: Array<{ x: number; y: number; score: number; skinCount: number; edgeCount: number; fingerPatterns: number }> = [];

    // START FROM BELOW THE FACE AREA (exclude top 30% of frame)
    const faceExclusionZone = Math.floor(canvas.height * 0.3);

    for (let regionY = faceExclusionZone; regionY < canvas.height - regionSize; regionY += regionSize / 2) {
        for (let regionX = 0; regionX < canvas.width - regionSize; regionX += regionSize / 2) {
            let regionSkinPixels = 0;
            let regionEdgePixels = 0;
            let regionTotalPixels = 0;
            let regionFingerPatterns = 0;

            // Analyze this region for hand-specific features
            for (let y = regionY; y < Math.min(regionY + regionSize, canvas.height); y += stepSize) {
                for (let x = regionX; x < Math.min(regionX + regionSize, canvas.width); x += stepSize) {
                    const index = (y * canvas.width + x) * 4;
                    const r = pixels[index];
                    const g = pixels[index + 1];
                    const b = pixels[index + 2];

                    regionTotalPixels++;
                    totalPixels++;

                    // More specific hand skin tone detection (less likely to match faces)
                    const brightness = (r + g + b) / 3;

                    // Hand-specific skin tone criteria (hands tend to be slightly different from face)
                    const isHandSkinTone = (
                        // Method 1: Typical hand skin tones
                        (r > 80 && r < 220 && g > 50 && g < 180 && b > 30 && b < 140 &&
                            r > g && r > b && (r - g) > 10 && (r - b) > 20 && brightness > 90 && brightness < 190) ||

                        // Method 2: Darker skin tones for hands
                        (r > 60 && r < 150 && g > 45 && g < 120 && b > 25 && b < 90 &&
                            r > g && r > b && Math.abs(r - g) < 40 && brightness > 70 && brightness < 130)
                    );

                    if (isHandSkinTone) {
                        regionSkinPixels++;
                        skinPixels++;
                    }

                    // Enhanced edge detection for finger-like patterns
                    if (x > regionX + stepSize && y > regionY + stepSize) {
                        const prevIndex = ((y - stepSize) * canvas.width + (x - stepSize)) * 4;
                        const rightIndex = (y * canvas.width + (x + stepSize)) * 4;
                        const downIndex = ((y + stepSize) * canvas.width + x) * 4;

                        if (prevIndex >= 0 && rightIndex < pixels.length && downIndex < pixels.length) {
                            const prevR = pixels[prevIndex];
                            const rightR = pixels[rightIndex];
                            const downR = pixels[downIndex];

                            // Detect finger-like vertical patterns (hands have vertical finger edges)
                            const verticalEdge = Math.abs(r - downR);
                            const horizontalEdge = Math.abs(r - rightR);

                            // Fingers create stronger vertical edges than horizontal
                            if (verticalEdge > horizontalEdge && verticalEdge > 40) {
                                regionFingerPatterns++;
                                fingerLikePatterns++;
                            }

                            if (verticalEdge > 25 || horizontalEdge > 25) {
                                regionEdgePixels++;
                                edgePixels++;
                            }
                        }
                    }
                }
            }

            // Calculate region score with hand-specific weighting
            const regionSkinRatio = regionTotalPixels > 0 ? regionSkinPixels / regionTotalPixels : 0;
            const regionEdgeRatio = regionTotalPixels > 0 ? regionEdgePixels / regionTotalPixels : 0;
            const regionFingerRatio = regionTotalPixels > 0 ? regionFingerPatterns / regionTotalPixels : 0;

            // Hand score heavily weights finger patterns
            const regionScore = (regionSkinRatio * 200) + (regionEdgeRatio * 150) + (regionFingerRatio * 400);

            regions.push({
                x: regionX,
                y: regionY,
                score: regionScore,
                skinCount: regionSkinPixels,
                edgeCount: regionEdgePixels,
                fingerPatterns: regionFingerPatterns
            });

            // Track best region
            if (regionScore > bestHandRegion.score) {
                bestHandRegion = { x: regionX, y: regionY, score: regionScore };
            }
        }
    } const skinRatio = skinPixels / totalPixels;
    const edgeRatio = edgePixels / totalPixels;
    const fingerRatio = fingerLikePatterns / totalPixels;

    // Use the best region found for additional scoring
    const bestRegionData = regions.find(r => r.x === bestHandRegion.x && r.y === bestHandRegion.y);
    const regionBonus = bestRegionData && bestRegionData.score > 30 ? 15 : 0;

    // Hand-specific criteria (excludes faces by focusing on hand features)
    const hasSufficientSkin = skinRatio > 0.015; // Hand skin detection
    const hasSufficientEdges = edgeRatio > 0.008; // Edge patterns
    const hasFingerPatterns = fingerRatio > 0.003; // Finger-like vertical edges
    const hasGoodRegion = bestHandRegion.score > 25; // Strong regional hand score
    const isInHandZone = bestRegionData && bestRegionData.y > canvas.height * 0.3; // Below face area

    // At least 3 of 5 criteria must be met for hand detection (stricter to avoid faces)
    const criteriaCount = [hasSufficientSkin, hasSufficientEdges, hasFingerPatterns, hasGoodRegion, isInHandZone].filter(Boolean).length;
    const hasHand = criteriaCount >= 3;

    // Enhanced confidence calculation emphasizing hand-specific features
    const skinScore = Math.min(skinRatio * 600, 25);
    const edgeScore = Math.min(edgeRatio * 800, 20);
    const fingerScore = Math.min(fingerRatio * 1500, 30); // High weight for finger patterns
    const regionScore = Math.min(bestHandRegion.score * 0.8, 25);

    const confidence = Math.min(skinScore + edgeScore + fingerScore + regionScore + regionBonus, 100);

    // Debug logging for hand detection (show finger patterns)
    if (Math.random() < 0.05) { // Log occasionally to avoid spam
        console.log(`Hand-Specific Detection:`, {
            skinRatio: skinRatio.toFixed(4),
            edgeRatio: edgeRatio.toFixed(4),
            fingerRatio: fingerRatio.toFixed(4),
            bestRegion: { x: bestHandRegion.x, y: bestHandRegion.y, score: bestHandRegion.score.toFixed(1) },
            hasHand,
            confidence: confidence.toFixed(1),
            criteria: { hasSufficientSkin, hasSufficientEdges, hasFingerPatterns, hasGoodRegion, isInHandZone }
        });
    }

    return {
        hasHand,
        confidence: Math.round(confidence),
        skinPixels,
        edgePixels
    };
}

/**
 * Start real-time hand detection that triggers callback when stable hand is detected
 */
export function detectHandInRealTime(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onHandDetected: () => void,
    onHandLost?: () => void,
    options: {
        requiredStableFrames?: number;
        confidenceThreshold?: number;
        checkInterval?: number;
        onStatusUpdate?: (status: { stableFrames: number; confidence: number; detecting: boolean }) => void;
    } = {}
): () => void {
    const {
        requiredStableFrames = 10,
        confidenceThreshold = 40,
        checkInterval = 150,
        onStatusUpdate
    } = options;

    let state: HandDetectionState = {
        isDetecting: true,
        stableFrames: 0,
        lastDetectionTime: 0,
        confidence: 0
    };

    let intervalId: NodeJS.Timeout;
    let hasTriggered = false;
    let consecutiveDetections = 0;

    const checkForHand = () => {
        if (!state.isDetecting || hasTriggered) return;

        try {
            const analysis = analyzeForHandFeatures(video, canvas);
            const currentTime = Date.now();

            if (analysis.hasHand && analysis.confidence >= confidenceThreshold) {
                consecutiveDetections++;
                state.stableFrames++;
                state.confidence = analysis.confidence;
                state.lastDetectionTime = currentTime;

                // Update status
                if (onStatusUpdate) {
                    onStatusUpdate({
                        stableFrames: state.stableFrames,
                        confidence: analysis.confidence,
                        detecting: true
                    });
                }

                console.log(`Hand detected - Frame ${state.stableFrames}/${requiredStableFrames}, Confidence: ${analysis.confidence}%`);

                // Trigger capture when hand is stable for required frames
                if (state.stableFrames >= requiredStableFrames && consecutiveDetections >= 3) {
                    console.log('🎯 Auto-capturing! Hand stable for required duration.');
                    hasTriggered = true;
                    onHandDetected();
                }
            } else {
                // Reset if hand is lost or confidence drops
                if (state.stableFrames > 0) {
                    console.log(`Hand detection lost - resetting. Confidence: ${analysis.confidence}%`);
                    state.stableFrames = 0;
                    consecutiveDetections = 0;

                    // Update status
                    if (onStatusUpdate) {
                        onStatusUpdate({
                            stableFrames: 0,
                            confidence: analysis.confidence,
                            detecting: true
                        });
                    }

                    if (onHandLost) {
                        onHandLost();
                    }
                }
            }
        } catch (error) {
            console.error('Error in hand detection:', error);
        }
    };

    // Start detection loop
    console.log('🤚 Starting hand detection with params:', {
        requiredStableFrames,
        confidenceThreshold,
        checkInterval
    });

    intervalId = setInterval(checkForHand, checkInterval);

    // Return cleanup function
    return () => {
        console.log('🛑 Stopping hand detection');
        state.isDetecting = false;
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}
