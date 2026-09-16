from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from fastapi.responses import JSONResponse
from ai_service.disease_classifier import predict_crop_disease
from ai_service.severity_analyzer import calculate_leaf_severity
from ai_service.rag_engine import get_rag_advisory
from ai_service.leaf_validator import validate_leaf_image

app = FastAPI(
    title="AgriPulse AI Microservice",
    description="FastAPI Microservice for Computer Vision Disease Classification, Severity Calculation & RAG Advisory Engine",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "AgriPulse AI FastAPI Microservice",
        "status": "Running",
        "endpoints": ["/predict", "/validate-leaf", "/advisory", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/validate-leaf")
async def validate_leaf_endpoint(file: UploadFile = File(...)):
    """Validates whether an uploaded image contains a genuine agricultural plant leaf."""
    try:
        contents = await file.read()
        validation = validate_leaf_image(contents)
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
    crop_name: str = Form("General")
):
    """Leaf image upload endpoint: validates leaf, then returns disease classification, OpenCV severity %, and RAG advisory."""
    try:
        contents = await file.read()

        # Step 0: Validate that the uploaded image is actually a plant leaf
        validation = validate_leaf_image(contents)
        if not validation["is_leaf"]:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "is_leaf": False,
                    "error": validation["reason"],
                    "error_ml": validation["reason_ml"],
                    "detected_type": validation["detected_type"],
                    "metrics": validation.get("metrics", {})
                }
            )

        # 1. Deep Learning Classification
        disease_name, confidence_score = predict_crop_disease(contents, crop_name)

        # 2. OpenCV Severity Analysis
        severity_percentage, severity_level = calculate_leaf_severity(contents)

        # 3. RAG Knowledge Advisory
        rag_output = get_rag_advisory(disease_name, crop_name)

        return {
            "success": True,
            "is_leaf": True,
            "leaf_validation": validation,
            "disease_name": disease_name,
            "confidence_score": confidence_score,
            "severity_percentage": severity_percentage,
            "severity_level": severity_level,
            "advisory": rag_output["advisory"],
            "sources": rag_output["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
