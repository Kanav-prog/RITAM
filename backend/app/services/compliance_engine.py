class ComplianceEngine:
    @staticmethod
    def calculate_survival_rate(verified_surviving_plants: int, verified_planted_plants: int) -> float:
        """
        Calculates the survival rate based on mathematical formula.
        Survival Rate = Verified Surviving Plants / Verified Planted Plants × 100
        """
        if verified_planted_plants == 0:
            return 0.0
        return (verified_surviving_plants / verified_planted_plants) * 100.0

    @staticmethod
    def calculate_verification_rate(verified_plants: int, total_planted: int) -> float:
        """
        Calculates the verification rate.
        Verification Rate = Verified Plants / Total Planted × 100
        """
        if total_planted == 0:
            return 0.0
        return (verified_plants / total_planted) * 100.0

    @staticmethod
    def assess_compliance_status(target_trees: int, verified_trees: int, survival_rate: float) -> str:
        """
        Returns compliance status based on Section 4.2.
        - target_trees == 0 -> BASELINE_ONLY
        - verified_trees < (target_trees * 0.8) -> NEEDS_ATTENTION
        - survival_rate < 70.0% -> AT_RISK
        - otherwise -> COMPLIANT
        """
        if target_trees == 0:
            return "BASELINE_ONLY"
        if verified_trees < (target_trees * 0.8):
            return "NEEDS_ATTENTION"
        if survival_rate < 70.0:
            return "AT_RISK"
        return "COMPLIANT"
