"""
MuseTalk Algorithm with LANCZOS4 interpolation only
No enhancement, just better upscaling to avoid inconsistency
"""
import sys
import os

# Copy from original and only change interpolation method
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(current_dir, '../../../'))

# Import everything from original
from handlers.avatar.musetalk.avatar_musetalk_algo import *

# Override the class with only interpolation changes
class MuseAvatarV15_LANCZOS4(MuseAvatarV15):
    """
    MuseTalk with LANCZOS4 interpolation for better upscaling quality
    No additional enhancement to maintain consistency
    """

    def res2combined(self, res_frame, idx):
        """Blend the generated frame with the original frame
        Args:
            res_frame: Generated frame (numpy array)
            idx: Current frame index
        Returns:
            numpy.ndarray: Blended full frame
        """
        t0 = time.time()
        # Get the face bbox and original frame for the current frame
        bbox = self.coord_list_cycle[idx % len(self.coord_list_cycle)]
        ori_frame = copy.deepcopy(self.frame_list_cycle[idx % len(self.frame_list_cycle)])
        t1 = time.time()
        x1, y1, x2, y2 = bbox
        try:
            # Resize with LANCZOS4 for best quality upscaling
            res_frame = cv2.resize(res_frame.astype(np.uint8), (x2 - x1, y2 - y1), interpolation=cv2.INTER_LANCZOS4)
        except Exception as e:
            logger.opt(exception=True).error(f"res2combined error: {str(e)}")
            return ori_frame
        t2 = time.time()
        # Add protection: if res_frame is all zeros, return original frame directly
        if np.all(res_frame == 0):
            logger.warning(f"res2combined: res_frame is all zero, return ori_frame, idx={idx}")
            return ori_frame
        # Get the corresponding mask and crop box
        mask = self.mask_list_cycle[idx % len(self.mask_list_cycle)]
        mask_crop_box = self.mask_coords_list_cycle[idx % len(self.mask_coords_list_cycle)]
        t3 = time.time()
        # Blend the generated facial expression with the original frame
        combine_frame = self.acc_get_image_blending(ori_frame, res_frame, bbox, mask, mask_crop_box)
        t4 = time.time()

        total_time = t4 - t0
        fps = 1.0 / total_time if total_time > 0 else 0
        if fps < self.fps:
            logger.warning(f"[PROFILE] res2combined fps is not enough, fps={fps:.2f}, self.fps={self.fps}")
        if self.debug:
            logger.info(
                f"[PROFILE] res2combined: idx={idx}, ori_copy={t1-t0:.4f}s, resize={t2-t1:.4f}s, mask_fetch={t3-t2:.4f}s, blend={t4-t3:.4f}s, total={total_time:.4f}s, fps={fps:.2f}"
            )
        return combine_frame
