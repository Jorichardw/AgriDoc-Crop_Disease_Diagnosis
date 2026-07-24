package com.agridoc.service;

import com.agridoc.dto.response.ReportResponse;
import com.agridoc.entity.Crop;
import com.agridoc.entity.Report;
import com.agridoc.entity.User;
import com.agridoc.exception.CustomException;
import com.agridoc.exception.ResourceNotFoundException;
import com.agridoc.repository.CropRepository;
import com.agridoc.repository.ReportRepository;
import com.agridoc.repository.UserRepository;
import com.agridoc.dto.response.DiagnosisResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final DiagnosisEngine diagnosisEngine;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ReportResponse createReport(String username, Long cropId, String symptoms, MultipartFile imageFile, String geminiKey) {
        // Validate user with fallback for anonymous or missing sessions
        User farmer = null;
        if (username != null && !username.trim().isEmpty() && !"anonymousUser".equalsIgnoreCase(username.trim())) {
            farmer = userRepository.findByUsername(username).orElse(null);
        }
        if (farmer == null) {
            farmer = userRepository.findByUsername("farmer")
                    .orElseGet(() -> userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("No active user found in database")));
        }

        // Validate crop
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new CustomException("Crop not found with ID: " + cropId, HttpStatus.BAD_REQUEST));

        // Diagnose using Google Gemini AI Engine
        DiagnosisResponse diagnosis = diagnosisEngine.diagnose(crop.getName(), symptoms, imageFile, geminiKey);

        String savedImagePath = null;

        // Handle image upload if exists
        if (imageFile != null && !imageFile.isEmpty()) {
            // Validate content type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new CustomException("Only image files are allowed", HttpStatus.BAD_REQUEST);
            }

            // Validate file size (10MB limit)
            if (imageFile.getSize() > 10 * 1024 * 1024) {
                throw new CustomException("Image size must be less than 10MB", HttpStatus.BAD_REQUEST);
            }

            // Clean original filename
            String originalFilename = imageFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            try {
                // Ensure directory exists
                String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
                File uploadFolder = new File(absolutePath);
                if (!uploadFolder.exists()) {
                    uploadFolder.mkdirs();
                }

                // Copy file to disk
                Path destination = Paths.get(absolutePath, uniqueFileName);
                Files.copy(imageFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                
                // Store relative URL path
                savedImagePath = "uploads/" + uniqueFileName;
            } catch (IOException e) {
                throw new CustomException("Failed to save uploaded file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        // Determine severity level with fallback
        String severityLevel = (diagnosis != null && diagnosis.getSeverityLevel() != null && !diagnosis.getSeverityLevel().trim().isEmpty())
                ? diagnosis.getSeverityLevel().trim()
                : "LOW";

        // Build Report entity with dynamic Gemini AI diagnosis properties
        Report report = Report.builder()
                .farmer(farmer)
                .crop(crop)
                .symptomsSubmitted(symptoms)
                .imagePath(savedImagePath)
                .status("DIAGNOSED")
                .predictedDiseaseName(diagnosis != null ? diagnosis.getPredictedDiseaseName() : "Unknown")
                .confidenceScore(diagnosis != null ? diagnosis.getConfidenceScore() : "90%")
                .symptoms(diagnosis != null ? diagnosis.getSymptoms() : symptoms)
                .rootCause(diagnosis != null ? diagnosis.getRootCause() : "Pathogen infection")
                .severityLevel(severityLevel)
                .immediateActions(diagnosis != null ? diagnosis.getImmediateActions() : null)
                .recommendedTreatment(diagnosis != null ? diagnosis.getRecommendedTreatment() : null)
                .preventionMethods(diagnosis != null ? diagnosis.getPreventionMethods() : null)
                .fertilizerSuggestions(diagnosis != null ? diagnosis.getFertilizerSuggestions() : null)
                .irrigationAdvice(diagnosis != null ? diagnosis.getIrrigationAdvice() : null)
                .weatherImpact(diagnosis != null ? diagnosis.getWeatherImpact() : null)
                .expectedRecoveryTime(diagnosis != null ? diagnosis.getExpectedRecoveryTime() : null)
                .additionalExpertRecommendations(diagnosis != null ? diagnosis.getAdditionalExpertRecommendations() : null)
                .build();

        Report savedReport = reportRepository.save(report);
        return mapToResponse(savedReport);
    }

    public List<ReportResponse> getReportsForFarmer(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        return reportRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReportResponse getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));
        return mapToResponse(report);
    }

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReportResponse updateReportStatus(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));
        
        String upperStatus = status.toUpperCase();
        if (!upperStatus.equals("DIAGNOSED") && !upperStatus.equals("UNDER_REVIEW") && !upperStatus.equals("RESOLVED")) {
            throw new CustomException("Invalid report status: " + status, HttpStatus.BAD_REQUEST);
        }

        report.setStatus(upperStatus);
        return mapToResponse(reportRepository.save(report));
    }

    public ReportResponse mapToResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .farmerId(report.getFarmer().getId())
                .farmerName(report.getFarmer().getFullName())
                .farmerRegion(report.getFarmer().getRegion())
                .farmerPhone(report.getFarmer().getPhone())
                .cropId(report.getCrop().getId())
                .cropName(CropService.getBilingualName(report.getCrop().getName()))
                .symptomsSubmitted(report.getSymptomsSubmitted())
                .imagePath(report.getImagePath())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt() != null ? report.getCreatedAt() : LocalDateTime.now())
                
                // Dynamic AI Fields
                .predictedDiseaseName(report.getPredictedDiseaseName())
                .confidenceScore(report.getConfidenceScore())
                .symptoms(report.getSymptoms())
                .rootCause(report.getRootCause())
                .severityLevel(report.getSeverityLevel())
                .immediateActions(report.getImmediateActions())
                .recommendedTreatment(report.getRecommendedTreatment())
                .preventionMethods(report.getPreventionMethods())
                .fertilizerSuggestions(report.getFertilizerSuggestions())
                .irrigationAdvice(report.getIrrigationAdvice())
                .weatherImpact(report.getWeatherImpact())
                .expectedRecoveryTime(report.getExpectedRecoveryTime())
                .additionalExpertRecommendations(report.getAdditionalExpertRecommendations())
                .build();
    }
}
