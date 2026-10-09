from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

HazardType = Literal['FLOOD', 'HEAT', 'AIR_POLLUTION', 'WATER_STRESS', 'MULTI_HAZARD']
RiskLevel = Literal['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL']
AlertSeverity = Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
ModelType = Literal['baseline', 'trained']

class InputFeatures(BaseModel):
    temperatureC: Optional[float] = None
    relativeHumidityPct: Optional[float] = None
    precipitationMm: Optional[float] = None
    windSpeedMs: Optional[float] = None
    aqi: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    ndvi: Optional[float] = None
    ndwi: Optional[float] = None
    ndbi: Optional[float] = None
    landSurfaceTempC: Optional[float] = None
    elevationMeters: Optional[float] = None
    drainageDensityKmPerKm2: Optional[float] = None
    imperviousSurfacePct: Optional[float] = None

class RiskPredictionRequest(BaseModel):
    locationId: str
    hazardType: HazardType
    features: InputFeatures
    dataTimestamp: Optional[str] = None

class RiskPredictionResponse(BaseModel):
    locationId: str
    hazardType: HazardType
    riskScore: float = Field(ge=0.0, le=100.0)
    riskLevel: RiskLevel
    alertSeverity: AlertSeverity
    confidence: float = Field(ge=0.0, le=1.0)
    inputCompletenessPct: float = Field(ge=0.0, le=100.0)
    modelName: str
    modelVersion: str
    modelType: ModelType
    features: Dict[str, Any]
    explanation: Dict[str, Any]
    timestamp: str
