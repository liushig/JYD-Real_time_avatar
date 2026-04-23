"""
Face Enhancement Module for MuseTalk
Provides super-resolution enhancement for mouth region using Real-ESRGAN
"""
import cv2
import numpy as np
from loguru import logger
from typing import Optional, Tuple
import os

class FaceEnhancer:
    """Face enhancement using Real-ESRGAN or fallback methods"""

    def __init__(self, model_name: str = 'RealESRGAN_x2plus', device: str = 'cuda', use_realesrgan: bool = True):
        """
        Initialize face enhancer

        Args:
            model_name: Real-ESRGAN model name ('RealESRGAN_x2plus' or 'RealESRGAN_x4plus')
            device: 'cuda' or 'cpu'
            use_realesrgan: Whether to use Real-ESRGAN (requires installation)
        """
        self.device = device
        self.use_realesrgan = use_realesrgan
        self.upsampler = None

        if use_realesrgan:
            try:
                from basicsr.archs.rrdbnet_arch import RRDBNet
                from realesrgan import RealESRGANer

                # Determine scale and model path
                if 'x2' in model_name:
                    scale = 2
                    model_path = 'models/realesrgan/RealESRGAN_x2plus.pth'
                else:
                    scale = 4
                    model_path = 'models/realesrgan/RealESRGAN_x4plus.pth'

                # Check if model exists
                if not os.path.exists(model_path):
                    logger.warning(f"Real-ESRGAN model not found at {model_path}, will use fallback method")
                    self.use_realesrgan = False
                else:
                    # Initialize model
                    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=scale)
                    self.upsampler = RealESRGANer(
                        scale=scale,
                        model_path=model_path,
                        model=model,
                        tile=256,  # Tile size for memory efficiency
                        tile_pad=10,
                        pre_pad=0,
                        half=True if device == 'cuda' else False,
                        device=device
                    )
                    logger.info(f"Real-ESRGAN initialized with model: {model_name}")

            except ImportError as e:
                logger.warning(f"Real-ESRGAN not installed: {e}, will use fallback method")
                self.use_realesrgan = False

        if not self.use_realesrgan:
            logger.info("Using fallback enhancement method (USM sharpening + contrast)")

    def enhance_mouth_region(self, image: np.ndarray, mouth_bbox: Optional[Tuple[int, int, int, int]] = None) -> np.ndarray:
        """
        Enhance mouth region of the image

        Args:
            image: Input image (H, W, 3) BGR format
            mouth_bbox: Optional mouth bounding box (x1, y1, x2, y2). If None, enhance entire image

        Returns:
            Enhanced image
        """
        if mouth_bbox is not None:
            x1, y1, x2, y2 = mouth_bbox
            # Extract mouth region
            mouth_region = image[y1:y2, x1:x2].copy()

            # Enhance mouth region
            if self.use_realesrgan and self.upsampler is not None:
                enhanced_mouth = self._enhance_with_realesrgan(mouth_region)
            else:
                enhanced_mouth = self._enhance_with_fallback(mouth_region)

            # Resize back to original size if needed
            if enhanced_mouth.shape[:2] != mouth_region.shape[:2]:
                enhanced_mouth = cv2.resize(enhanced_mouth, (x2 - x1, y2 - y1), interpolation=cv2.INTER_CUBIC)

            # Blend back to original image
            result = image.copy()
            result[y1:y2, x1:x2] = enhanced_mouth
            return result
        else:
            # Enhance entire image
            if self.use_realesrgan and self.upsampler is not None:
                return self._enhance_with_realesrgan(image)
            else:
                return self._enhance_with_fallback(image)

    def _enhance_with_realesrgan(self, image: np.ndarray) -> np.ndarray:
        """Enhance using Real-ESRGAN"""
        try:
            output, _ = self.upsampler.enhance(image, outscale=1.0)  # outscale=1.0 to keep original size
            return output
        except Exception as e:
            logger.warning(f"Real-ESRGAN enhancement failed: {e}, using fallback")
            return self._enhance_with_fallback(image)

    def _enhance_with_fallback(self, image: np.ndarray) -> np.ndarray:
        """
        Fallback enhancement using traditional image processing
        - Mild unsharp masking for sharpening (reduced intensity)
        - Subtle contrast enhancement
        """
        # 1. Mild Unsharp Masking (USM) - 降低强度
        gaussian = cv2.GaussianBlur(image, (0, 0), 1.5)  # 从2.0降到1.5
        sharpened = cv2.addWeighted(image, 1.2, gaussian, -0.2, 0)  # 从1.5/-0.5降到1.2/-0.2

        # 2. Very subtle contrast enhancement using CLAHE - 降低强度
        lab = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        # Apply CLAHE to L channel with lower clip limit
        clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8))  # 从2.0降到1.2
        l = clahe.apply(l)

        # Merge back
        enhanced_lab = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # 3. Remove saturation boost - 移除饱和度增强，避免颜色不一致
        # hsv = cv2.cvtColor(enhanced, cv2.COLOR_BGR2HSV).astype(np.float32)
        # hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.1, 0, 255)
        # enhanced = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

        return enhanced

    def get_mouth_bbox_from_face(self, face_bbox: Tuple[int, int, int, int]) -> Tuple[int, int, int, int]:
        """
        Estimate mouth bounding box from face bounding box

        Args:
            face_bbox: Face bounding box (x1, y1, x2, y2)

        Returns:
            Mouth bounding box (x1, y1, x2, y2)
        """
        x1, y1, x2, y2 = face_bbox
        face_width = x2 - x1
        face_height = y2 - y1

        # Mouth is typically in the lower 1/3 of face, centered horizontally
        mouth_x1 = x1 + int(face_width * 0.25)
        mouth_x2 = x2 - int(face_width * 0.25)
        mouth_y1 = y1 + int(face_height * 0.6)
        mouth_y2 = y1 + int(face_height * 0.85)

        return (mouth_x1, mouth_y1, mouth_x2, mouth_y2)


if __name__ == "__main__":
    # Test code
    enhancer = FaceEnhancer(use_realesrgan=False)  # Test fallback method

    # Create a test image
    test_img = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)

    # Test enhancement
    enhanced = enhancer.enhance_mouth_region(test_img)
    print(f"Enhanced image shape: {enhanced.shape}")

    # Test with mouth bbox
    mouth_bbox = (64, 128, 192, 200)
    enhanced_with_bbox = enhancer.enhance_mouth_region(test_img, mouth_bbox)
    print(f"Enhanced with bbox shape: {enhanced_with_bbox.shape}")
