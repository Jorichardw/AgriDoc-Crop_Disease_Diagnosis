package com.agridoc.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaMigrator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking database schema for 'reports' table...");

            // Query column existence for 'severity' in 'reports' table
            Integer severityColCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reports' AND column_name = 'severity'",
                Integer.class
            );

            if (severityColCount != null && severityColCount > 0) {
                log.warn("Obsolete column 'severity' detected in 'reports' table. Starting schema migration...");

                // Check if 'severity_level' already exists
                Integer severityLevelColCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reports' AND column_name = 'severity_level'",
                    Integer.class
                );

                if (severityLevelColCount != null && severityLevelColCount > 0) {
                    // Both severity and severity_level exist. Drop the obsolete 'severity' column.
                    log.info("Migrating data and dropping obsolete 'severity' column...");
                    jdbcTemplate.execute("UPDATE reports SET severity_level = severity WHERE severity_level IS NULL AND severity IS NOT NULL");
                    jdbcTemplate.execute("ALTER TABLE reports DROP COLUMN severity");
                    log.info("Successfully dropped obsolete 'severity' column from 'reports' table.");
                } else {
                    // Only severity exists. Rename it to severity_level.
                    log.info("Renaming column 'severity' to 'severity_level'...");
                    jdbcTemplate.execute("ALTER TABLE reports CHANGE COLUMN severity severity_level VARCHAR(20) NULL");
                    log.info("Successfully renamed column 'severity' to 'severity_level'.");
                }
            } else {
                log.info("'reports' table schema is clean and matches entity definitions.");
            }

            // Ensure severity_level column is nullable or has reasonable default
            Integer severityLevelExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reports' AND column_name = 'severity_level'",
                Integer.class
            );
            if (severityLevelExists != null && severityLevelExists > 0) {
                jdbcTemplate.execute("ALTER TABLE reports MODIFY COLUMN severity_level VARCHAR(20) NULL");
            }

        } catch (Exception e) {
            log.error("Failed to execute database schema migration check: {}", e.getMessage(), e);
        }
    }
}
