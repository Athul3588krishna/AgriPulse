import cv2
import numpy as np
import sys
import json
import os

# Ensure UTF-8 stdout for Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Global MobileNetV3 cache for ImageNet object verification
_MOBILENET = None
_PREPROCESS = None
_CATEGORIES = None

def get_mobilenet():
    global _MOBILENET, _PREPROCESS, _CATEGORIES
    if _MOBILENET is None:
        try:
            import torch
            from torchvision import models
            weights = models.MobileNet_V3_Large_Weights.DEFAULT
            _MOBILENET = models.mobilenet_v3_large(weights=weights)
            _MOBILENET.eval()
            _PREPROCESS = weights.transforms()
            _CATEGORIES = weights.meta["categories"]
        except Exception as e:
            print(f"MobileNet load notice: {e}", file=sys.stderr)
            return None, None, None
    return _MOBILENET, _PREPROCESS, _CATEGORIES

BOTANICAL_IMAGENET_KEYWORDS = {
    "leaf", "plant", "daisy", "pot", "flowerpot", "greenhouse", "cabbage", "broccoli",
    "cauliflower", "zucchini", "squash", "cucumber", "artichoke", "bell pepper", "cardoon",
    "mushroom", "apple", "orange", "lemon", "banana", "fig", "pineapple", "jackfruit",
    "strawberry", "ear", "corn", "acorn", "hip", "rapeseed", "hay", "sulphur butterfly",
    "leaf beetle", "grasshopper", "caterpillar", "ant"
}

def validate_leaf_image(image_bytes: bytes) -> dict:
    """Strict botanical & computer vision validation for crop leaf disease scanning.
    
    Rejects:
    - ID cards, documents, white paper, receipts, screens, certificates.
    - Human faces, portraits, hands, skin tones.
    - Vehicles, machinery, electronics, furniture.
    - Any image without at least 18% authentic agricultural plant leaf tissue.
    """
    try:
        if not image_bytes or len(image_bytes) < 100:
            return {
                "is_leaf": False,
                "confidence": 0.0,
                "reason": "Empty or corrupted image file.",
                "reason_ml": "ശൂന്യമായതോ കേടായതോ ആയ ചിത്ര ഫയൽ.",
                "detected_type": "Invalid File"
            }

        # 1. Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            return {
                "is_leaf": False,
                "confidence": 0.0,
                "reason": "Unable to decode image. Please upload a standard JPG or PNG photo.",
                "reason_ml": "ചിത്രം തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല. ദയവായി JPG അല്ലെങ്കിൽ PNG ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
                "detected_type": "Unsupported Format"
            }

        h, w = img_bgr.shape[:2]
        total_pixels = h * w
        if total_pixels < 2500:
            return {
                "is_leaf": False,
                "confidence": 0.0,
                "reason": "Image resolution is too low for leaf analysis.",
                "reason_ml": "ചിത്രത്തിന്റെ റെസല്യൂഷൻ വളരെ കുറവാണ്. വ്യക്തമായ വലിയ ഫോട്ടോ നൽകുക.",
                "detected_type": "Low Resolution"
            }

        # 2. Color Spaces
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

        # Botanical foliage masks (requires saturation >= 35 to eliminate white/gray/paper)
        green_mask = (H >= 25) & (H <= 88) & (S >= 35) & (V >= 30)
        yellow_mask = (H >= 15) & (H < 25) & (S >= 40) & (V >= 40)
        brown_mask = (H >= 5) & (H < 18) & (S >= 35) & (V >= 25) & (V <= 190)

        foliage_mask = green_mask | yellow_mask | brown_mask
        foliage_count = np.count_nonzero(foliage_mask)
        foliage_ratio = foliage_count / total_pixels

        # Low saturation check (detects white card background, paper, document, screens)
        low_sat_ratio = np.count_nonzero(S < 30) / total_pixels

        # Human skin detection (YCrCb: Cr in [133, 173], Cb in [77, 127], S >= 20)
        ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        Cr = ycrcb[:, :, 1]
        Cb = ycrcb[:, :, 2]
        skin_mask = (Cr >= 133) & (Cr <= 173) & (Cb >= 77) & (Cb <= 127) & (S >= 20)
        skin_ratio = np.count_nonzero(skin_mask) / total_pixels

        # Texture variance
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # REJECTION RULE 1: Document / ID Card / White Paper / Sheet / Screen
        # Over 45% of the image is white/gray and botanical foliage is under 30%
        if low_sat_ratio > 0.45 and foliage_ratio < 0.30:
            return {
                "is_leaf": False,
                "confidence": round(low_sat_ratio * 100, 1),
                "reason": "Document, ID Card, or paper detected. Please upload a photo of an agricultural plant leaf.",
                "reason_ml": "ഡോക്യുമെന്റോ ഐഡി കാർഡോ പേപ്പറോ ആണ് കണ്ടെത്തിയത്. ദയവായി വിളകളുടെ ഇലയുടെ കളർ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
                "detected_type": "Document / ID Card / Paper",
                "metrics": {
                    "low_sat_ratio": round(low_sat_ratio, 3),
                    "foliage_ratio": round(foliage_ratio, 3)
                }
            }

        # REJECTION RULE 2: Insufficient Botanical Foliage
        # Every real leaf photo MUST contain at least 18% genuine crop foliage
        if foliage_ratio < 0.18:
            return {
                "is_leaf": False,
                "confidence": round((1 - foliage_ratio) * 100, 1),
                "reason": "No plant leaf or agricultural crop detected. Only crop leaves can be analyzed for disease diagnosis.",
                "reason_ml": "ചെടിയുടെ ഇലയോ വിളയോ ഈ ചിത്രത്തിൽ കാണുന്നില്ല. വിളകളുടെ രോഗനിർണയത്തിനായി ഇലയുടെ വ്യക്തമായ ചിത്രം മാത്രം നൽകുക.",
                "detected_type": "Non-Plant Image / Object",
                "metrics": {
                    "foliage_ratio": round(foliage_ratio, 3)
                }
            }

        # REJECTION RULE 3: Human Portrait / Face / Skin Dominance
        if skin_ratio > 0.15 and foliage_ratio < 0.30:
            return {
                "is_leaf": False,
                "confidence": round((1 - foliage_ratio) * 100, 1),
                "reason": "Human face or portrait detected. AgriPulse AI only scans agricultural crop leaves.",
                "reason_ml": "മനുഷ്യന്റെ മുഖമോ ശരീരമോ ആണ് കണ്ടത്. AgriPulse AI വിളകളുടെ ഇലകൾ മാത്രമാണ് സ്കാൻ ചെയ്യുന്നത്.",
                "detected_type": "Human / Portrait",
                "metrics": {
                    "skin_ratio": round(skin_ratio, 3),
                    "foliage_ratio": round(foliage_ratio, 3)
                }
            }

        # REJECTION RULE 4: Deep Learning Object Verification (MobileNetV3)
        try:
            model, preprocess, categories = get_mobilenet()
            if model is not None and preprocess is not None:
                import torch
                from PIL import Image
                pil_img = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
                batch = preprocess(pil_img).unsqueeze(0)
                with torch.no_grad():
                    probs = model(batch).squeeze(0).softmax(0)
                top_prob, top_idx = torch.topk(probs, 3)

                top_class = categories[top_idx[0].item()]
                top_conf = top_prob[0].item()

                is_botanical = any(keyword in top_class.lower() for keyword in BOTANICAL_IMAGENET_KEYWORDS)

                # If top-1 prediction is an obvious non-plant entity with > 20% confidence
                if not is_botanical and top_conf > 0.20 and foliage_ratio < 0.40:
                    display_type = top_class.replace("_", " ").title()
                    return {
                        "is_leaf": False,
                        "confidence": round(top_conf * 100, 1),
                        "reason": f"Non-plant object detected ({display_type}). Please upload a photo of a crop leaf.",
                        "reason_ml": f"ചെടിയുടെ ഇലയല്ലാത്ത ചിത്രം ({display_type}) ആണ് കണ്ടെത്തിയത്. ദയവായി വിളയുടെ ഇലയുടെ ഫോട്ടോ നൽകുക.",
                        "detected_type": f"Object: {display_type}",
                        "metrics": {
                            "top_class": top_class,
                            "dl_confidence": round(top_conf * 100, 1),
                            "foliage_ratio": round(foliage_ratio, 3)
                        }
                    }
        except Exception as dl_err:
            print(f"MobileNet verification notice: {dl_err}", file=sys.stderr)

        # REJECTION RULE 5: Completely flat, featureless or blurry surface
        if laplacian_var < 7.0 and foliage_ratio < 0.35:
            return {
                "is_leaf": False,
                "confidence": 85.0,
                "reason": "Image is too blank, uniform, or blurry to detect leaf structure.",
                "reason_ml": "ചിത്രത്തിൽ ഇലയുടെ ഘടന വ്യക്തമല്ല അല്ലെങ്കിൽ പ്ലെയിൻ ആണ്. ദയവായി വ്യക്തതയുള്ള ഫോട്ടോ എടുക്കുക.",
                "detected_type": "Blurry / Plain Surface",
                "metrics": {
                    "laplacian_var": round(laplacian_var, 1)
                }
            }

        # Valid agricultural crop leaf detected!
        confidence = min(99.0, max(85.0, (foliage_ratio * 60 + 40)))
        return {
            "is_leaf": True,
            "confidence": round(confidence, 1),
            "reason": "Valid agricultural crop leaf detected.",
            "reason_ml": "സാധുവായ വിളയുടെ ഇല കണ്ടെത്തി.",
            "detected_type": "Plant Leaf / Foliage",
            "metrics": {
                "foliage_ratio": round(foliage_ratio, 3),
                "laplacian_var": round(laplacian_var, 1)
            }
        }

    except Exception as e:
        return {
            "is_leaf": False,
            "confidence": 0.0,
            "reason": f"Image validation processing error: {str(e)}",
            "reason_ml": f"ഇമേജ് പ്രോസസ്സിംഗ് തകരാർ: {str(e)}",
            "detected_type": "Error"
        }

# CLI entrypoint for Node.js child_process integration
if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_path = sys.argv[1]
        if os.path.exists(target_path):
            with open(target_path, "rb") as f:
                result = validate_leaf_image(f.read())
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(0 if result["is_leaf"] else 1)
        else:
            print(json.dumps({"is_leaf": False, "reason": "File not found", "detected_type": "Error"}))
            sys.exit(1)
    else:
        print(json.dumps({"is_leaf": False, "reason": "No image path provided", "detected_type": "Error"}))
        sys.exit(1)
