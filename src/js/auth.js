// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYBtc-r5kTvxAAVRW256cu619tHtcymsI",
    authDomain: "moe7data.firebaseapp.com",
    databaseURL: "https://moe7data-default-rtdb.firebaseio.com",
    projectId: "moe7data",
    storageBucket: "moe7data.appspot.com",
    messagingSenderId: "1097340104287",
    appId: "1:1097340104287:web:a67074ee3f65e640d735ea",
    measurementId: "G-WYMCVG50D4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Helper Functions
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
        setTimeout(() => errorDiv.classList.add('d-none'), 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove('d-none');
        setTimeout(() => successDiv.classList.add('d-none'), 3000);
    }
}

// Handle Sign Up
async function handleSignUp(e) {
    e.preventDefault();
    
    const username = document.getElementById('username')?.value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password')?.value;

    if (password !== confirmPassword) {
        showError('Passwords do not match! ❌');
        return;
    }

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with username
        await user.updateProfile({
            displayName: username
        });

        // Create default user profile
        const userRef = firebase.database().ref(`users/${user.uid}`);
        await userRef.set({
            displayName: username,
            email: email,
            photoURL: user.photoURL || 'https://placehold.co/150x150.png?text=✨',
            bio: 'Welcome to my Sparkle profile! ✨',
            joinDate: new Date().toISOString(),
            followers: 0,
            following: 0
        });

        showSuccess('Account created successfully! ✨');
        window.location.href = 'profile.html';
    } catch (error) {
        showError(error.message);
    }
}

// Handle Google Sign In
async function handleGoogleSignIn() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // Check if user profile exists
        const userRef = firebase.database().ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            // Create default profile for new Google users
            await userRef.set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL || 'https://placehold.co/150x150.png?text=✨',
                bio: 'Welcome to my Sparkle profile! ✨',
                joinDate: new Date().toISOString(),
                followers: 0,
                following: 0
            });
        }

        window.location.href = 'profile.html';
    } catch (error) {
        showError(error.message);
    }
}

// Handle Sign Out
async function handleSignOut() {
    try {
        await firebase.auth().signOut();
        window.location.href = 'signin.html';
    } catch (error) {
        showError(error.message);
    }
}

// Auth State Observer
firebase.auth().onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        // User is signed in
        if (currentPage === 'signin.html' || currentPage === 'signup.html') {
            window.location.href = 'profile.html';
        }
    } else {
        // No user is signed in
        if (currentPage === 'profile.html') {
            window.location.href = 'signin.html';
        }
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Sign Up Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }

    // Google Sign In Button
    const googleSignInBtn = document.getElementById('google-signup');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }

    // Error Message Container
    if (!document.getElementById('error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'alert alert-danger d-none';
        document.querySelector('.card-body').prepend(errorDiv);
    }

    // Success Message Container
    if (!document.getElementById('success-message')) {
        const successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.className = 'alert alert-success d-none';
        document.querySelector('.card-body').prepend(successDiv);
    }
});