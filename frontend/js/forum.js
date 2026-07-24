// Community Forum Thread Handler

document.addEventListener('DOMContentLoaded', async () => {
    // Enable protected navigation guards
    const user = api.getCurrentUser();
    if (!user) return;

    // Load forum threads feed
    loadForumFeed();

    // Set up form submission handler
    setupForumFormSubmit();
});

async function loadForumFeed() {
    const feedContainer = document.getElementById('forum-feed-container');
    if (!feedContainer) return;

    try {
        const posts = await api.getForumPosts();
        renderForumPosts(posts, feedContainer);
    } catch (err) {
        console.error('Failed to load forum posts:', err);
    }
}

function renderForumPosts(posts, container) {
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: var(--border-radius); box-shadow: var(--card-shadow);">
                <p style="color: #757575; font-size: 0.95rem; margin-bottom: 10px;">The discussion forum is empty.</p>
                <p style="font-size: 0.88rem; color: var(--primary-green); font-weight: 500;">Be the first to publish a topic using the form on the right!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => {
        const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Format role emoji/badge
        const role = post.user.role;
        const roleEmoji = role === 'ADMIN' ? '🛡️' : (role === 'EXPERT' ? '🩺' : '👨‍🌾');
        const roleBadgeClass = role === 'ADMIN' ? 'badge-status-diagnosed' : (role === 'EXPERT' ? 'badge-status-resolved' : 'badge-status-pending');

        return `
            <div class="panel" style="margin-bottom: 20px; transition: all 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #ECEFF1; padding-bottom: 10px; margin-bottom: 15px;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--bg-dark);">${post.title}</h3>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; font-size: 0.78rem; color: #757575;">
                            <span>By <strong>${post.user.fullName}</strong></span>
                            <span class="badge ${roleBadgeClass}" style="font-size: 0.65rem; padding: 2px 6px;">${roleEmoji} ${role}</span>
                            <span>|</span>
                            <span>Region: ${post.user.region}</span>
                        </div>
                    </div>
                    <span style="font-size: 0.72rem; color: #9E9E9E; font-weight: 500;">${dateStr}</span>
                </div>
                <p style="font-size: 0.92rem; color: #37474F; white-space: pre-line; line-height: 1.6;">${post.content}</p>
            </div>
        `;
    }).join('');
}

function setupForumFormSubmit() {
    const form = document.getElementById('new-thread-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('thread-title').value.trim();
        const content = document.getElementById('thread-content').value.trim();

        // Validate
        if (!title || !content) {
            showAlert('Forum Alert: Post title and content are required fields.', 'warning');
            return;
        }

        try {
            const response = await api.createForumPost(title, content);
            if (response) {
                showAlert('Topic posted to community successfully!', 'success');
                
                // Clear fields
                document.getElementById('thread-title').value = '';
                document.getElementById('thread-content').value = '';
                
                // Reload feed
                loadForumFeed();
            }
        } catch (err) {
            // api.js handles alerts
        }
    });
}
