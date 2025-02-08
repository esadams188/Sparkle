import { PostEditor } from './postEditor.js';

export class UIManager {
    constructor() {
        this.postContainer = document.getElementById('posts-container');
        this.postEditor = new PostEditor();
    }

    displayPost(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('card', 'mb-3', 'post-animation');

        // Convert markdown to HTML
        const formattedContent = this._formatContent(post.content);

        // Create post HTML with user profile
        postElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                    <img src="${post.userPhotoURL || 'https://placehold.co/150x150.png?text=✨'}" 
                         alt="Profile Picture" 
                         class="rounded-circle me-2" 
                         style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                        <h6 class="card-subtitle mb-0">
                            <a href="profile.html?id=${post.userId}" class="text-decoration-none">
                                ${post.userDisplayName} ✨
                            </a>
                        </h6>
                        <small class="text-muted">
                            ${new Date(post.timestamp).toLocaleString()}
                        </small>
                    </div>
                </div>
                <p class="card-text">${formattedContent}</p>`;

        // Add GIF if present
        if (post.gif) {
            postElement.innerHTML += `
                <div class="post-media mb-2">
                    <img src="${post.gif}" alt="Post GIF" class="img-fluid rounded">
                </div>`;
        }

        // Add post actions
        postElement.innerHTML += `
                <div class="post-actions mt-3">
                    <button class="btn btn-sm btn-outline-primary me-2">
                        <i class="bi bi-heart"></i> Like
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-2">
                        <i class="bi bi-chat"></i> Comment
                    </button>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-share"></i> Share
                    </button>
                </div>
            </div>`;

        this.postContainer.prepend(postElement);
    }

    _formatContent(content) {
        if (!content) return '';
        
        // Convert markdown-style formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Convert URLs to links
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            // Preserve line breaks
            .replace(/\n/g, '<br>');
    }

    bindPostSubmission(submitHandler) {
        document.getElementById('post-button').addEventListener('click', async () => {
            const content = this.postEditor.getPostContent();
            if (content.text.trim() || content.gif) {
                try {
                    await submitHandler(content);
                    this.postEditor.clear();
                } catch (error) {
                    this.showErrorMessage(error.message || 'Failed to create post');
                }
            }
        });
    }

    showErrorMessage(message) {
        let errorContainer = document.getElementById('error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.classList.add('container', 'mt-3');
            document.body.insertBefore(errorContainer, document.body.firstChild);
        }

        const errorAlert = document.createElement('div');
        errorAlert.classList.add('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show');
        errorAlert.innerHTML = `
            <strong>Oops!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        errorContainer.appendChild(errorAlert);
        setTimeout(() => {
            errorAlert.classList.remove('show');
            setTimeout(() => errorAlert.remove(), 300);
        }, 5000);
    }
}
