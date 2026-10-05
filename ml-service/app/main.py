from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import RiskPredictionRequest, RiskPredictionResponse
from app.models.baseline_model import predict_hazard_risk, MODEL_NAME, MODEL_VERSION, MODEL_TYPE

app = FastAPI(
    title="UrbanPulse ML Service",
    description="Physical & Machine Learning Risk Assessment Engine for Urban Intelligence",
    version=MODEL_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "urbanpulse-ml-service",
        "modelName": MODEL_NAME,
        "modelVersion": MODEL_VERSION,
        "modelType": MODEL_TYPE,
    }

@app.get("/model/metadata")
def get_model_metadata():
    return {
        "modelName": MODEL_NAME,
        "modelVersion": MODEL_VERSION,
        "modelType": MODEL_TYPE,
        "description": "Deterministic hydrological and thermal baseline vulnerability engine with completeness confidence metrics",
        "supportedHazards": ["FLOOD", "HEAT", "AIR_POLLUTION", "WATER_STRESS", "MULTI_HAZARD"],
    }

@app.post("/predict/risk", response_model=RiskPredictionResponse)
def predict_risk(request: RiskPredictionRequest) -> RiskPredictionResponse:
    return predict_hazard_risk(
        location_id=request.locationId,
        hazard_type=request.hazardType,
        features=request.features,
    )
