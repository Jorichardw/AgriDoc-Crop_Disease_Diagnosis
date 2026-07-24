package com.agridoc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Long id;
    
    // Farmer details
    private Long farmerId;
    private String farmerName;
    private String farmerRegion;
    private String farmerPhone;
    
    // Crop details
    private Long cropId;
    private String cropName;
    
    private String symptomsSubmitted;
    private String imagePath;
    private String status;
    private LocalDateTime createdAt;

    // Dynamic AI diagnosis fields
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
