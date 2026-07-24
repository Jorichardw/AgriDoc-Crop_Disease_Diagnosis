-- Fix Tamil Characters in crops table (run this after restarting Spring Boot)
USE agridoc;
ALTER TABLE crops CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE reports CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=0;
SET NAMES 'utf8mb4';
DELETE FROM reports;
DELETE FROM crops;
SET FOREIGN_KEY_CHECKS=1;
ALTER TABLE crops AUTO_INCREMENT = 1;

INSERT INTO crops (id, name, description, image_url) VALUES
(1,'Apple (ஆப்பிள்)','Apple fruit crop grown in hilly regions.',''),
(2,'Banana (வாழை)','Banana fruit crop, widely cultivated in Tamil Nadu.',''),
(3,'Chilli (மிளகாய்)','Chilli pepper crop, major spice crop.',''),
(4,'Coconut (தேங்காய்)','Coconut tree crop, called the tree of life.',''),
(5,'Coffee (காபி)','Coffee berry plant grown in Western Ghats.',''),
(6,'Corn (சோளம்)','Maize / Corn crop used as food and fodder.',''),
(7,'Cotton (பருத்தி)','Cotton fiber plant, major cash crop.',''),
(8,'Ginger (இஞ்சி)','Ginger root spice crop.',''),
(9,'Grapes (திராட்சை)','Grapes vine fruit crop.',''),
(10,'Groundnut (நிலக்கடலை)','Groundnut legume oilseed crop.',''),
(11,'Mango (மாம்பழம்)','Mango tree, king of fruits in India.',''),
(12,'Onion (வெங்காயம்)','Onion bulb vegetable crop.',''),
(13,'Papaya (பப்பாளி)','Papaya tropical fruit crop.',''),
(14,'Potato (உருளைக்கிழங்கு)','Potato tuber vegetable crop.',''),
(15,'Rice (நெல் / அரிசி)','Rice / Paddy grain crop, staple food of Tamil Nadu.',''),
(16,'Soybeans (சோயா பீன்ஸ்)','Soybean oilseed protein crop.',''),
(17,'Sugarcane (கரும்பு)','Sugarcane grass crop for sugar production.',''),
(18,'Tomato (தக்காளி)','Tomato fruit vegetable crop.',''),
(19,'Turmeric (மஞ்சள்)','Turmeric rhizome spice and medicinal crop.',''),
(20,'Wheat (கோதுமை)','Wheat grain grass, staple food crop.',''),
(21,'Brinjal (கத்தரிக்காய்)','Brinjal / Eggplant vegetable crop.',''),
(22,'Bitter Gourd (பாகற்காய்)','Bitter gourd medicinal vegetable crop.',''),
(23,'Bottle Gourd (சுரைக்காய்)','Bottle gourd vegetable crop.',''),
(24,'Cardamom (ஏலக்காய்)','Cardamom queen of spices, grown in hill stations.',''),
(25,'Cassava (மரவள்ளி)','Cassava / Tapioca root crop widely grown in Tamil Nadu.',''),
(26,'Cauliflower (காலிஃப்ளவர்)','Cauliflower winter vegetable crop.',''),
(27,'Drumstick (முருங்கை)','Moringa / Drumstick tree, highly nutritious.',''),
(28,'Garlic (பூண்டு)','Garlic bulb spice crop.',''),
(29,'Guava (கொய்யா)','Guava tropical fruit crop rich in Vitamin C.',''),
(30,'Lady''s Finger (வெண்டைக்காய்)','Okra / Lady finger vegetable crop.',''),
(31,'Lemon (எலுமிச்சை)','Lemon citrus fruit crop.',''),
(32,'Pineapple (அன்னாசி)','Pineapple tropical fruit crop.',''),
(33,'Pomegranate (மாதுளை)','Pomegranate fruit crop rich in antioxidants.',''),
(34,'Sesame (எள்)','Sesame oilseed crop, one of the oldest cultivated plants.',''),
(35,'Watermelon (தர்பூசணி)','Watermelon summer fruit crop.','');

SELECT id, name FROM crops ORDER BY id;
