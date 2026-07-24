// Central API Service with Hybrid Backend & LocalStorage Fallback for AgriDoc
const BASE_URL = 'http://localhost:8080';

// Helper to check if JWT token is expired client-side
function isTokenExpired(token) {
    if (!token) return true;
    if (token === 'offline_jwt_token_key') return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload.exp) return false;
        return Date.now() >= payload.exp * 1000;
    } catch (e) {
        return true;
    }
}

function clearSessionData() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userId');
}

// Global Fetch Interceptor to handle expired or invalid JWT tokens (401 Unauthorized)
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
    try {
        const res = await originalFetch(url, options);
        if (res.status === 401 && typeof url === 'string' && !url.includes('/api/auth/login')) {
            clearSessionData();
            
            // Redirect to login screen
            const prefix = window.location.pathname.includes('/pages/') ? '../' : '';
            window.location.href = `${prefix}index.html?session_expired=true`;
            throw new Error('Session expired');
        }
        return res;
    } catch (err) {
        // Propagate network errors normally for fallback logic
        throw err;
    }
};

// Global helper to show themed notifications (alert banner)
function showAlert(message, type = 'danger') {
    const existingBanner = document.getElementById('agridoc-alert-banner');
    if (existingBanner) {
        existingBanner.remove();
    }

    const banner = document.createElement('div');
    banner.id = 'agridoc-alert-banner';
    banner.className = `alert-banner ${type} show`;
    
    let emoji = '⚠️';
    if (type === 'success') emoji = '✅';
    if (type === 'danger') emoji = '❌';
    
    banner.innerHTML = `<span>${emoji}</span> <span>${message}</span>`;
    document.body.appendChild(banner);

    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 400);
    }, 4000);
}

// Global Loading Spinner toggle
function toggleSpinner(show) {
    let overlay = document.getElementById('agridoc-spinner-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'agridoc-spinner-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="leaf-loader"></div>
            <div class="loading-text" id="spinner-loading-text">AgriDoc is analyzing...</div>
        `;
        document.body.appendChild(overlay);
    }
    
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Global image fallback helper
function handleImageError(img, type = 'leaf') {
    img.onerror = null; // Prevent infinite loop
    if (type === 'crop') {
        img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='15' fill='%23E8F5E9'/><text x='50%25' y='65%25' font-size='45' text-anchor='middle'>🌱</text></svg>";
    } else {
        img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='10' fill='%23F1F8E9'/><text x='50%25' y='65%25' font-size='40' text-anchor='middle'>🍂</text></svg>";
    }
}
window.handleImageError = handleImageError;

// Show status warning if running in offline fallback mode
let offlineNoticeShown = false;
function notifyOfflineMode() {
    if (offlineNoticeShown) return;
    offlineNoticeShown = true;
    console.warn('AgriDoc running in local storage fallback mode (backend server offline)');
}


// Check session expired on page load
if (window.location.search.includes('session_expired=true')) {
    setTimeout(() => {
        showAlert('Your session has expired or is invalid. Please login again.', 'danger');
        window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);
}

function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        if (isTokenExpired(token)) {
            clearSessionData();
            const prefix = window.location.pathname.includes('/pages/') ? '../' : '';
            window.location.href = `${prefix}index.html?session_expired=true`;
            throw new Error('Session expired');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    const customApiKey = localStorage.getItem('agridoc_gemini_api_key');
    if (customApiKey) {
        headers['X-Gemini-Key'] = customApiKey;
    }
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
}

// Mock users list for local storage fallback
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@agridoc.com', phone: '+1234567890', region: 'Central Region', role: 'ADMIN', fullName: 'AgriDoc Administrator', createdAt: new Date().toISOString() },
    { id: 2, username: 'farmer', password: 'password123', email: 'farmer@agridoc.com', phone: '+919876543210', region: 'Southern Valley', role: 'FARMER', fullName: 'Hari Kumar', createdAt: new Date().toISOString() },
    { id: 3, username: 'expert', password: 'password123', email: 'expert@agridoc.com', phone: '+918765432109', region: 'Western Ghats', role: 'EXPERT', fullName: 'Dr. Ramesh Swaminathan', createdAt: new Date().toISOString() }
];

const defaultCrops = [
    { id: 1, name: 'Apple (ஆப்பிள்)', description: 'Apple fruit crop grown in hilly regions.', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop' },
    { id: 2, name: 'Banana (வாழை)', description: 'Banana fruit crop, widely cultivated in Tamil Nadu.', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop' },
    { id: 3, name: 'Chilli (மிளகாய்)', description: 'Chilli pepper crop, major spice crop.', imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop' },
    { id: 4, name: 'Coconut (தேங்காய்)', description: 'Coconut tree crop, called the tree of life.', imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop' },
    { id: 5, name: 'Coffee (காபி)', description: 'Coffee berry plant grown in Western Ghats.', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop' },
    { id: 6, name: 'Corn (சோளம்)', description: 'Maize / Corn crop used as food and fodder.', imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop' },
    { id: 7, name: 'Cotton (பருத்தி)', description: 'Cotton fiber plant, major cash crop.', imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&auto=format&fit=crop' },
    { id: 8, name: 'Ginger (இஞ்சி)', description: 'Ginger root spice crop.', imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop' },
    { id: 9, name: 'Grapes (திராட்சை)', description: 'Grapes vine fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop' },
    { id: 10, name: 'Groundnut (நிலக்கடலை)', description: 'Groundnut legume oilseed crop.', imageUrl: 'https://images.unsplash.com/photo-1567892320421-1c657571ea48?w=400&auto=format&fit=crop' },
    { id: 11, name: 'Mango (மாம்பழம்)', description: 'Mango tree, king of fruits in India.', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop' },
    { id: 12, name: 'Onion (வெங்காயம்)', description: 'Onion bulb vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=400&auto=format&fit=crop' },
    { id: 13, name: 'Papaya (பப்பாளி)', description: 'Papaya tropical fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&auto=format&fit=crop' },
    { id: 14, name: 'Potato (உருளைக்கிழங்கு)', description: 'Potato tuber vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop' },
    { id: 15, name: 'Rice (நெல் / அரிசி)', description: 'Rice / Paddy grain crop, staple food of Tamil Nadu.', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop' },
    { id: 16, name: 'Soybeans (சோயா பீன்ஸ்)', description: 'Soybean oilseed protein crop.', imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&auto=format&fit=crop' },
    { id: 17, name: 'Sugarcane (கரும்பு)', description: 'Sugarcane grass crop for sugar production.', imageUrl: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&auto=format&fit=crop' },
    { id: 18, name: 'Tomato (தக்காளி)', description: 'Tomato fruit vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop' },
    { id: 19, name: 'Turmeric (மஞ்சள்)', description: 'Turmeric rhizome spice and medicinal crop.', imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop' },
    { id: 20, name: 'Wheat (கோதுமை)', description: 'Wheat grain grass, staple food crop.', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop' },
    { id: 21, name: 'Brinjal (கத்தரிக்காய்)', description: 'Brinjal / Eggplant vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop' },
    { id: 22, name: 'Bitter Gourd (பாகற்காய்)', description: 'Bitter gourd medicinal vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1628773822503-930a84594247?w=400&auto=format&fit=crop' },
    { id: 23, name: 'Bottle Gourd (சுரைக்காய்)', description: 'Bottle gourd vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1598170845058-128a34a475cb?w=400&auto=format&fit=crop' },
    { id: 24, name: 'Cardamom (ஏலக்காய்)', description: 'Cardamom queen of spices, grown in hill stations.', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop' },
    { id: 25, name: 'Cassava (மரவள்ளி)', description: 'Cassava / Tapioca root crop widely grown in Tamil Nadu.', imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&auto=format&fit=crop' },
    { id: 26, name: 'Cauliflower (காலிஃப்ளவர்)', description: 'Cauliflower winter vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop' },
    { id: 27, name: 'Drumstick (முருங்கை)', description: 'Moringa / Drumstick tree, highly nutritious.', imageUrl: 'https://images.unsplash.com/photo-1598170845058-128a34a475cb?w=400&auto=format&fit=crop' },
    { id: 28, name: 'Garlic (பூண்டு)', description: 'Garlic bulb spice crop.', imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop' },
    { id: 29, name: 'Guava (கொய்யா)', description: 'Guava tropical fruit crop rich in Vitamin C.', imageUrl: 'https://images.unsplash.com/photo-1536511135898-1002047814b7?w=400&auto=format&fit=crop' },
    { id: 30, name: "Lady's Finger (வெண்டைக்காய்)", description: "Okra / Lady's finger vegetable crop.", imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&auto=format&fit=crop' },
    { id: 31, name: 'Lemon (எலுமிச்சை)', description: 'Lemon citrus fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1534531141161-e41d133a8b50?w=400&auto=format&fit=crop' },
    { id: 32, name: 'Pineapple (அன்னாசி)', description: 'Pineapple tropical fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop' },
    { id: 33, name: 'Pomegranate (மாதுளை)', description: 'Pomegranate fruit crop rich in antioxidants.', imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop' },
    { id: 34, name: 'Sesame (எள்)', description: 'Sesame oilseed crop, one of the oldest cultivated plants.', imageUrl: 'https://images.unsplash.com/photo-1509358211425-24d04cbcb6b5?w=400&auto=format&fit=crop' },
    { id: 35, name: 'Watermelon (தர்பூசணி)', description: 'Watermelon summer fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&auto=format&fit=crop' }
];

const api = {
    // Auth endpoints
    login: async (username, password) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
                throw new Error(err.message || 'Invalid username or password');
            }
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('userId', data.id);
            return data;
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                // Offline fallback
                const users = JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
                const user = users.find(u => u.username === username && u.password === password);
                if (!user) {
                    showAlert('Invalid username or password (Offline Mode)', 'danger');
                    throw new Error('Invalid credentials');
                }
                localStorage.setItem('token', 'offline_jwt_token_key');
                localStorage.setItem('role', user.role);
                localStorage.setItem('username', user.username);
                localStorage.setItem('fullName', user.fullName);
                localStorage.setItem('userId', user.id);
                return { token: 'offline_jwt_token_key', role: user.role, username: user.username, fullName: user.fullName, id: user.id };
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    register: async (fullName, username, email, password, phone, region, role) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, password, phone, region, role })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(err.message || 'Registration failed');
            }
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const users = JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
                if (users.find(u => u.username === username)) {
                    showAlert('Username already taken (Offline Mode)', 'danger');
                    throw new Error('Username taken');
                }
                const newUser = { id: Date.now(), fullName, username, email, password, phone, region, role, createdAt: new Date().toISOString() };
                users.push(newUser);
                localStorage.setItem('agridoc_users', JSON.stringify(users));
                showAlert('Registration successful (Offline Mode)!', 'success');
                return newUser;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
            if (token && isTokenExpired(token)) {
                clearSessionData();
            }
            return null;
        }
        return {
            id: localStorage.getItem('userId'),
            username: localStorage.getItem('username'),
            fullName: localStorage.getItem('fullName'),
            role: localStorage.getItem('role')
        };
    },

    logout: () => {
        clearSessionData();
        window.location.href = '/frontend/index.html';
    },

    // Crops
    getCrops: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/crops`);
            if (!res.ok) throw new Error('Failed to fetch crops');
            const crops = await res.json();
            return crops.map(c => ({ id: c.id, name: c.name, description: c.description || '', imageUrl: c.imageUrl }));
        } catch (err) {
            notifyOfflineMode();
            const localCrops = JSON.parse(localStorage.getItem('agridoc_crops') || JSON.stringify(defaultCrops));
            localStorage.setItem('agridoc_crops', JSON.stringify(localCrops));
            return localCrops;
        }
    },

    getCropById: async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/crops/${id}`);
            if (!res.ok) throw new Error('Crop not found');
            const crop = await res.json();
            return { id: crop.id, name: crop.name, description: '', imageUrl: crop.imageUrl };
        } catch (err) {
            notifyOfflineMode();
            const localCrops = JSON.parse(localStorage.getItem('agridoc_crops') || JSON.stringify(defaultCrops));
            const crop = localCrops.find(c => c.id == id);
            if (!crop) throw new Error('Crop not found offline');
            return crop;
        }
    },

    // Diagnosis Reports
    createReport: async (cropId, symptoms, imageFile) => {
        toggleSpinner(true);
        try {
            const formData = new FormData();
            formData.append('cropId', cropId);
            formData.append('symptoms', symptoms || '');
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const headers = getAuthHeaders(null);
            const res = await fetch(`${BASE_URL}/api/reports`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!res.ok) {
                let msg = 'Disease diagnosis failed';
                const err = await res.json().catch(() => ({}));
                if (err && err.message) msg = err.message;
                throw new Error(msg);
            }

            const report = await res.json();
            showAlert('Disease analysis completed successfully!', 'success');
            
            // Sync locally in offline feed cache
            const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            localReports.unshift(report);
            localStorage.setItem('agridoc_reports', JSON.stringify(localReports));
            
            return report;
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                showAlert('AI diagnosis is currently unavailable: Backend server is offline. Please start the Spring Boot application.', 'danger');
                throw new Error('Backend offline');
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        } finally {
            toggleSpinner(false);
        }
    },

    getFarmerReports: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports/farmer`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const reports = await res.json();
            localStorage.setItem('agridoc_reports', JSON.stringify(reports));
            return reports;
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
        }
    },

    getReports: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const reports = await res.json();
            localStorage.setItem('agridoc_reports', JSON.stringify(reports));
            return reports;
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
        }
    },

    getReportById: async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Report not found');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            const r = localReports.find(report => report.id == id);
            if (!r) throw new Error('Report not found locally');
            return r;
        }
    },

    updateReportStatus: async (reportId, status) => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports/${reportId}/status?status=${status}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to update status');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            const idx = localReports.findIndex(r => r.id == reportId);
            if (idx !== -1) {
                localReports[idx].status = status;
                localStorage.setItem('agridoc_reports', JSON.stringify(localReports));
                return localReports[idx];
            }
            throw err;
        }
    },

    // Expert Consultations
    getFarmerConsultations: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations/farmer`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch consultations');
            const cons = await res.json();
            localStorage.setItem('agridoc_consultations', JSON.stringify(cons));
            return cons;
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
        }
    },

    getExpertPendingConsultations: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations/expert/pending`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch pending consultations');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const cons = JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
            return cons.filter(c => c.status === 'PENDING');
        }
    },

    createConsultation: async (reportId, question) => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ reportId, question })
            });
            if (!res.ok) throw new Error('Failed to create ticket');
            showAlert('Expert consultation request submitted successfully!', 'success');
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const cons = JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
                const reports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
                const report = reports.find(r => r.id == reportId);
                const newCons = {
                    id: Date.now(),
                    reportId,
                    question,
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                    report: report || { id: reportId, crop: { name: 'Unknown Crop' } },
                    farmer: { fullName: localStorage.getItem('fullName') || 'Farmer', region: 'Local' }
                };
                cons.push(newCons);
                localStorage.setItem('agridoc_consultations', JSON.stringify(cons));
                showAlert('Expert ticket opened successfully (Offline Mode)!', 'success');
                return newCons;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    respondToConsultation: async (consultationId, responseText) => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations/${consultationId}/respond?response=${encodeURIComponent(responseText)}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to submit response');
            showAlert('Response submitted successfully!', 'success');
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const cons = JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
                const idx = cons.findIndex(c => c.id == consultationId);
                if (idx !== -1) {
                    cons[idx].status = 'ANSWERED';
                    cons[idx].expertResponse = responseText;
                    cons[idx].repliedAt = new Date().toISOString();
                    localStorage.setItem('agridoc_consultations', JSON.stringify(cons));
                    showAlert('Response submitted successfully (Offline Mode)!', 'success');
                    return cons[idx];
                }
            }
            showAlert(err.message, 'danger');
            throw err;
        }
    },

    // Community Forum
    getForumPosts: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/forum`);
            if (!res.ok) throw new Error('Failed to load forum');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const posts = JSON.parse(localStorage.getItem('agridoc_forum_posts') || '[]');
            if (posts.length === 0) {
                const defaults = [
                    { id: 1, userId: 3, title: 'Welcome to the AgriDoc Discussion Board', content: 'Hello farmers! This is a shared space to discuss crop diseases, weather anomalies, and pest outbreaks in your local regions. Feel free to start a new thread using the form on the right.', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), user: { fullName: 'Dr. Ramesh Swaminathan', role: 'EXPERT', region: 'Western Ghats' } }
                ];
                localStorage.setItem('agridoc_forum_posts', JSON.stringify(defaults));
                return defaults;
            }
            return posts;
        }
    },

    createForumPost: async (title, content) => {
        try {
            const res = await fetch(`${BASE_URL}/api/forum`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error('Failed to post discussion');
            showAlert('New discussion thread posted successfully!', 'success');
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const posts = JSON.parse(localStorage.getItem('agridoc_forum_posts') || '[]');
                const newPost = {
                    id: Date.now(),
                    title,
                    content,
                    createdAt: new Date().toISOString(),
                    user: {
                        fullName: localStorage.getItem('fullName') || 'Hari Kumar',
                        role: localStorage.getItem('role') || 'FARMER',
                        region: 'Local Region'
                    }
                };
                posts.unshift(newPost);
                localStorage.setItem('agridoc_forum_posts', JSON.stringify(posts));
                showAlert('Discussion posted successfully (Offline Mode)!', 'success');
                return newPost;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    // Admin Panel
    getAdminStats: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/stats`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to load admin stats');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const reports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            const users = JSON.parse(localStorage.getItem('agridoc_users') || '[]');
            return {
                totalReports: reports.length,
                totalResolvedReports: reports.filter(r => r.status === 'RESOLVED').length,
                totalUsers: users.length,
                totalFarmers: users.filter(u => u.role === 'FARMER').length,
                totalExperts: users.filter(u => u.role === 'EXPERT').length,
                mostReportedDisease: 'N/A',
                regionStats: {}
            };
        }
    },

    getAdminUsers: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to load users');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role?role=${role}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to update user role');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const users = JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
            const idx = users.findIndex(u => u.id == userId);
            if (idx !== -1) {
                users[idx].role = role;
                localStorage.setItem('agridoc_users', JSON.stringify(users));
                return users[idx];
            }
            throw err;
        }
    }
};

window.api = api;
