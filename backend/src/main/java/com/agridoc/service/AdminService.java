package com.agridoc.service;

import com.agridoc.entity.User;
import com.agridoc.exception.CustomException;
import com.agridoc.exception.ResourceNotFoundException;
import com.agridoc.repository.ReportRepository;
import com.agridoc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Total reports count
        long totalReports = reportRepository.count();
        stats.put("totalReports", totalReports);

        // 2. Most-reported disease
        List<Object[]> mostReported = reportRepository.findMostReportedDiseaseNames(PageRequest.of(0, 1));
        String mostReportedDisease = "None";
        if (mostReported != null && !mostReported.isEmpty()) {
            mostReportedDisease = (String) mostReported.get(0)[0];
        }
        stats.put("mostReportedDisease", mostReportedDisease);

        // 3. Region-wise report counts
        List<Object[]> regions = reportRepository.countReportsByRegion();
        Map<String, Long> regionStats = new HashMap<>();
        for (Object[] row : regions) {
            String region = (String) row[0];
            Long count = (Long) row[1];
            regionStats.put(region != null && !region.trim().isEmpty() ? region : "Unknown", count);
        }
        stats.put("regionStats", regionStats);

        // Extra details for a high quality Admin dashboard
        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarmers", userRepository.countByRole("FARMER"));
        stats.put("totalExperts", userRepository.countByRole("EXPERT"));
        stats.put("totalAdmins", userRepository.countByRole("ADMIN"));
        stats.put("totalResolvedReports", reportRepository.countByStatus("RESOLVED"));

        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String upperRole = role.toUpperCase();
        if (!upperRole.equals("FARMER") && !upperRole.equals("EXPERT") && !upperRole.equals("ADMIN")) {
            throw new CustomException("Invalid role. Role must be FARMER, EXPERT, or ADMIN", HttpStatus.BAD_REQUEST);
        }

        user.setRole(upperRole);
        return userRepository.save(user);
    }
}
