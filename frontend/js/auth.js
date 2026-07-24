// Authentication and Session Guards

document.addEventListener('DOMContentLoaded', () => {
    const user = api.getCurrentUser();
    const path = window.location.pathname;

    // 1. Session check for protected pages
    const isPublicPage = path.endsWith('index.html') || path.endsWith('register.html') || path === '/' || path === '';
    
    if (!isPublicPage) {
        if (!user) {
            // Not logged in, redirect to login
            const prefix = path.includes('/pages/') ? '../' : '';
            window.location.href = `${prefix}index.html?session_expired=true`;
            return;
        }

        // 2. Role-based guards
        if (path.endsWith('expert-dashboard.html') && user.role !== 'EXPERT' && user.role !== 'ADMIN') {
            showAlert('Access Denied: Expert privilege required', 'danger');
            setTimeout(() => {
                window.location.href = 'farmer-dashboard.html';
            }, 1000);
            return;
        }

        if (path.endsWith('admin-dashboard.html') && user.role !== 'ADMIN') {
            showAlert('Access Denied: Admin privilege required', 'danger');
            setTimeout(() => {
                window.location.href = 'farmer-dashboard.html';
            }, 1000);
            return;
        }
    } else {
        // If user is already logged in and visits login/register, redirect them to their home dashboard
        if (user) {
            redirectUserToDashboard(user.role);
        }
    }

    // 3. Render common elements (Navbar user badge) if logged in
    if (user) {
        renderNavbarUser(user);
    }
});

function redirectUserToDashboard(role) {
    const path = window.location.pathname;
    const prefix = path.includes('/pages/') ? '' : 'pages/';
    
    if (role === 'ADMIN') {
        window.location.href = `${prefix}admin-dashboard.html`;
    } else if (role === 'EXPERT') {
        window.location.href = `${prefix}expert-dashboard.html`;
    } else {
        window.location.href = `${prefix}farmer-dashboard.html`;
    }
}

function renderNavbarUser(user) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Check if logout button exists
    let logoutBtn = document.querySelector('.btn-logout');
    if (!logoutBtn) {
        // Create user info indicator and logout button
        const userLi = document.createElement('li');
        userLi.className = 'user-navbar-profile';
        userLi.style.display = 'flex';
        userLi.style.alignItems = 'center';
        userLi.style.gap = '10px';
        userLi.style.marginLeft = '15px';
        userLi.style.borderLeft = '1px solid rgba(255,255,255,0.2)';
        userLi.style.paddingLeft = '15px';

        const roleEmoji = user.role === 'ADMIN' ? '🛡️' : (user.role === 'EXPERT' ? '🩺' : '👨‍🌾');
        
        userLi.innerHTML = `
            <div style="text-align: right;">
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--secondary-green);">${user.fullName}</div>
                <div style="font-size: 0.7rem; color: #B0BEC5;">${roleEmoji} ${user.role}</div>
            </div>
        `;

        const logoutLi = document.createElement('li');
        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn-logout';
        logoutButton.innerHTML = 'Logout';
        logoutButton.onclick = () => api.logout();
        logoutLi.appendChild(logoutButton);

        navLinks.appendChild(userLi);
        navLinks.appendChild(logoutLi);
    }
}
