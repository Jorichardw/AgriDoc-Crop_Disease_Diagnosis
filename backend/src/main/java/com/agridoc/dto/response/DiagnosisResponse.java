package com.agridoc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisResponse {
    private String predictedDiseaseName;
    private String confidenceScore;
    private String symptoms;
    private String rootCause;
    private String severityLevel;
    private String immediateActions;
    private String recommendedTreatment;
    private String preventionMethods;
    private String fertilizerSuggestions;
    private String irrigationAdvice;
    private String weatherImpact;
    private String expectedRecoveryTime;
    private String additionalExpertRecommendations;
}
