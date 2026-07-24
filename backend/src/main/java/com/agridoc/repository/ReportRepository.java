package com.agridoc.repository;

import com.agridoc.entity.Report;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Report> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);

    @Query("SELECT r.farmer.region, COUNT(r) FROM Report r GROUP BY r.farmer.region")
    List<Object[]> countReportsByRegion();

    @Query("SELECT r.predictedDiseaseName, COUNT(r) as cnt FROM Report r WHERE r.predictedDiseaseName IS NOT NULL GROUP BY r.predictedDiseaseName ORDER BY cnt DESC")
    List<Object[]> findMostReportedDiseaseNames(Pageable pageable);
}
