"""
Quick test script for face enhancement module
Tests both Real-ESRGAN and fallback methods
"""
import cv2
import numpy as np
import sys
import os

# Add path
sys.path.insert(0, '/opt/jyd01/liushiguo/OpenAvatarChat_test/src')

from handlers.avatar.musetalk.face_enhancer import FaceEnhancer

def test_face_enhancer():
    print("=" * 60)
    print("Testing Face Enhancer Module")
    print("=" * 60)

    # Test 1: Initialize with Real-ESRGAN
    print("\n[Test 1] Initializing with Real-ESRGAN...")
    try:
        enhancer_realesrgan = FaceEnhancer(
            model_name='RealESRGAN_x2plus',
            device='cuda',
            use_realesrgan=True
        )
        if enhancer_realesrgan.use_realesrgan:
            print("✅ Real-ESRGAN initialized successfully")
        else:
            print("⚠️  Real-ESRGAN not available, using fallback method")
    except Exception as e:
        print(f"❌ Failed to initialize Real-ESRGAN: {e}")
        enhancer_realesrgan = None

    # Test 2: Initialize with fallback method
    print("\n[Test 2] Initializing with fallback method...")
    try:
        enhancer_fallback = FaceEnhancer(
            model_name='RealESRGAN_x2plus',
            device='cuda',
            use_realesrgan=False
        )
        print("✅ Fallback enhancer initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize fallback enhancer: {e}")
        return

    # Test 3: Create test image
    print("\n[Test 3] Creating test image (256x256)...")
    test_img = np.random.randint(100, 200, (256, 256, 3), dtype=np.uint8)
    print(f"✅ Test image created: shape={test_img.shape}, dtype={test_img.dtype}")

    # Test 4: Test mouth bbox estimation
    print("\n[Test 4] Testing mouth bbox estimation...")
    face_bbox = (0, 0, 256, 256)
    mouth_bbox = enhancer_fallback.get_mouth_bbox_from_face(face_bbox)
    print(f"✅ Face bbox: {face_bbox}")
    print(f"✅ Mouth bbox: {mouth_bbox}")

    # Test 5: Test enhancement without bbox
    print("\n[Test 5] Testing enhancement on full image (fallback method)...")
    try:
        enhanced_full = enhancer_fallback.enhance_mouth_region(test_img)
        print(f"✅ Enhanced full image: shape={enhanced_full.shape}, dtype={enhanced_full.dtype}")
    except Exception as e:
        print(f"❌ Enhancement failed: {e}")
        return

    # Test 6: Test enhancement with mouth bbox
    print("\n[Test 6] Testing enhancement on mouth region (fallback method)...")
    try:
        enhanced_mouth = enhancer_fallback.enhance_mouth_region(test_img, mouth_bbox)
        print(f"✅ Enhanced mouth region: shape={enhanced_mouth.shape}, dtype={enhanced_mouth.dtype}")
    except Exception as e:
        print(f"❌ Enhancement failed: {e}")
        return

    # Test 7: Test Real-ESRGAN if available
    if enhancer_realesrgan and enhancer_realesrgan.use_realesrgan:
        print("\n[Test 7] Testing Real-ESRGAN enhancement...")
        try:
            enhanced_realesrgan = enhancer_realesrgan.enhance_mouth_region(test_img, mouth_bbox)
            print(f"✅ Real-ESRGAN enhanced: shape={enhanced_realesrgan.shape}, dtype={enhanced_realesrgan.dtype}")
        except Exception as e:
            print(f"❌ Real-ESRGAN enhancement failed: {e}")
    else:
        print("\n[Test 7] Skipping Real-ESRGAN test (not available)")

    # Test 8: Performance test
    print("\n[Test 8] Performance test (100 iterations)...")
    import time

    iterations = 100
    start = time.time()
    for _ in range(iterations):
        _ = enhancer_fallback.enhance_mouth_region(test_img, mouth_bbox)
    elapsed = time.time() - start
    avg_time = elapsed / iterations * 1000

    print(f"✅ Fallback method: {avg_time:.2f} ms/frame")
    print(f"   Estimated FPS impact: ~{1000/avg_time:.1f} fps")

    if enhancer_realesrgan and enhancer_realesrgan.use_realesrgan:
        start = time.time()
        for _ in range(iterations):
            _ = enhancer_realesrgan.enhance_mouth_region(test_img, mouth_bbox)
        elapsed = time.time() - start
        avg_time = elapsed / iterations * 1000

        print(f"✅ Real-ESRGAN method: {avg_time:.2f} ms/frame")
        print(f"   Estimated FPS impact: ~{1000/avg_time:.1f} fps")

    print("\n" + "=" * 60)
    print("All tests completed!")
    print("=" * 60)

    # Summary
    print("\n📊 Summary:")
    if enhancer_realesrgan and enhancer_realesrgan.use_realesrgan:
        print("✅ Real-ESRGAN is available and working")
        print("   Recommendation: Use Real-ESRGAN for best quality")
    else:
        print("⚠️  Real-ESRGAN not available")
        print("   Recommendation: Install with 'pip install basicsr realesrgan'")
        print("   Fallback method will be used (still provides improvement)")

    print("\n📝 Next steps:")
    print("1. If Real-ESRGAN is not available, install it:")
    print("   pip install basicsr realesrgan")
    print("2. Download model:")
    print("   mkdir -p models/realesrgan")
    print("   cd models/realesrgan")
    print("   wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth")
    print("3. Update your handler to use avatar_musetalk_algo_RealESRGAN.py")

if __name__ == "__main__":
    test_face_enhancer()
