// Editor functionality
class PostEditor {
    constructor() {
        this.postContent = document.getElementById('post-content');
        this.postPreview = document.getElementById('post-preview');
        this.selectedGif = document.getElementById('selected-gif');
        this.emojiPicker = document.getElementById('emoji-picker');
        this.gifModal = new bootstrap.Modal(document.getElementById('gifModal'));
        
        this.setupEmojiPicker();
        this.setupGifPicker();
        this.setupFormatButtons();
        this.setupPreviewButton();
    }

    setupEmojiPicker() {
        const emojiButton = document.getElementById('emoji-button');
        const emojiGrid = document.querySelector('.emoji-grid');
        const emojiSearch = document.querySelector('.emoji-search');
        const emojiClose = document.querySelector('.emoji-picker-close');

        // Emoji categories
        const emojis = {
            smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
            nature: ['🌸', '🌹', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
            activities: ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏'],
            objects: ['⌚️', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗']
        };

        if (emojiButton) {
            emojiButton.addEventListener('click', () => {
                this.emojiPicker.classList.toggle('d-none');
                this.populateEmojiGrid('smileys');
            });
        }

        if (emojiClose) {
            emojiClose.addEventListener('click', () => {
                this.emojiPicker.classList.add('d-none');
            });
        }

        // Populate emoji grid
        this.populateEmojiGrid = (category) => {
            if (emojiGrid) {
                emojiGrid.innerHTML = '';
                emojis[category].forEach(emoji => {
                    const emojiSpan = document.createElement('span');
                    emojiSpan.textContent = emoji;
                    emojiSpan.classList.add('emoji-item');
                    emojiSpan.addEventListener('click', () => {
                        this.insertAtCursor(emoji);
                        this.emojiPicker.classList.add('d-none');
                    });
                    emojiGrid.appendChild(emojiSpan);
                });
            }
        };

        // Setup emoji category buttons
        document.querySelectorAll('.emoji-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                if (category !== 'recent') {
                    document.querySelectorAll('.emoji-category').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                    this.populateEmojiGrid(category);
                }
            });
        });

        // Setup emoji search
        if (emojiSearch) {
            emojiSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const allEmojis = Object.values(emojis).flat();
                const filteredEmojis = allEmojis.filter(emoji => 
                    emoji.toLowerCase().includes(searchTerm)
                );

                if (emojiGrid) {
                    emojiGrid.innerHTML = '';
                    filteredEmojis.forEach(emoji => {
                        const emojiSpan = document.createElement('span');
                        emojiSpan.textContent = emoji;
                        emojiSpan.classList.add('emoji-item');
                        emojiSpan.addEventListener('click', () => {
                            this.insertAtCursor(emoji);
                            this.emojiPicker.classList.add('d-none');
                        });
                        emojiGrid.appendChild(emojiSpan);
                    });
                }
            });
        }
    }

    setupGifPicker() {
        const gifButton = document.getElementById('gif-button');
        const gifGrid = document.getElementById('gif-grid');
        const gifSearch = document.getElementById('gif-search');
        const searchGifBtn = document.getElementById('search-gif-btn');

        if (gifButton) {
            gifButton.addEventListener('click', () => {
                this.gifModal.show();
                this.searchGifs('trending'); // Load trending GIFs by default
            });
        }

        if (searchGifBtn && gifSearch) {
            searchGifBtn.addEventListener('click', () => {
                const query = gifSearch.value.trim();
                if (query) {
                    this.searchGifs(query);
                }
            });

            gifSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = gifSearch.value.trim();
                    if (query) {
                        this.searchGifs(query);
                    }
                }
            });
        }
    }

    async searchGifs(query) {
        const gifGrid = document.getElementById('gif-grid');
        const GIPHY_API_KEY = 'SinZxtlSpUm6LdrNEKJg0RqjrXLnKuOp'; // Replace with your Giphy API key
        const endpoint = query === 'trending' 
            ? `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
            : `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20`;

        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (gifGrid) {
                gifGrid.innerHTML = '';
                data.data.forEach(gif => {
                    const gifItem = document.createElement('div');
                    gifItem.classList.add('gif-item');
                    gifItem.innerHTML = `<img src="${gif.images.fixed_height.url}" alt="GIF">`;
                    gifItem.addEventListener('click', () => {
                        this.selectGif(gif.images.fixed_height.url);
                        this.gifModal.hide();
                    });
                    gifGrid.appendChild(gifItem);
                });
            }
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        }
    }

    selectGif(gifUrl) {
        if (this.selectedGif) {
            this.selectedGif.innerHTML = `
                <div class="position-relative">
                    <img src="${gifUrl}" alt="Selected GIF" class="img-fluid rounded">
                    <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `;
            this.selectedGif.classList.remove('d-none');
        }
    }

    setupFormatButtons() {
        document.querySelectorAll('[data-format]').forEach(button => {
            button.addEventListener('click', () => {
                const format = button.dataset.format;
                this.formatText(format);
            });
        });
    }

    setupPreviewButton() {
        const previewButton = document.getElementById('preview-button');
        if (previewButton) {
            previewButton.addEventListener('click', () => {
                this.togglePreview();
            });
        }
    }

    togglePreview() {
        if (!this.postContent || !this.postPreview) return;

        const content = this.postContent.value;
        const isPreviewVisible = !this.postPreview.classList.contains('d-none');

        if (isPreviewVisible) {
            this.postPreview.classList.add('d-none');
            this.postContent.classList.remove('d-none');
        } else {
            this.postPreview.innerHTML = this.formatContent(content);
            this.postPreview.classList.remove('d-none');
            this.postContent.classList.add('d-none');
        }
    }

    formatText(format) {
        if (!this.postContent) return;

        const start = this.postContent.selectionStart;
        const end = this.postContent.selectionEnd;
        const text = this.postContent.value;
        let formattedText = '';

        switch (format) {
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

        this.postContent.value = text.substring(0, start) + formattedText + text.substring(end);
        this.postContent.focus();
    }

    insertAtCursor(text) {
        if (!this.postContent) return;

        const start = this.postContent.selectionStart;
        const end = this.postContent.selectionEnd;
        const currentValue = this.postContent.value;

        this.postContent.value = currentValue.substring(0, start) + text + currentValue.substring(end);
        this.postContent.focus();
        this.postContent.selectionStart = this.postContent.selectionEnd = start + text.length;
    }

    formatContent(content) {
        if (!content) return '';
        
        // Format bold text
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Format strikethrough
        content = content.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // Format code
        content = content.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    getPostContent() {
        const gifUrl = this.selectedGif && !this.selectedGif.classList.contains('d-none')
            ? this.selectedGif.querySelector('img')?.src
            : null;

        return {
            text: this.postContent ? this.postContent.value : '',
            gif: gifUrl
        };
    }

    clear() {
        if (this.postContent) {
            this.postContent.value = '';
        }
        if (this.selectedGif) {
            this.selectedGif.innerHTML = '';
            this.selectedGif.classList.add('d-none');
        }
        if (this.postPreview) {
            this.postPreview.innerHTML = '';
            this.postPreview.classList.add('d-none');
        }
    }
}

// Initialize editor when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.postEditor = new PostEditor();
});
