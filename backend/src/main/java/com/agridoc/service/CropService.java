package com.agridoc.service;

import com.agridoc.entity.Crop;
import com.agridoc.exception.ResourceNotFoundException;
import com.agridoc.repository.CropRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CropService {

    private final CropRepository cropRepository;

    private static final Map<String, String> BILINGUAL_NAMES = new HashMap<>();

    static {
        BILINGUAL_NAMES.put("apple", "Apple (ஆப்பிள்)");
        BILINGUAL_NAMES.put("banana", "Banana (வாழை)");
        BILINGUAL_NAMES.put("chilli", "Chilli (மிளகாய்)");
        BILINGUAL_NAMES.put("coconut", "Coconut (தேங்காய்)");
        BILINGUAL_NAMES.put("coffee", "Coffee (காபி)");
        BILINGUAL_NAMES.put("corn", "Corn (சோளம்)");
        BILINGUAL_NAMES.put("cotton", "Cotton (பருத்தி)");
        BILINGUAL_NAMES.put("ginger", "Ginger (இஞ்சி)");
        BILINGUAL_NAMES.put("grapes", "Grapes (திராட்சை)");
        BILINGUAL_NAMES.put("groundnut", "Groundnut (நிலக்கடலை)");
        BILINGUAL_NAMES.put("mango", "Mango (மாம்பழம்)");
        BILINGUAL_NAMES.put("onion", "Onion (வெங்காயம்)");
        BILINGUAL_NAMES.put("papaya", "Papaya (பப்பாளி)");
        BILINGUAL_NAMES.put("potato", "Potato (உருளைக்கிழங்கு)");
        BILINGUAL_NAMES.put("rice", "Rice (நெல் / அரிசி)");
        BILINGUAL_NAMES.put("soybeans", "Soybeans (சோயா பீன்ஸ்)");
        BILINGUAL_NAMES.put("sugarcane", "Sugarcane (கரும்பு)");
        BILINGUAL_NAMES.put("tomato", "Tomato (தக்காளி)");
        BILINGUAL_NAMES.put("turmeric", "Turmeric (மஞ்சள்)");
        BILINGUAL_NAMES.put("wheat", "Wheat (கோதுமை)");
        BILINGUAL_NAMES.put("brinjal", "Brinjal (கத்தரிக்காய்)");
        BILINGUAL_NAMES.put("bitter gourd", "Bitter Gourd (பாகற்காய்)");
        BILINGUAL_NAMES.put("bottle gourd", "Bottle Gourd (சுரைக்காய்)");
        BILINGUAL_NAMES.put("cardamom", "Cardamom (ஏலக்காய்)");
        BILINGUAL_NAMES.put("cassava", "Cassava (மரவள்ளி)");
        BILINGUAL_NAMES.put("cauliflower", "Cauliflower (காலிஃப்ளவர்)");
        BILINGUAL_NAMES.put("drumstick", "Drumstick (முருங்கை)");
        BILINGUAL_NAMES.put("garlic", "Garlic (பூண்டு)");
        BILINGUAL_NAMES.put("guava", "Guava (கொய்யா)");
        BILINGUAL_NAMES.put("lady's finger", "Lady's Finger (வெண்டைக்காய்)");
        BILINGUAL_NAMES.put("lemon", "Lemon (எலுமிச்சை)");
        BILINGUAL_NAMES.put("pineapple", "Pineapple (அன்னாசி)");
        BILINGUAL_NAMES.put("pomegranate", "Pomegranate (மாதுளை)");
        BILINGUAL_NAMES.put("sesame", "Sesame (எள்)");
        BILINGUAL_NAMES.put("watermelon", "Watermelon (தர்பூசணி)");
    }

    public List<Crop> getAllCrops() {
        return cropRepository.findAll().stream()
                .map(this::normalizeBilingualName)
                .collect(Collectors.toList());
    }

    public Crop getCropById(Long id) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + id));
        return normalizeBilingualName(crop);
    }

    public Crop addCrop(Crop crop) {
        return cropRepository.save(crop);
    }

    private Crop normalizeBilingualName(Crop crop) {
        if (crop == null || crop.getName() == null) return crop;
        String rawName = crop.getName().trim();
        if (!rawName.contains("(")) {
            String key = rawName.toLowerCase();
            for (Map.Entry<String, String> entry : BILINGUAL_NAMES.entrySet()) {
                if (key.contains(entry.getKey())) {
                    crop.setName(entry.getValue());
                    break;
                }
            }
        }
        return crop;
    }
}
