import pytest
from app.schemas import InputFeatures, RiskPredictionRequest
from app.models.baseline_model import (
    score_to_risk_level,
    risk_level_to_alert_severity,
    predict_hazard_risk,
)

def test_half_open_range_mappings():
    # [0, 20) => VERY_LOW
    assert score_to_risk_level(0.0) == 'VERY_LOW'
    assert score_to_risk_level(19.9) == 'VERY_LOW'

    # [20, 40) => LOW
    assert score_to_risk_level(20.0) == 'LOW'
    assert score_to_risk_level(39.9) == 'LOW'

    # [40, 60) => MODERATE
    assert score_to_risk_level(40.0) == 'MODERATE'
    assert score_to_risk_level(59.9) == 'MODERATE'

    # [60, 80) => HIGH
    assert score_to_risk_level(60.0) == 'HIGH'
    assert score_to_risk_level(79.9) == 'HIGH'

    # [80, 100] => CRITICAL
    assert score_to_risk_level(80.0) == 'CRITICAL'
    assert score_to_risk_level(100.0) == 'CRITICAL'

def test_severity_mapping():
    assert risk_level_to_alert_severity('VERY_LOW') == 'LOW'
    assert risk_level_to_alert_severity('LOW') == 'LOW'
    assert risk_level_to_alert_severity('MODERATE') == 'MEDIUM'
    assert risk_level_to_alert_severity('HIGH') == 'HIGH'
    assert risk_level_to_alert_severity('CRITICAL') == 'CRITICAL'

def test_flood_prediction_determinism_and_completeness():
    features = InputFeatures(
        precipitationMm=75.0,
        imperviousSurfacePct=80.0,
        ndwi=0.30,
        drainageDensityKmPerKm2=1.8,
        elevationMeters=205.0,
    )

    resp = predict_hazard_risk("delhi-anand-vihar", "FLOOD", features)
    assert resp.riskScore >= 60.0
    assert resp.riskLevel in ('HIGH', 'CRITICAL')
    assert resp.modelType == 'baseline'
    assert resp.confidence >= 0.85
    assert resp.inputCompletenessPct == 100.0
    assert "precipitationContribution" in resp.explanation["factorBreakdown"]

def test_heat_prediction():
    features = InputFeatures(
        temperatureC=42.0,
        relativeHumidityPct=55.0,
        landSurfaceTempC=46.5,
        ndbi=0.35,
        ndvi=0.10,
    )

    resp = predict_hazard_risk("delhi-central", "HEAT", features)
    assert resp.riskScore >= 65.0
    assert resp.riskLevel in ('HIGH', 'CRITICAL')
    assert resp.alertSeverity in ('HIGH', 'CRITICAL')
    assert resp.modelType == 'baseline'
