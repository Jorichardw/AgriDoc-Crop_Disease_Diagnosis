package com.agridoc.controller;

import com.agridoc.dto.request.ConsultationRequest;
import com.agridoc.entity.Consultation;
import com.agridoc.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    public ResponseEntity<Consultation> createConsultation(@RequestBody ConsultationRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Consultation consultation = consultationService.createConsultation(username, request);
        return new ResponseEntity<>(consultation, HttpStatus.CREATED);
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<Consultation>> getFarmerConsultations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Consultation> consultations = consultationService.getConsultationsForFarmer(username);
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/expert/pending")
    public ResponseEntity<List<Consultation>> getExpertPendingConsultations() {
        List<Consultation> pending = consultationService.getPendingConsultationsForExperts();
        return ResponseEntity.ok(pending);
    }

    @GetMapping
    public ResponseEntity<List<Consultation>> getAllConsultations() {
        return ResponseEntity.ok(consultationService.getAllConsultations());
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<Consultation> respondToConsultation(
            @PathVariable Long id,
            @RequestParam("response") String response) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Consultation updated = consultationService.respondToConsultation(username, id, response);
        return ResponseEntity.ok(updated);
    }
}
