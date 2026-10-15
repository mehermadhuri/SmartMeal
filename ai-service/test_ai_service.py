"""
Unit tests for SmartMeal AI Demand Prediction Microservice
"""
from app.model import predictor
from app.main import health_check, predict_demand, PredictionRequest

def test_model_prediction():
    res = predictor.predict("2026-10-15", "LUNCH", "12:45 PM - 02:00 PM")
    assert "predicted_demand" in res, "Missing predicted_demand"
    assert res["predicted_demand"] > 0, "Demand should be positive"
    assert "recommended_buffer" in res, "Missing recommended_buffer"
    assert "recommended_total" in res, "Missing recommended_total"
    assert res["recommended_total"] >= res["predicted_demand"], "Buffer must increase or match demand"
    assert "12:45 PM - 02:00 PM" in predictor.slot_code_map
    if predictor.model is not None:
        assert res["model_used"] == "RandomForestRegressor"
    print("test_model_prediction: PASSED")

def test_health_check_function():
    data = health_check()
    assert data["status"] == "UP"
    assert data["service"] == "SmartMeal AI Demand Prediction Microservice"
    assert "model_trained" in data
    print("test_health_check_function: PASSED")

def test_predict_demand_endpoint():
    req = PredictionRequest(
        date="2026-10-16",
        meal_type="TIFFIN",
        slot_name="08:00 AM - 09:00 AM",
        special_event_flag=0
    )
    data = predict_demand(req)
    assert data["status"] == "SUCCESS"
    assert data["predicted_demand"] > 0
    assert "recommended_buffer" in data
    print("test_predict_demand_endpoint: PASSED")

if __name__ == "__main__":
    test_model_prediction()
    test_health_check_function()
    test_predict_demand_endpoint()
    print("All AI service tests passed successfully (3/3)!")
