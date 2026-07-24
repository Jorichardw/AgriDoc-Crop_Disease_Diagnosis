// Farmer Dashboard Handler

// One-time crop cache refresh
localStorage.removeItem('agridoc_crops');

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure we are logged in as FARMER or ADMIN
    const user = api.getCurrentUser();
    if (!user) return; // auth.js will handle redirect

    try {
        // Parallel fetch for speed
        const [crops, reports, consultations] = await Promise.all([
            api.getCrops(),
            api.getFarmerReports(),
            api.getFarmerConsultations()
        ]);

        // Render dashboard statistics
        renderStats(reports, consultations);
        
        // Render crop selection grid
        renderCrops(crops);
        
        // Render recent report history (max 4)
        renderRecentReports(reports);

        // Render consultations list
        renderConsultations(consultations);

    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
});

function renderStats(reports, consultations) {
    const totalReportsCount = reports.length;
    const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;
    const pendingConsultationsCount = consultations.filter(c => c.status === 'PENDING').length;

    const repCountEl = document.getElementById('stats-total-reports');
    const resCountEl = document.getElementById('stats-resolved-cases');
    const pendCountEl = document.getElementById('stats-pending-consultations');

    if (repCountEl) repCountEl.textContent = totalReportsCount;
    if (resCountEl) resCountEl.textContent = resolvedCount;
    if (pendCountEl) pendCountEl.textContent = pendingConsultationsCount;
}

let allCropsData = [];

function renderCrops(crops) {
    allCropsData = crops;
    const cropContainer = document.getElementById('crop-selection-grid');
    if (!cropContainer) return;

    renderCropGrid(crops);

    // Wire up search
    const searchInput = document.getElementById('crop-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                renderCropGrid(allCropsData);
            } else {
                renderCropGrid(allCropsData.filter(c => c.name.toLowerCase().includes(query)));
            }
        });
    }
}

// Curated high-resolution images for all 35 crops
const DIRECT_CROP_IMAGES = {
    'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop',
    'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop',
    'chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop',
    'coconut': 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop',
    'coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop',
    'cotton': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&auto=format&fit=crop',
    'ginger': 'https://images.unsplash.com/photo-1573780892033-52e51b0ae0c6?w=400&auto=format&fit=crop',
    'grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop',
    'groundnut': 'https://images.unsplash.com/photo-1567892320421-1c657571ea48?w=400&auto=format&fit=crop',
    'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop',
    'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=400&auto=format&fit=crop',
    'papaya': 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&auto=format&fit=crop',
    'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop',
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop',
    'soybeans': 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&auto=format&fit=crop',
    'sugarcane': 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&auto=format&fit=crop',
    'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop',
    'turmeric': 'https://images.unsplash.com/photo-1601300171949-ccaa66c29eca?w=400&auto=format&fit=crop',
    'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop',
    'brinjal': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop',
    'bitter gourd': 'https://images.unsplash.com/photo-1628773822503-930a84594247?w=400&auto=format&fit=crop',
    'bottle gourd': 'https://images.unsplash.com/photo-1598170845058-128a34a475cb?w=400&auto=format&fit=crop',
    'cardamom': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop',
    'cassava': 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&auto=format&fit=crop',
    'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop',
    'drumstick': 'https://images.unsplash.com/photo-1567468958253-b84e67fe8f4c?w=400&auto=format&fit=crop',
    'garlic': 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop',
    'guava': 'https://images.unsplash.com/photo-1536511135898-1002047814b7?w=400&auto=format&fit=crop',
    "lady's finger": 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&auto=format&fit=crop',
    'lemon': 'https://images.unsplash.com/photo-1534531141161-e41d133a8b50?w=400&auto=format&fit=crop',
    'pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop',
    'pomegranate': 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=400&auto=format&fit=crop',
    'sesame': 'https://images.unsplash.com/photo-1509358211425-24d04cbcb6b5?w=400&auto=format&fit=crop',
    'watermelon': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&auto=format&fit=crop'
};

const TAMIL_CROP_NAMES = {
    'apple': 'ஆப்பிள்',
    'banana': 'வாழை',
    'chilli': 'மிளகாய்',
    'coconut': 'தேங்காய்',
    'coffee': 'காபி',
    'corn': 'சோளம்',
    'cotton': 'பருத்தி',
    'ginger': 'இஞ்சி',
    'grapes': 'திராட்சை',
    'groundnut': 'நிலக்கடலை',
    'mango': 'மாம்பழம்',
    'onion': 'வெங்காயம்',
    'papaya': 'பப்பாளி',
    'potato': 'உருளைக்கிழங்கு',
    'rice': 'நெல் / அரிசி',
    'soybeans': 'சோயா பீன்ஸ்',
    'sugarcane': 'கரும்பு',
    'tomato': 'தக்காளி',
    'turmeric': 'மஞ்சள்',
    'wheat': 'கோதுமை',
    'brinjal': 'கத்தரிக்காய்',
    'bitter gourd': 'பாகற்காய்',
    'bottle gourd': 'சுரைக்காய்',
    'cardamom': 'ஏலக்காய்',
    'cassava': 'மரவள்ளி',
    'cauliflower': 'காலிஃப்ளவர்',
    'drumstick': 'முருங்கை',
    'garlic': 'பூண்டு',
    'guava': 'கொய்யா',
    "lady's finger": 'வெண்டைக்காய்',
    'lemon': 'எலுமிச்சை',
    'pineapple': 'அன்னாசி',
    'pomegranate': 'மாதுளை',
    'sesame': 'எள்',
    'watermelon': 'தர்பூசணி'
};

const cropImageCache = new Map();

function getCropKey(name) {
    if (!name) return 'generic';
    return name.toLowerCase().split(' (')[0].trim();
}

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><circle cx='30' cy='30' r='30' fill='%23E8F5E9'/><path d='M30 10 C18 10 12 22 14 34 C22 28 38 28 46 34 C48 22 42 10 30 10Z' fill='%234CAF50' opacity='0.7'/><path d='M30 10 L30 42' stroke='%232E7D32' stroke-width='1.5' stroke-linecap='round'/></svg>`;

async function fetchWikiImage(cropName) {
    const key = getCropKey(cropName);
    if (DIRECT_CROP_IMAGES[key]) {
        return DIRECT_CROP_IMAGES[key];
    }
    if (cropImageCache.has(key)) return cropImageCache.get(key);

    const wikiTitle = cropName.split(' (')[0].replace(/\s+/g, '_');
    try {
        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
        );
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        const imgUrl = data.originalimage?.source || data.thumbnail?.source || null;
        cropImageCache.set(key, imgUrl);
        return imgUrl;
    } catch {
        cropImageCache.set(key, null);
        return null;
    }
}

function applyImageToCard(cropId, url) {
    const wrapper = document.getElementById(`wrapper-${cropId}`);
    if (!wrapper || !wrapper.isConnected) return;
    const imgEl = document.getElementById(`img-${cropId}`);
    if (imgEl) {
        imgEl.src = url || FALLBACK_SVG;
        imgEl.style.opacity = '1';
        imgEl.style.display = 'block';
        wrapper.classList.remove('crop-skeleton');
    }
}

async function loadImagesSequentially(crops) {
    for (const crop of crops) {
        const key = getCropKey(crop.name);
        let url = DIRECT_CROP_IMAGES[key] || cropImageCache.get(key);
        if (!url) {
            url = await fetchWikiImage(crop.name);
        }
        applyImageToCard(crop.id, url);
    }
}

function renderCropGrid(crops) {
    const cropContainer = document.getElementById('crop-selection-grid');
    if (!cropContainer) return;

    if (!crops || crops.length === 0) {
        cropContainer.innerHTML = '<p class="hint" style="padding: 20px; text-align: center; color: #9E9E9E;">No crops found matching your search.</p>';
        return;
    }

    const sorted = [...crops].sort((a, b) => {
        const nameA = a.name.split(' (')[0].toLowerCase();
        const nameB = b.name.split(' (')[0].toLowerCase();
        return nameA.localeCompare(nameB);
    });

    cropContainer.innerHTML = sorted.map(crop => {
        const nameParts = crop.name.split(' (');
        const englishName = nameParts[0].trim();
        const key = getCropKey(crop.name);
        let tamilName = nameParts[1] ? nameParts[1].replace(')', '').trim() : '';
        if (!tamilName && TAMIL_CROP_NAMES[key]) {
            tamilName = TAMIL_CROP_NAMES[key];
        }

        const directImg = DIRECT_CROP_IMAGES[key] || FALLBACK_SVG;

        return `
            <div class="crop-card" onclick="startDiagnosis(${crop.id})" title="${crop.description || crop.name}">
                <div class="crop-img-wrapper" id="wrapper-${crop.id}">
                    <img class="crop-real-img" id="img-${crop.id}" src="${directImg}"
                         alt="${englishName}" style="display:block; opacity:1;"
                         onerror="this.src='${FALLBACK_SVG}';">
                </div>
                <h4>${englishName}</h4>
                <div class="crop-tamil" style="color: var(--primary-green); font-weight: 600; font-size: 0.88rem; margin-top: 4px;">${tamilName}</div>
            </div>
        `;
    }).join('');

    loadImagesSequentially(sorted);
}

function startDiagnosis(cropId) {
    window.location.href = `report-disease.html?cropId=${cropId}`;
}

function renderRecentReports(reports) {
    const historyContainer = document.getElementById('recent-history-list');
    if (!historyContainer) return;

    if (!reports || reports.length === 0) {
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #FAFAFA; border-radius: var(--border-radius); border: 1px dashed #CFD8DC;">
                <p style="color: #757575; font-size: 0.9rem; margin-bottom: 15px;">You have not diagnosed any crops yet.</p>
                <p style="font-size: 0.85rem; font-weight: 500; color: var(--primary-green);">Select a crop below to run your first diagnosis!</p>
            </div>
        `;
        return;
    }

    const recentReports = reports.slice(0, 4);

    historyContainer.innerHTML = recentReports.map(report => {
        const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const severityLower = (report.severityLevel || 'LOW').toLowerCase();
        const severityBadgeClass = `badge-severity-${severityLower}`;

        const statusLower = report.status.toLowerCase().replace('_', '-');
        const statusBadgeClass = `badge-status-${statusLower}`;

        const fallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='10' fill='%23F1F8E9'/><text x='50%25' y='65%25' font-size='40' text-anchor='middle'>🍂</text></svg>";
        const imageSrc = report.imagePath ? (report.imagePath.startsWith('data:') ? report.imagePath : `http://localhost:8080/${report.imagePath}`) : fallbackSvg;

        return `
            <div class="history-item">
                <div class="history-main">
                    <img class="history-img" src="${imageSrc}" alt="Report Photo" onerror="handleImageError(this, 'leaf')">
                    <div class="history-details">
                        <h4>${report.cropName} - <span style="font-weight: 500;">${report.predictedDiseaseName}</span></h4>
                        <p>📅 Diagnosed on: ${dateStr}</p>
                    </div>
                </div>
                <div class="history-meta">
                    <span class="badge ${severityBadgeClass}">Severity: ${report.severityLevel || 'LOW'}</span>
                    <span class="badge ${statusBadgeClass}">${report.status.replace('_', ' ')}</span>
                    <a href="diagnosis-result.html?reportId=${report.id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">
                        View Advice 🔬
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function renderConsultations(consultations) {
    const consultationsContainer = document.getElementById('consultations-tickets-list');
    if (!consultationsContainer) return;

    if (!consultations || consultations.length === 0) {
        consultationsContainer.innerHTML = `
            <p style="color: #757575; font-size: 0.9rem; text-align: center; padding: 20px;">No expert advisory tickets opened.</p>
        `;
        return;
    }

    const recentConsultations = consultations.slice(0, 3);

    consultationsContainer.innerHTML = recentConsultations.map(ticket => {
        const ticketDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        const statusClass = ticket.status === 'PENDING' ? 'badge-status-pending' : 'badge-status-resolved';
        
        let responseMarkup = '';
        if (ticket.status === 'ANSWERED' && ticket.expertResponse) {
            const replyDate = new Date(ticket.repliedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
            responseMarkup = `
                <div class="ticket-response">
                    <div class="expert-tag">🩺 Expert Answer (Replied on ${replyDate}):</div>
                    <p style="margin: 0; color: #37474F;">${ticket.expertResponse}</p>
                </div>
            `;
        } else {
            responseMarkup = `
                <div style="font-size: 0.82rem; color: #78909C; font-style: italic; margin-top: 10px; display: flex; align-items: center; gap: 6px;">
                    ⏳ Awaiting expert analysis...
                </div>
            `;
        }

        return `
            <div class="ticket-card">
                <div class="ticket-header">
                    <h4>Report ID: #${ticket.report.id} - ${ticket.report.crop.name}</h4>
                    <div>
                        <span class="badge ${statusClass}">${ticket.status}</span>
                        <span style="font-size: 0.75rem; color: #9E9E9E; margin-left: 8px;">${ticketDate}</span>
                    </div>
                </div>
                <div class="ticket-body">
                    <strong style="color: var(--bg-dark);">Question:</strong> "${ticket.question}"
                </div>
                ${responseMarkup}
            </div>
        `;
    }).join('');
}
