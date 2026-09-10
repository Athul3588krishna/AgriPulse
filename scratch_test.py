import sys
import os
import io

# Fix Windows console UTF-8 printing
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from PIL import Image

def test_inference():
    # Create dummy green leaf image
    img = Image.new("RGB", (224, 224), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    from ai_service.disease_classifier import predict_crop_disease
    from ai_service.severity_analyzer import calculate_leaf_severity
    from ai_service.rag_engine import get_rag_advisory

    disease, conf = predict_crop_disease(img_bytes, crop_name="Tomato")
    severity_pct, severity_lvl = calculate_leaf_severity(img_bytes)
    advisory = get_rag_advisory(disease, "Tomato")

    print("=== AgriPulse AI Microservice Test ===")
    print(f"Disease Detected : {disease}")
    print(f"Confidence Score : {conf}%")
    print(f"Leaf Severity    : {severity_pct}% ({severity_lvl})")
    print(f"English Summary  : {advisory['advisory']['english']['summary']}")
    print(f"Malayalam Summary: {advisory['advisory']['malayalam']['summary']}")
    print("======================================")

if __name__ == "__main__":
    test_inference()
