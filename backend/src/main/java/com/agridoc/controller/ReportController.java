package com.agridoc.controller;

import com.agridoc.dto.response.ReportResponse;
import com.agridoc.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @RequestParam("cropId") Long cropId,
            @RequestParam(value = "symptoms", required = false, defaultValue = "") String symptoms,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader(value = "X-Gemini-Key", required = false) String geminiKey) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ReportResponse response = reportService.createReport(username, cropId, symptoms, image, geminiKey);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<ReportResponse>> getFarmerReportHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ReportResponse> history = reportService.getReportsForFarmer(username);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReportResponse> updateReportStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, status));
    }
}
