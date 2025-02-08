import { firebaseConfig } from '../modules/config.js';
import { PostManager } from '../modules/postManager.js';
import { UIManager } from '../modules/uiManager.js';

class SparkleApp {
    constructor() {
        // Initialize Firebase
        this.initFirebase();

        // Initialize Managers
        this.postManager = new PostManager(firebase.database());
        this.uiManager = new UIManager();

        this.init();
    }

    initFirebase() {
        try {
            // Ensure Firebase is not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.uiManager.showErrorMessage('Failed to connect to Firebase');
        }
    }

    init() {
        try {
            // Bind post submission
            this.uiManager.bindPostSubmission((content) => {
                this.postManager.createPost(content)
                    .then((post) => {
                        console.log('Magical post submitted! ✨', post);
                    })
                    .catch((error) => {
                        console.error('Magic failed:', error);
                        this.uiManager.showErrorMessage('Failed to post');
                    });
            });

            // Load existing posts
            const postsQuery = this.postManager.getPosts();
            postsQuery.on('child_added', (snapshot) => {
                const post = snapshot.val();
                this.uiManager.displayPost(post);
            });

            // Load dynamic navbar
            this.loadNavbar();
        } catch (error) {
            console.error('App initialization error:', error);
            this.uiManager.showErrorMessage('Failed to load app');
        }
    }

    loadNavbar() {
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        const navbarTemplate = document.getElementById('navbar-template');
        if (navbarPlaceholder && navbarTemplate) {
            navbarPlaceholder.innerHTML = navbarTemplate.innerHTML;
        }
    }
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new SparkleApp();
});
