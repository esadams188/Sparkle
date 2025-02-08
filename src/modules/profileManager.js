// profileManager.js
class ProfileManager {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.database();
        this.currentUser = null;
        this.setupAuthListener();
    }

    setupAuthListener() {
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.loadUserProfile(user.uid);
            } else {
                this.redirectToSignIn();
            }
        });
    }

    async loadUserProfile(userId) {
        try {
            const userRef = this.db.ref(`users/${userId}`);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                this.updateProfileUI(userData);
            } else {
                // Create default profile for new users
                const defaultProfile = {
                    displayName: this.currentUser.displayName || 'Sparkle User',
                    email: this.currentUser.email,
                    photoURL: this.currentUser.photoURL || '/src/assets/default-avatar.png',
                    bio: 'Welcome to my Sparkle profile! ✨',
                    joinDate: new Date().toISOString(),
                    followers: 0,
                    following: 0
                };
                await this.saveUserProfile(userId, defaultProfile);
                this.updateProfileUI(defaultProfile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile data');
        }
    }

    async saveUserProfile(userId, profileData) {
        try {
            const userRef = this.db.ref(`users/${userId}`);
            await userRef.update(profileData);
            this.showSuccess('Profile updated successfully! ✨');
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError('Failed to save profile changes');
        }
    }

    updateProfileUI(userData) {
        // Update profile elements
        const elements = {
            displayName: document.getElementById('profile-display-name'),
            email: document.getElementById('profile-email'),
            bio: document.getElementById('profile-bio'),
            avatar: document.getElementById('profile-avatar'),
            followers: document.getElementById('followers-count'),
            following: document.getElementById('following-count'),
            joinDate: document.getElementById('join-date')
        };

        // Update elements if they exist
        if (elements.displayName) elements.displayName.textContent = userData.displayName;
        if (elements.email) elements.email.textContent = userData.email;
        if (elements.bio) elements.bio.textContent = userData.bio;
        if (elements.avatar) elements.avatar.src = userData.photoURL;
        if (elements.followers) elements.followers.textContent = userData.followers || 0;
        if (elements.following) elements.following.textContent = userData.following || 0;
        if (elements.joinDate) {
            const date = new Date(userData.joinDate);
            elements.joinDate.textContent = `Joined ${date.toLocaleDateString()}`;
        }
    }

    redirectToSignIn() {
        window.location.href = 'signin.html';
    }

    showSuccess(message) {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.className = 'alert alert-success';
            statusEl.textContent = message;
            statusEl.classList.remove('d-none');
            setTimeout(() => statusEl.classList.add('d-none'), 3000);
        }
    }

    showError(message) {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.className = 'alert alert-danger';
            statusEl.textContent = message;
            statusEl.classList.remove('d-none');
            setTimeout(() => statusEl.classList.add('d-none'), 3000);
        }
    }
}

export const profileManager = new ProfileManager();
export default ProfileManager;
