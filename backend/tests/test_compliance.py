import pytest
from app.services.compliance_engine import ComplianceEngine

def test_calculate_survival_rate():
    # 80 surviving out of 100 verified
    assert ComplianceEngine.calculate_survival_rate(80, 100) == 80.0
    # 0 verified planted
    assert ComplianceEngine.calculate_survival_rate(0, 0) == 0.0
    # all surviving
    assert ComplianceEngine.calculate_survival_rate(50, 50) == 100.0

def test_calculate_verification_rate():
    # 50 verified out of 100 total planted
    assert ComplianceEngine.calculate_verification_rate(50, 100) == 50.0
    # 0 total planted
    assert ComplianceEngine.calculate_verification_rate(0, 0) == 0.0

def test_assess_compliance_status():
    # target_trees == 0 -> BASELINE_ONLY
    assert ComplianceEngine.assess_compliance_status(0, 0, 0.0) == "BASELINE_ONLY"
    
    # verified_trees < (target_trees * 0.8) -> NEEDS_ATTENTION
    assert ComplianceEngine.assess_compliance_status(100, 79, 100.0) == "NEEDS_ATTENTION"
    assert ComplianceEngine.assess_compliance_status(100, 80, 100.0) != "NEEDS_ATTENTION"
    
    # survival_rate < 70.0% -> AT_RISK
    assert ComplianceEngine.assess_compliance_status(100, 100, 69.9) == "AT_RISK"
    assert ComplianceEngine.assess_compliance_status(100, 100, 70.0) == "COMPLIANT"
    
    # otherwise -> COMPLIANT
    assert ComplianceEngine.assess_compliance_status(100, 100, 95.0) == "COMPLIANT"
