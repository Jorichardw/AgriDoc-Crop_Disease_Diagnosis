// Crop Disease Diagnostic Form Handler
let selectedFile = null;
let cameraStream = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Resolve cropId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cropId = urlParams.get('cropId');

    if (!cropId) {
        showAlert('Invalid Request: Crop ID is required.', 'danger');
        setTimeout(() => {
            window.location.href = 'farmer-dashboard.html';
        }, 1200);
        return;
    }

    try {
        // Fetch Crop details (no static diseases needed)
        const crop = await api.getCropById(cropId);

        // Render Crop headers
        renderCropInfo(crop);

        // Configure upload box drag and drop
        setupImageUpload();

        // Configure live camera capture triggers
        setupCameraCapture();

        // Configure Form Submission
        setupFormSubmit(cropId);

        // Setup input tabs
        setupInputTabs();

    } catch (err) {
        console.error('Failed to load crop diagnostic workspace:', err);
    }
});

function renderCropInfo(crop) {
    const cropNameEl = document.getElementById('diagnose-crop-name');
    const cropDescEl = document.getElementById('diagnose-crop-desc');
    const cropTitleEl = document.getElementById('diagnose-page-title');

    const nameParts = crop.name.split(' (');
    const englishName = nameParts[0].trim();
    const key = englishName.toLowerCase();
    
    const TAMIL_MAP = {
        'apple': 'ஆப்பிள்', 'banana': 'வாழை', 'chilli': 'மிளகாய்', 'coconut': 'தேங்காய்',
        'coffee': 'காபி', 'corn': 'சோளம்', 'cotton': 'பருத்தி', 'ginger': 'இஞ்சி',
        'grapes': 'திராட்சை', 'groundnut': 'நிலக்கடலை', 'mango': 'மாம்பழம்', 'onion': 'வெங்காயம்',
        'papaya': 'பப்பாளி', 'potato': 'உருளைக்கிழங்கு', 'rice': 'நெல் / அரிசி', 'soybeans': 'சோயா பீன்ஸ்',
        'sugarcane': 'கரும்பு', 'tomato': 'தக்காளி', 'turmeric': 'மஞ்சள்', 'wheat': 'கோதுமை',
        'brinjal': 'கத்தரிக்காய்', 'bitter gourd': 'பாகற்காய்', 'bottle gourd': 'சுரைக்காய்',
        'cardamom': 'ஏலக்காய்', 'cassava': 'மரவள்ளி', 'cauliflower': 'காலிஃப்ளவர்',
        'drumstick': 'முருங்கை', 'garlic': 'பூண்டு', 'guava': 'கொய்யா', "lady's finger": 'வெண்டைக்காய்',
        'lemon': 'எலுமிச்சை', 'pineapple': 'அன்னாசி', 'pomegranate': 'மாதுளை', 'sesame': 'எள்',
        'watermelon': 'தர்பூசணி'
    };

    let tamilName = TAMIL_MAP[key];
    if (!tamilName && nameParts[1]) {
        const extracted = nameParts[1].replace(')', '').trim();
        if (!extracted.includes('?')) {
            tamilName = extracted;
        }
    }
    const tamilBadge = tamilName ? `<span style="font-size: 1.1rem; color: var(--primary-green); font-weight: 500;">(${tamilName})</span>` : '';
    const tamilSubBadge = tamilName ? `<span style="font-weight: 500; font-size: 0.9rem; color: var(--primary-green);">(${tamilName})</span>` : '';

    if (cropTitleEl) cropTitleEl.innerHTML = `🧬 Diagnose: <strong>${englishName}</strong> ${tamilBadge}`;
    if (cropNameEl) cropNameEl.innerHTML = `${englishName} ${tamilSubBadge}`;
    if (cropDescEl) cropDescEl.textContent = crop.description || 'Staple crop disease inspector.';
}


// Tab switcher logic
function setupInputTabs() {
    const tabUploadBtn = document.getElementById('tab-upload-btn');
    const tabCameraBtn = document.getElementById('tab-camera-btn');
    const uploadTabContent = document.getElementById('upload-tab-content');
    const cameraTabContent = document.getElementById('camera-tab-content');

    if (!tabUploadBtn || !tabCameraBtn) return;

    tabUploadBtn.addEventListener('click', () => {
        tabUploadBtn.style.backgroundColor = 'var(--primary-green)';
        tabUploadBtn.style.color = 'white';
        tabCameraBtn.style.backgroundColor = '#ECEFF1';
        tabCameraBtn.style.color = 'var(--text-dark)';
        
        uploadTabContent.style.display = 'block';
        cameraTabContent.style.display = 'none';
        
        // Stop camera stream if active
        stopCamera();
    });

    tabCameraBtn.addEventListener('click', () => {
        tabCameraBtn.style.backgroundColor = 'var(--primary-green)';
        tabCameraBtn.style.color = 'white';
        tabUploadBtn.style.backgroundColor = '#ECEFF1';
        tabUploadBtn.style.color = 'var(--text-dark)';
        
        cameraTabContent.style.display = 'block';
        uploadTabContent.style.display = 'none';
        
        // Auto start camera
        startCamera();
    });
}

// Live Camera getUserMedia configuration
function setupCameraCapture() {
    const startBtn = document.getElementById('camera-start-btn');
    const captureBtn = document.getElementById('camera-capture-btn');
    const stopBtn = document.getElementById('camera-stop-btn');

    if (startBtn) startBtn.addEventListener('click', startCamera);
    if (captureBtn) captureBtn.addEventListener('click', capturePhoto);
    if (stopBtn) stopBtn.addEventListener('click', stopCamera);
}

async function startCamera() {
    const video = document.getElementById('camera-video');
    const captureBtn = document.getElementById('camera-capture-btn');
    const stopBtn = document.getElementById('camera-stop-btn');
    const startBtn = document.getElementById('camera-start-btn');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showAlert('Camera error: getUserMedia is not supported by your browser.', 'danger');
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });
        
        if (video) {
            video.srcObject = cameraStream;
        }

        if (captureBtn) captureBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
        if (startBtn) startBtn.disabled = true;

    } catch (err) {
        console.error('Camera access denied or failed:', err);
        showAlert('Failed to access camera: ' + err.message, 'danger');
    }
}

function stopCamera() {
    const video = document.getElementById('camera-video');
    const captureBtn = document.getElementById('camera-capture-btn');
    const stopBtn = document.getElementById('camera-stop-btn');
    const startBtn = document.getElementById('camera-start-btn');

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    if (video) {
        video.srcObject = null;
    }

    if (captureBtn) captureBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    if (startBtn) startBtn.disabled = false;
}

function capturePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to Blob
    canvas.toBlob((blob) => {
        if (!blob) {
            showAlert('Failed to capture photo.', 'danger');
            return;
        }

        const file = new File([blob], `captured_disease_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        validateAndSetFile(file);
        
        // Stop stream and alert user
        stopCamera();
        showAlert('Photo captured successfully!', 'success');
    }, 'image/jpeg', 0.92);
}

function setupImageUpload() {
    const dragArea = document.getElementById('upload-drop-region');
    const fileInput = document.getElementById('file-input');

    if (!dragArea || !fileInput) return;

    // Trigger click on file input when clicking drag area
    dragArea.addEventListener('click', () => fileInput.click());

    // Highlight drag area on drag activities
    ['dragenter', 'dragover'].forEach(eventName => {
        dragArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dragArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dragArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dragArea.classList.remove('drag-over');
        }, false);
    });

    // Handle dropped files
    dragArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            validateAndSetFile(files[0]);
        }
    });

    // Handle selected files via browse
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files && fileInput.files.length > 0) {
            validateAndSetFile(fileInput.files[0]);
        }
    });
}

function validateAndSetFile(file) {
    const previewContainer = document.getElementById('upload-preview-container');
    if (!previewContainer) return;

    // 1. Format check
    if (!file.type.startsWith('image/')) {
        showAlert('File upload failed: Only image files (.jpg, .jpeg, .png) are permitted.', 'danger');
        return;
    }

    // 2. Size check (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showAlert('File upload failed: Image size must not exceed 10MB.', 'danger');
        return;
    }

    selectedFile = file;

    // Display Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        previewContainer.innerHTML = `
            <div class="file-preview">
                <img src="${e.target.result}" alt="Preview Thumbnail">
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-size">${sizeMb} MB</div>
                </div>
                <button type="button" class="btn-remove-file" onclick="removeSelectedFile()">✕</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removeSelectedFile() {
    selectedFile = null;
    const previewContainer = document.getElementById('upload-preview-container');
    const fileInput = document.getElementById('file-input');
    
    if (previewContainer) previewContainer.innerHTML = '';
    if (fileInput) fileInput.value = ''; // Reset file input binding
}
window.removeSelectedFile = removeSelectedFile;

function setupFormSubmit(cropId) {
    const form = document.getElementById('disease-report-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Use image-based diagnosis (no symptoms text required)
        const symptomsText = '';

        try {
            toggleSpinner(true);
            // Upload to backend API
            const response = await api.createReport(cropId, symptomsText, selectedFile);
            if (response && response.id) {
                // Stop camera stream if active
                stopCamera();
                // Immediately navigate to full pathology result page
                window.location.href = `diagnosis-result.html?reportId=${response.id}`;
            }
        } catch (error) {
            toggleSpinner(false);
            // api.js handles alert overlay automatically
        }
    });
}
