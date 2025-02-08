import { APP_CONSTANTS } from './config.js';

export class PostManager {
    constructor(database, auth) {
        this.database = database;
        this.auth = auth;
        this.postsRef = database.ref('posts');
        this.usersRef = database.ref('users');
    }

    async createPost(content) {
        if (!content.text.trim() && !content.gif) {
            return Promise.reject('Empty post');
        }

        const user = this.auth.currentUser;
        if (!user) {
            return Promise.reject('User not authenticated');
        }

        try {
            // Get user profile data
            const userSnapshot = await this.usersRef.child(user.uid).once('value');
            const userData = userSnapshot.val() || {};
            
            const postData = {
                content: content.text,
                gif: content.gif || null,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                userId: user.uid,
                userDisplayName: userData.displayName || user.displayName || 'Sparkle User',
                userPhotoURL: userData.photoURL || user.photoURL || 'https://placehold.co/150x150.png?text=✨'
            };

            return this.postsRef.push(postData)
                .then(() => postData);
        } catch (error) {
            console.error('Post creation failed:', error);
            throw error;
        }
    }

    getPosts(limit = 50) {
        return this.postsRef.orderByChild('timestamp').limitToLast(limit);
    }

    _getRandomEmoji() {
        const emojis = APP_CONSTANTS.EMOJI_POOL;
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
}
