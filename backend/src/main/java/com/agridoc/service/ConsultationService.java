package com.agridoc.service;

import com.agridoc.dto.request.ConsultationRequest;
import com.agridoc.entity.Consultation;
import com.agridoc.entity.Report;
import com.agridoc.entity.User;
import com.agridoc.exception.CustomException;
import com.agridoc.exception.ResourceNotFoundException;
import com.agridoc.repository.ConsultationRepository;
import com.agridoc.repository.ReportRepository;
import com.agridoc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public Consultation createConsultation(String username, ConsultationRequest request) {
        if (request.getReportId() == null || request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
            throw new CustomException("Report ID and question content are required", HttpStatus.BAD_REQUEST);
        }

        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer user not found: " + username));

        Report report = reportRepository.findById(request.getReportId())
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + request.getReportId()));

        // Verify that the farmer owns this report or is an admin
        if (!report.getFarmer().getId().equals(farmer.getId()) && !farmer.getRole().equals("ADMIN")) {
            throw new CustomException("You can only open a consultation for your own reports", HttpStatus.FORBIDDEN);
        }

        // Build Consultation
        Consultation consultation = Consultation.builder()
                .report(report)
                .farmer(farmer)
                .question(request.getQuestion().trim())
                .status("PENDING")
                .build();

        Consultation saved = consultationRepository.save(consultation);

        // Update corresponding report status to UNDER_REVIEW
        report.setStatus("UNDER_REVIEW");
        reportRepository.save(report);

        return saved;
    }

    public List<Consultation> getConsultationsForFarmer(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer user not found: " + username));
        return consultationRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId());
    }

    public List<Consultation> getPendingConsultationsForExperts() {
        return consultationRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Consultation respondToConsultation(String expertUsername, Long consultationId, String responseText) {
        if (responseText == null || responseText.trim().isEmpty()) {
            throw new CustomException("Response text cannot be empty", HttpStatus.BAD_REQUEST);
        }

        User expert = userRepository.findByUsername(expertUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Expert user not found: " + expertUsername));

        // Verify user is indeed an EXPERT or ADMIN
        if (!expert.getRole().equals("EXPERT") && !expert.getRole().equals("ADMIN")) {
            throw new CustomException("Only experts or administrators can respond to consultations", HttpStatus.FORBIDDEN);
        }

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation ticket not found with ID: " + consultationId));

        consultation.setExpert(expert);
        consultation.setExpertResponse(responseText.trim());
        consultation.setStatus("ANSWERED");
        consultation.setRepliedAt(LocalDateTime.now());

        Consultation updated = consultationRepository.save(consultation);

        // Update corresponding report status to RESOLVED
        Report report = consultation.getReport();
        report.setStatus("RESOLVED");
        reportRepository.save(report);

        return updated;
    }
}
