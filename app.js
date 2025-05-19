// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVcIsXbAlc4RhGqSivERl_pktjk3EJNi8",
  authDomain: "stalwartmarket-20678.firebaseapp.com",
  databaseURL: "https://stalwartmarket-20678-default-rtdb.firebaseio.com",
  projectId: "stalwartmarket-20678",
  storageBucket: "stalwartmarket-20678.firebasestorage.app",
  messagingSenderId: "481500647418",
  appId: "1:481500647418:web:867b753dc8f39b9be15e43",
  measurementId: "G-HKTKNMDV63"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically load navbar
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const navbarTemplate = document.getElementById('navbar-template');
    if (navbarPlaceholder && navbarTemplate) {
        navbarPlaceholder.innerHTML = navbarTemplate.innerHTML;
    }

    const postButton = document.getElementById('post-button');
    const postsContainer = document.getElementById('posts-container');
    const errorContainer = document.getElementById('error-container');

    // Post to Firebase
    if (postButton) {
        postButton.addEventListener('click', async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    window.location.href = 'signin.html';
                    return;
                }

                const content = document.getElementById('post-content').value.trim();
                const selectedGif = document.querySelector('.selected-media img');
                
                if (!content && !selectedGif) {
                    throw new Error('Please add some content or a GIF to your post!');
                }

                // Get user profile data
                const userRef = database.ref(`users/${user.uid}`);
                const userSnapshot = await userRef.once('value');
                const userData = userSnapshot.val() || {};
                
                // Add post with user data
                const newPostRef = database.ref('posts').push();
                await newPostRef.set({
                    content: content,
                    gif: selectedGif ? selectedGif.src : null,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    userId: user.uid,
                    userDisplayName: userData.displayName || user.displayName || 'Sparkle User',
                    userPhotoURL: userData.photoURL || user.photoURL || 'https://placehold.co/150x150.png?text=✨'
                });

                // Clear input and selected GIF
                document.getElementById('post-content').value = '';
                const selectedMediaDiv = document.querySelector('.selected-media');
                if (selectedMediaDiv) {
                    selectedMediaDiv.innerHTML = '';
                }
                
                console.log('Magical post submitted successfully! ✨');
                
                // Add a fun animation to the post button
                postButton.classList.add('btn-magic-animation');
                setTimeout(() => {
                    postButton.classList.remove('btn-magic-animation');
                }, 1000);
            } catch (error) {
                console.error('Magic failed:', error);
                if (errorContainer) {
                    errorContainer.textContent = error.message;
                    errorContainer.classList.remove('d-none');
                    setTimeout(() => {
                        errorContainer.classList.add('d-none');
                    }, 3000);
                }
            }
        });
    }

    // Fetch and display posts
    if (postsContainer) {
        const postsRef = database.ref('posts').orderByChild('timestamp');
        
        // Function to create post HTML
        const createPostHtml = (post, currentUserId) => {
            // Always use viewer.html for all profiles
            const profileUrl = post.userId === currentUserId ? 
                'viewer.html' : 
                `viewer.html?userId=${post.userId}`;
            
            // Create post HTML
            const postHtml = document.createElement('div');
            postHtml.className = 'card-body';
            postHtml.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <a href="${profileUrl}" data-user-id="${post.userId}" class="me-2 profile-link">
                        <img src="${post.userPhotoURL}" alt="Profile Picture" 
                             class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
                    </a>
                    <div>
                        <h6 class="card-subtitle mb-0">
                            <a href="${profileUrl}" data-user-id="${post.userId}" class="text-decoration-none profile-link">
                                ${post.userDisplayName} ✨
                            </a>
                        </h6>
                        <small class="text-muted">
                            ${new Date(post.timestamp).toLocaleString()}
                        </small>
                    </div>
                </div>
                <p class="card-text">${post.content}</p>
                ${post.gif ? `
                    <div class="post-media mb-3">
                        <img src="${post.gif}" alt="Post GIF" class="img-fluid rounded">
                    </div>
                ` : ''}
                <div class="post-actions">
                    <button class="btn btn-sm btn-outline-primary me-2">
                        <i class="bi bi-heart"></i> Like
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-2">
                        <i class="bi bi-chat"></i> Comment
                    </button>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-share"></i> Share
                    </button>
                </div>`;

            return postHtml;
        };

        // Listen for auth state changes to get current user
        auth.onAuthStateChanged(user => {
            if (user) {
                // Listen for new posts
                postsRef.on('child_added', (snapshot) => {
                    const post = snapshot.val();
                    const postElement = document.createElement('div');
                    postElement.classList.add('card', 'mb-3', 'post-card');
                    
                    // Create and append post content
                    const postContent = createPostHtml(post, user.uid);
                    postElement.appendChild(postContent);

                    // Add click handlers for profile links
                    const profileLinks = postContent.querySelectorAll('.profile-link');
                    profileLinks.forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            const userId = link.getAttribute('data-user-id');
                            if (userId === user.uid) {
                                window.location.href = 'viewer.html';
                            } else {
                                window.location.href = `viewer.html?userId=${userId}`;
                            }
                        });
                    });

                    postsContainer.prepend(postElement);
                });
            }
        });
    }

    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (!user && window.location.pathname !== '/signin.html') {
            window.location.href = 'signin.html';
        }
    });
});
