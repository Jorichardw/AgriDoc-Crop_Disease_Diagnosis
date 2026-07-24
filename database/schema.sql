-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS agridoc;
USE agridoc;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    region VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'FARMER', 'EXPERT', 'ADMIN'
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crops Table
CREATE TABLE crops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255)
);

-- 3. Reports Table
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    crop_id BIGINT NOT NULL,
    symptoms_submitted TEXT NOT NULL,
    image_path VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- 'DIAGNOSED', 'UNDER_REVIEW', 'RESOLVED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Dynamic AI diagnosis fields
    predicted_disease_name VARCHAR(150),
    confidence_score VARCHAR(20),
    symptoms TEXT,
    root_cause TEXT,
    severity_level VARCHAR(20),
    immediate_actions TEXT,
    recommended_treatment TEXT,
    prevention_methods TEXT,
    fertilizer_suggestions TEXT,
    irrigation_advice TEXT,
    weather_impact TEXT,
    expected_recovery_time VARCHAR(100),
    additional_expert_recommendations TEXT,
    
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- 4. Consultations Table
CREATE TABLE consultations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    expert_id BIGINT,
    question TEXT NOT NULL,
    expert_response TEXT,
    status VARCHAR(20) NOT NULL, -- 'PENDING', 'ANSWERED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Forum Posts Table
CREATE TABLE forum_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed default admin account (password is 'admin123' BCrypt hashed)a
INSERT INTO users (username, password, email, phone, region, role, full_name) 
VALUES ('admin', '$2a$10$tM2MDRPjP32yWq.c6Ujfeee3zO/8x1R.P1eZ5C1P6.w6Wz/GvU3.a', 'admin@agridoc.com', '+1234567890', 'Central Region', 'ADMIN', 'AgriDoc Administrator');

-- Seed Crops (35 Crops in alphabetical order with bilingual names)
INSERT INTO crops (id, name, description, image_url) VALUES
(1, 'Apple (ஆப்பிள்)', 'Apple fruit crop grown in hilly regions.', 'assets/images/apple.jpg'),
(2, 'Banana (வாழை)', 'Banana fruit crop, widely cultivated in Tamil Nadu.', 'assets/images/banana.jpg'),
(3, 'Chilli (மிளகாய்)', 'Chilli pepper crop, major spice crop.', 'assets/images/chilli.jpg'),
(4, 'Coconut (தேங்காய்)', 'Coconut tree crop, called the tree of life.', 'assets/images/coconut.jpg'),
(5, 'Coffee (காபி)', 'Coffee berry plant grown in Western Ghats.', 'assets/images/coffee.jpg'),
(6, 'Corn (சோளம்)', 'Maize / Corn crop used as food and fodder.', 'assets/images/corn.jpg'),
(7, 'Cotton (பருத்தி)', 'Cotton fiber plant, major cash crop.', 'assets/images/cotton.jpg'),
(8, 'Ginger (இஞ்சி)', 'Ginger root spice crop.', 'assets/images/ginger.jpg'),
(9, 'Grapes (திராட்சை)', 'Grapes vine fruit crop.', 'assets/images/grapes.jpg'),
(10, 'Groundnut (நிலக்கடலை)', 'Groundnut legume oilseed crop.', 'assets/images/groundnut.jpg'),
(11, 'Mango (மாம்பழம்)', 'Mango tree, king of fruits in India.', 'assets/images/mango.jpg'),
(12, 'Onion (வெங்காயம்)', 'Onion bulb vegetable crop.', 'assets/images/onion.jpg'),
(13, 'Papaya (பப்பாளி)', 'Papaya tropical fruit crop.', 'assets/images/papaya.jpg'),
(14, 'Potato (உருளைக்கிழங்கு)', 'Potato tuber vegetable crop.', 'assets/images/potato.jpg'),
(15, 'Rice (நெல் / அரிசி)', 'Rice / Paddy grain crop, staple food of Tamil Nadu.', 'assets/images/rice.jpg'),
(16, 'Soybeans (சோயா பீன்ஸ்)', 'Soybean oilseed protein crop.', 'assets/images/soybean.jpg'),
(17, 'Sugarcane (கரும்பு)', 'Sugarcane grass crop for sugar production.', 'assets/images/sugarcane.jpg'),
(18, 'Tomato (தக்காளி)', 'Tomato fruit vegetable crop.', 'assets/images/tomato.jpg'),
(19, 'Turmeric (மஞ்சள்)', 'Turmeric rhizome spice and medicinal crop.', 'assets/images/turmeric.jpg'),
(20, 'Wheat (கோதுமை)', 'Wheat grain grass, staple food crop.', 'assets/images/wheat.jpg'),
(21, 'Brinjal (கத்தரிக்காய்)', 'Brinjal / Eggplant vegetable crop.', 'assets/images/brinjal.jpg'),
(22, 'Bitter Gourd (பாகற்காய்)', 'Bitter gourd medicinal vegetable crop.', 'assets/images/bitter_gourd.jpg'),
(23, 'Bottle Gourd (சுரைக்காய்)', 'Bottle gourd vegetable crop.', 'assets/images/bottle_gourd.jpg'),
(24, 'Cardamom (ஏலக்காய்)', 'Cardamom queen of spices, grown in hill stations.', 'assets/images/cardamom.jpg'),
(25, 'Cassava (மரவள்ளி)', 'Cassava / Tapioca root crop widely grown in Tamil Nadu.', 'assets/images/cassava.jpg'),
(26, 'Cauliflower (காலிஃப்ளவர்)', 'Cauliflower winter vegetable crop.', 'assets/images/cauliflower.jpg'),
(27, 'Drumstick (முருங்கை)', 'Moringa / Drumstick tree, highly nutritious.', 'assets/images/drumstick.jpg'),
(28, 'Garlic (பூண்டு)', 'Garlic bulb spice crop.', 'assets/images/garlic.jpg'),
(29, 'Guava (கொய்யா)', 'Guava tropical fruit crop rich in Vitamin C.', 'assets/images/guava.jpg'),
(30, 'Lady''s Finger (வெண்டைக்காய்)', 'Okra / Lady''s finger vegetable crop.', 'assets/images/ladysfinger.jpg'),
(31, 'Lemon (எலுமிச்சை)', 'Lemon citrus fruit crop.', 'assets/images/lemon.jpg'),
(32, 'Pineapple (அன்னாசி)', 'Pineapple tropical fruit crop.', 'assets/images/pineapple.jpg'),
(33, 'Pomegranate (மாதுளை)', 'Pomegranate fruit crop rich in antioxidants.', 'assets/images/pomegranate.jpg'),
(34, 'Sesame (எள்)', 'Sesame oilseed crop, one of the oldest cultivated plants.', 'assets/images/sesame.jpg'),
(35, 'Watermelon (தர்பூசணி)', 'Watermelon summer fruit crop.', 'assets/images/watermelon.jpg');

