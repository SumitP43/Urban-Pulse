from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from app.schemas import InputFeatures, HazardType, RiskLevel, AlertSeverity, RiskPredictionResponse

MODEL_NAME = "UrbanPulse-PhysicsBaseline-Engine"
MODEL_VERSION = "1.0.0"
MODEL_TYPE = "baseline"

def score_to_risk_level(score: float) -> RiskLevel:
    """
    Half-open ranges:
    [0, 20)   => VERY_LOW
    [20, 40)  => LOW
    [40, 60)  => MODERATE
    [60, 80)  => HIGH
    [80, 100] => CRITICAL
    """
    s = max(0.0, min(score, 100.0))
    if s < 20.0:
        return 'VERY_LOW'
    elif s < 40.0:
        return 'LOW'
    elif s < 60.0:
        return 'MODERATE'
    elif s < 80.0:
        return 'HIGH'
    else:
        return 'CRITICAL'

def risk_level_to_alert_severity(level: RiskLevel) -> AlertSeverity:
    if level in ('VERY_LOW', 'LOW'):
        return 'LOW'
    elif level == 'MODERATE':
        return 'MEDIUM'
    elif level == 'HIGH':
        return 'HIGH'
    else:
        return 'CRITICAL'

def assess_flood_risk(features: InputFeatures) -> Tuple[float, float, float, Dict[str, Any]]:
    required_inputs = ['precipitationMm', 'elevationMeters', 'drainageDensityKmPerKm2', 'imperviousSurfacePct', 'ndwi']
    present_inputs = [f for f in required_inputs if getattr(features, f) is not None]
    completeness_pct = (len(present_inputs) / len(required_inputs)) * 100.0

    precip = features.precipitationMm or 0.0
    ndwi = features.ndwi or 0.0
    impervious = features.imperviousSurfacePct if features.imperviousSurfacePct is not None else 65.0
    drainage = features.drainageDensityKmPerKm2 if features.drainageDensityKmPerKm2 is not None else 2.5
    elevation = features.elevationMeters if features.elevationMeters is not None else 210.0

    # Deterministic flood risk index formula:
    # 1. Rainfall intensity factor (up to 50 points)
    precip_score = min((precip / 100.0) * 50.0, 50.0)
    # 2. Impervious surface factor (up to 25 points)
    impervious_score = (impervious / 100.0) * 25.0
    # 3. Surface saturation from NDWI (up to 15 points)
    ndwi_score = max(0.0, (ndwi + 0.2) / 0.8) * 15.0
    # 4. Low drainage / low elevation vulnerability (up to 10 points)
    drainage_penalty = max(0.0, (4.0 - drainage) / 4.0) * 10.0

    raw_score = precip_score + impervious_score + ndwi_score + drainage_penalty
    final_score = round(min(max(raw_score, 0.0), 100.0), 1)

    # Confidence strictly based on available inputs
    confidence = round(0.40 + (len(present_inputs) / len(required_inputs)) * 0.55, 2)

    explanation = {
        "rule": "Runoff saturation and hydrological accumulation model",
        "primaryDriver": "precipitationMm" if precip > 20 else "imperviousSurfacePct",
        "factorBreakdown": {
            "precipitationContribution": round(precip_score, 1),
            "imperviousContribution": round(impervious_score, 1),
            "ndwiSurfaceWaterContribution": round(ndwi_score, 1),
            "drainageVulnerability": round(drainage_penalty, 1),
        },
        "missingInputs": [f for f in required_inputs if getattr(features, f) is None],
    }

    return final_score, confidence, completeness_pct, explanation

def assess_heat_risk(features: InputFeatures) -> Tuple[float, float, float, Dict[str, Any]]:
    required_inputs = ['temperatureC', 'relativeHumidityPct', 'landSurfaceTempC', 'ndbi', 'ndvi']
    present_inputs = [f for f in required_inputs if getattr(features, f) is not None]
    completeness_pct = (len(present_inputs) / len(required_inputs)) * 100.0

    temp = features.temperatureC if features.temperatureC is not None else 30.0
    humidity = features.relativeHumidityPct if features.relativeHumidityPct is not None else 50.0
    lst = features.landSurfaceTempC if features.landSurfaceTempC is not None else temp + 4.0
    ndbi = features.ndbi if features.ndbi is not None else 0.25
    ndvi = features.ndvi if features.ndvi is not None else 0.20

    # Ambient heat score (up to 55 points)
    temp_score = min(max((temp - 25.0) / 20.0, 0.0), 1.0) * 55.0
    # Surface heat island from Land Surface Temperature (up to 25 points)
    lst_score = min(max((lst - 30.0) / 18.0, 0.0), 1.0) * 25.0
    # Built-up heat retention minus vegetation cooling (up to 20 points)
    canopy_score = min(max((ndbi - ndvi + 0.5) / 1.0, 0.0), 1.0) * 20.0

    final_score = round(min(max(temp_score + lst_score + canopy_score, 0.0), 100.0), 1)
    confidence = round(0.45 + (len(present_inputs) / len(required_inputs)) * 0.50, 2)

    explanation = {
        "rule": "Urban Heat Island (UHI) canopy temperature model",
        "primaryDriver": "landSurfaceTempC" if lst > 38 else "temperatureC",
        "factorBreakdown": {
            "ambientTempContribution": round(temp_score, 1),
            "lstThermalContribution": round(lst_score, 1),
            "builtUpVsCanopyBalance": round(canopy_score, 1),
        },
        "missingInputs": [f for f in required_inputs if getattr(features, f) is None],
    }

    return final_score, confidence, completeness_pct, explanation

def assess_air_pollution_risk(features: InputFeatures) -> Tuple[float, float, float, Dict[str, Any]]:
    required_inputs = ['aqi', 'pm25', 'pm10', 'windSpeedMs']
    present_inputs = [f for f in required_inputs if getattr(features, f) is not None]
    completeness_pct = (len(present_inputs) / len(required_inputs)) * 100.0

    aqi = features.aqi if features.aqi is not None else (features.pm25 * 2.5 if features.pm25 else 120.0)
    wind = features.windSpeedMs if features.windSpeedMs is not None else 3.0

    # AQI baseline contribution (up to 80 points)
    aqi_score = min((aqi / 400.0) * 80.0, 80.0)
    # Stagnation penalty (low wind traps particulate matter) (up to 20 points)
    wind_penalty = max(0.0, (5.0 - wind) / 5.0) * 20.0

    final_score = round(min(max(aqi_score + wind_penalty, 0.0), 100.0), 1)
    confidence = round(0.50 + (len(present_inputs) / len(required_inputs)) * 0.45, 2)

    explanation = {
        "rule": "Boundary layer inversion and particulate concentration telemetry",
        "primaryDriver": "aqi",
        "factorBreakdown": {
            "aqiMagnitudeContribution": round(aqi_score, 1),
            "windDispersionStagnationPenalty": round(wind_penalty, 1),
        },
        "missingInputs": [f for f in required_inputs if getattr(features, f) is None],
    }

    return final_score, confidence, completeness_pct, explanation

def predict_hazard_risk(location_id: str, hazard_type: HazardType, features: InputFeatures) -> RiskPredictionResponse:
    if hazard_type == 'FLOOD':
        score, confidence, completeness, explanation = assess_flood_risk(features)
    elif hazard_type == 'HEAT':
        score, confidence, completeness, explanation = assess_heat_risk(features)
    elif hazard_type == 'AIR_POLLUTION':
        score, confidence, completeness, explanation = assess_air_pollution_risk(features)
    else:
        # Multi-hazard composite
        f_score, _, _, _ = assess_flood_risk(features)
        h_score, _, _, _ = assess_heat_risk(features)
        a_score, _, _, _ = assess_air_pollution_risk(features)
        score = round(max(f_score, h_score, a_score) * 0.6 + ((f_score + h_score + a_score) / 3.0) * 0.4, 1)
        confidence = 0.85
        completeness = 80.0
        explanation = {
            "rule": "Multi-hazard composite risk index",
            "components": {
                "flood": f_score,
                "heat": h_score,
                "airPollution": a_score,
            }
        }

    risk_level = score_to_risk_level(score)
    severity = risk_level_to_alert_severity(risk_level)

    return RiskPredictionResponse(
        locationId=location_id,
        hazardType=hazard_type,
        riskScore=score,
        riskLevel=risk_level,
        alertSeverity=severity,
        confidence=confidence,
        inputCompletenessPct=completeness,
        modelName=MODEL_NAME,
        modelVersion=MODEL_VERSION,
        modelType=MODEL_TYPE,
        features=features.model_dump(exclude_none=True),
        explanation=explanation,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
