import { GiphyManager } from './giphyManager.js';

export class PostEditor {
    constructor() {
        this.giphyManager = new GiphyManager();
        this.selectedGif = null;
        this.initializeElements();
        this.initializeEmojiPicker();
        this.bindEvents();
    }

    initializeElements() {
        this.postContent = document.getElementById('post-content');
        this.postPreview = document.getElementById('post-preview');
        this.previewButton = document.getElementById('preview-button');
        this.gifButton = document.getElementById('gif-button');
        this.emojiButton = document.getElementById('emoji-button');
        this.selectedGifContainer = document.getElementById('selected-gif');
        this.emojiPicker = document.getElementById('emoji-picker');
        this.emojiSearch = document.querySelector('.emoji-search');
        this.emojiGrid = document.querySelector('.emoji-grid');
        this.emojiCategories = document.querySelector('.emoji-categories');
        this.formatButtons = document.querySelectorAll('[data-format]');
        
        // Initialize Bootstrap modal
        this.gifModal = new bootstrap.Modal(document.getElementById('gifModal'));
        this.gifSearch = document.getElementById('gif-search');
        this.searchGifBtn = document.getElementById('search-gif-btn');
        this.gifGrid = document.getElementById('gif-grid');
    }

    bindEvents() {
        // Format buttons
        this.formatButtons.forEach(button => {
            button.addEventListener('click', () => this.formatText(button.dataset.format));
        });

        // Preview button
        this.previewButton.addEventListener('click', () => this.togglePreview());

        // GIF functionality
        this.gifButton.addEventListener('click', () => this.openGifModal());
        this.searchGifBtn.addEventListener('click', () => this.searchGifs());
        this.gifSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchGifs();
        });

        // Emoji button
        this.emojiButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEmojiPicker();
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.emojiPicker.contains(e.target) && 
                !this.emojiButton.contains(e.target) && 
                !this.emojiPicker.classList.contains('d-none')) {
                this.emojiPicker.classList.add('d-none');
            }
        });

        // Close button for emoji picker
        const closeButton = this.emojiPicker.querySelector('.emoji-picker-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.emojiPicker.classList.add('d-none');
            });
        }

        // Category buttons
        this.emojiCategories.addEventListener('click', (e) => {
            const categoryBtn = e.target.closest('.emoji-category');
            if (categoryBtn) {
                this.emojiCategories.querySelectorAll('.emoji-category').forEach(btn => {
                    btn.classList.remove('active');
                });
                categoryBtn.classList.add('active');
                this.showEmojiCategory(categoryBtn.dataset.category);
            }
        });

        // Search functionality
        this.emojiSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm) {
                this.searchEmojis(searchTerm);
            } else {
                this.showEmojiCategory('recent');
            }
        });

        // Prevent clicks inside emoji picker from bubbling up
        this.emojiPicker.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    formatText(format) {
        const textarea = this.postContent;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        let formattedText = '';

        switch(format) {
            case 'bold':
                formattedText = `**${text.substring(start, end)}**`;
                break;
            case 'italic':
                formattedText = `_${text.substring(start, end)}_`;
                break;
            case 'strike':
                formattedText = `~~${text.substring(start, end)}~~`;
                break;
            case 'code':
                formattedText = `\`${text.substring(start, end)}\``;
                break;
        }

        textarea.value = text.substring(0, start) + formattedText + text.substring(end);
        this.updatePreview();
    }

    async searchGifs() {
        const query = this.gifSearch.value.trim();
        if (!query) return;

        try {
            const gifs = await this.giphyManager.searchGifs(query);
            this.displayGifs(gifs);
        } catch (error) {
            console.error('Error searching GIFs:', error);
        }
    }

    displayGifs(gifs) {
        this.gifGrid.innerHTML = gifs.map(gif => `
            <div class="gif-item" data-gif-url="${gif.images.fixed_height.url}">
                <img src="${gif.images.fixed_height.url}" alt="${gif.title}">
            </div>
        `).join('');

        // Add click handlers to GIF items
        this.gifGrid.querySelectorAll('.gif-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectGif(item.dataset.gifUrl);
                this.gifModal.hide();
            });
        });
    }

    selectGif(url) {
        this.selectedGif = url;
        this.selectedGifContainer.innerHTML = `
            <div class="position-relative">
                <img src="${url}" alt="Selected GIF" style="max-width: 100%;">
                <button class="remove-media" type="button">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        this.selectedGifContainer.classList.remove('d-none');

        // Add event listener to remove button
        const removeButton = this.selectedGifContainer.querySelector('.remove-media');
        removeButton.addEventListener('click', () => this.removeGif());
    }

    removeGif() {
        this.selectedGif = null;
        this.selectedGifContainer.innerHTML = '';
        this.selectedGifContainer.classList.add('d-none');
    }

    initializeEmojiPicker() {
        // Initialize emoji data
        this.recentEmojis = new Set(JSON.parse(localStorage.getItem('recentEmojis') || '[]'));
        this.emojiData = {
            recent: Array.from(this.recentEmojis),
            smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '🤪'],
            nature: ['🌸', '🌺', '🌼', '🌻', '🌹', '🌷', '🌱', '🌲', '🍀', '🌈', '☀️', '⭐', '🌙', '✨', '⚡', '🦄'],
            food: ['🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🧁', '🍰', '🍫', '🍭', '🍬', '🍡', '🍮', '🍯', '🍎', '🍓'],
            activities: ['🎨', '🎭', '🎪', '🎠', '🎡', '🎢', '🎮', '🎲', '🎯', '🎳', '🎤', '🎧', '🎸', '🎺', '⚽', '🎉'],
            objects: ['💝', '🎁', '🎀', '👑', '💫', '🔮', '🎭', '🎪', '🎨', '🖼️', '📱', '💻', '⌚', '💡', '🔑', '🗝️'],
            symbols: ['💖', '💗', '💓', '💞', '💕', '💟', '💌', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍']
        };

        // Initialize dragging
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            if (e.type === "mousedown") {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                isDragging = true;
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                this.emojiPicker.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
            }
        };

        const dragEnd = () => {
            isDragging = false;
        };

        // Add event listeners for dragging
        const dragHandle = this.emojiPicker.querySelector('.emoji-picker-header');
        dragHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Show initial category
        this.showEmojiCategory('recent');
    }

    toggleEmojiPicker() {
        this.emojiPicker.classList.toggle('d-none');
        if (!this.emojiPicker.classList.contains('d-none')) {
            // Reset position to center when opening
            this.emojiPicker.style.transform = 'translate(-50%, -50%)';
            this.showEmojiCategory('recent');
            this.emojiSearch.focus();
        }
    }

    showEmojiCategory(category) {
        const emojis = this.emojiData[category];
        this.emojiGrid.innerHTML = emojis.map(emoji => `
            <div class="emoji-item" data-emoji="${emoji}">${emoji}</div>
        `).join('');

        this.emojiGrid.querySelectorAll('.emoji-item').forEach(item => {
            item.addEventListener('click', () => {
                const emoji = item.dataset.emoji;
                this.insertEmoji(emoji);
                this.addToRecentEmojis(emoji);
            });
        });
    }

    searchEmojis(searchTerm) {
        const allEmojis = new Set();
        Object.values(this.emojiData).forEach(category => {
            category.forEach(emoji => allEmojis.add(emoji));
        });

        const filteredEmojis = Array.from(allEmojis).filter(emoji => 
            emoji.includes(searchTerm)
        );

        this.emojiGrid.innerHTML = filteredEmojis.map(emoji => `
            <div class="emoji-item" data-emoji="${emoji}">${emoji}</div>
        `).join('');

        this.emojiGrid.querySelectorAll('.emoji-item').forEach(item => {
            item.addEventListener('click', () => {
                const emoji = item.dataset.emoji;
                this.insertEmoji(emoji);
                this.addToRecentEmojis(emoji);
            });
        });
    }

    addToRecentEmojis(emoji) {
        this.recentEmojis.delete(emoji);
        this.recentEmojis.add(emoji);
        this.emojiData.recent = Array.from(this.recentEmojis).slice(-16);
        localStorage.setItem('recentEmojis', JSON.stringify(this.emojiData.recent));
    }

    insertEmoji(emoji) {
        const textarea = this.postContent;
        const start = textarea.selectionStart;
        const text = textarea.value;
        textarea.value = text.substring(0, start) + emoji + text.substring(start);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        this.emojiPicker.classList.add('d-none');
        this.updatePreview();
    }

    togglePreview() {
        const showPreview = this.postPreview.classList.toggle('d-none');
        if (showPreview) {
            this.updatePreview();
        }
        this.previewButton.textContent = showPreview ? 'Hide Preview ✨' : 'Preview ✨';
    }

    updatePreview() {
        let content = this.postContent.value;
        // Convert markdown-style formatting to HTML
        content = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        this.postPreview.innerHTML = content;
    }

    getPostContent() {
        return {
            text: this.postContent.value,
            gif: this.selectedGif
        };
    }

    clear() {
        this.postContent.value = '';
        this.removeGif();
        this.postPreview.classList.add('d-none');
        this.previewButton.textContent = 'Preview ✨';
    }

    openGifModal() {
        this.gifModal.show();
        // Load trending GIFs by default
        this.giphyManager.getTrendingGifs()
            .then(gifs => this.displayGifs(gifs))
            .catch(error => console.error('Error loading trending GIFs:', error));
    }
}
