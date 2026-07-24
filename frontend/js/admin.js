// Admin Dashboard Handler

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are ADMIN
    const user = api.getCurrentUser();
    if (!user || user.role !== 'ADMIN') return; // auth.js guards this

    loadAdminStats();
    loadUsersTable();
});

async function loadAdminStats() {
    try {
        const stats = await api.getAdminStats();
        renderStatsSummary(stats);
        renderRegionOutbreaks(stats.regionStats);
    } catch (err) {
        console.error('Failed to load system stats:', err);
    }
}

function renderStatsSummary(stats) {
    document.getElementById('admin-total-reports').textContent = stats.totalReports || 0;
    document.getElementById('admin-most-reported').textContent = stats.mostReportedDisease || 'N/A';
    document.getElementById('admin-total-users').textContent = stats.totalUsers || 0;
    document.getElementById('admin-total-farmers').textContent = stats.totalFarmers || 0;
    document.getElementById('admin-total-experts').textContent = stats.totalExperts || 0;
    document.getElementById('admin-total-resolved').textContent = stats.totalResolvedReports || 0;
}

function renderRegionOutbreaks(regionStats) {
    const container = document.getElementById('region-stats-container');
    if (!container) return;

    if (!regionStats || Object.keys(regionStats).length === 0) {
        container.innerHTML = '<p class="hint">No regional report data cataloged yet.</p>';
        return;
    }

    // Find max count to calculate relative percentages for bar charts
    const counts = Object.values(regionStats);
    const maxCount = Math.max(...counts, 1);

    const sortedRegions = Object.entries(regionStats).sort((a, b) => b[1] - a[1]);

    container.innerHTML = sortedRegions.map(([region, count]) => {
        const percentage = ((count / maxCount) * 100).toFixed(0);
        return `
            <div style="margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">
                    <span style="color: var(--bg-dark);">${region}</span>
                    <span style="color: var(--primary-green);">${count} Reports</span>
                </div>
                <!-- Premium custom bar gauge -->
                <div style="background-color: #ECEFF1; height: 10px; border-radius: 5px; overflow: hidden; width: 100%;">
                    <div style="background-color: var(--primary-green); height: 100%; width: ${percentage}%; border-radius: 5px; transition: width 0.8s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    try {
        const users = await api.getAdminUsers();
        renderUsers(users, tableBody);
    } catch (err) {
        console.error('Failed to load system users list:', err);
    }
}

function renderUsers(users, container) {
    if (!users || users.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #757575;">No users found in database.</td></tr>';
        return;
    }

    container.innerHTML = users.map(u => {
        const userDate = new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        // Current role value selected
        const farmerSelected = u.role === 'FARMER' ? 'selected' : '';
        const expertSelected = u.role === 'EXPERT' ? 'selected' : '';
        const adminSelected = u.role === 'ADMIN' ? 'selected' : '';

        // Prevent self-role-demotion to avoid locking admin out
        const currentAdminUsername = localStorage.getItem('username');
        const isSelf = u.username === currentAdminUsername;

        return `
            <tr>
                <td style="font-weight: 600; color: var(--bg-dark);">${u.id}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.fullName}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.region}</td>
                <td>
                    <select onchange="changeUserRole(${u.id}, this.value)" ${isSelf ? 'disabled' : ''}>
                        <option value="FARMER" ${farmerSelected}>Farmer 👨‍🌾</option>
                        <option value="EXPERT" ${expertSelected}>Expert 🩺</option>
                        <option value="ADMIN" ${adminSelected}>Admin 🛡️</option>
                    </select>
                    ${isSelf ? '<span style="font-size: 0.7rem; color: #757575; display: block; margin-top: 2px;">(Active Admin)</span>' : ''}
                </td>
            </tr>
        `;
    }).join('');
}

async function changeUserRole(userId, newRole) {
    try {
        const updated = await api.updateUserRole(userId, newRole);
        if (updated) {
            showAlert(`Successfully updated user ${updated.username} to ${updated.role}!`, 'success');
            
            // Reload stats and users table to sync numbers
            loadAdminStats();
            loadUsersTable();
        }
    } catch (err) {
        // api.js handles error banners
    }
}
