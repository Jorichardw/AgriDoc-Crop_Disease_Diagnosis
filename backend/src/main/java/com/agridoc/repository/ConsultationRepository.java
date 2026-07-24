package com.agridoc.repository;

import com.agridoc.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Consultation> findByStatusOrderByCreatedAtDesc(String status);
    List<Consultation> findAllByOrderByCreatedAtDesc();
}
