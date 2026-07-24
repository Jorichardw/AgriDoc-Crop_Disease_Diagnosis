package com.agridoc.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @Column(name = "symptoms_submitted", nullable = false, columnDefinition = "TEXT")
    private String symptomsSubmitted;

    @Column(name = "image_path")
    private String imagePath; // Relative path to file (e.g. uploads/xxx.jpg)

    @Column(nullable = false, length = 20)
    private String status; // 'DIAGNOSED', 'UNDER_REVIEW', 'RESOLVED'

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Dynamic AI diagnosis fields from Google Gemini API
    @Column(name = "predicted_disease_name")
    private String predictedDiseaseName;

    @Column(name = "confidence_score")
    private String confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "severity_level", length = 20)
    private String severityLevel;

    @Column(name = "immediate_actions", columnDefinition = "TEXT")
    private String immediateActions;

    @Column(name = "recommended_treatment", columnDefinition = "TEXT")
    private String recommendedTreatment;

    @Column(name = "prevention_methods", columnDefinition = "TEXT")
    private String preventionMethods;

    @Column(name = "fertilizer_suggestions", columnDefinition = "TEXT")
    private String fertilizerSuggestions;

    @Column(name = "irrigation_advice", columnDefinition = "TEXT")
    private String irrigationAdvice;

    @Column(name = "weather_impact", columnDefinition = "TEXT")
    private String weatherImpact;

    @Column(name = "expected_recovery_time")
    private String expectedRecoveryTime;

    @Column(name = "additional_expert_recommendations", columnDefinition = "TEXT")
    private String additionalExpertRecommendations;
}
