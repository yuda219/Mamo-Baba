// Firebase Config & Initialization
const firebaseConfig = {
    apiKey: "AIzaSyC6s7EJsjvHkAY4AhoMSF12RMoiFg1QhLo",
    authDomain: "mamo2026-29b4a.firebaseapp.com",
    databaseURL: "https://mamo2026-29b4a-default-rtdb.firebaseio.com",
    projectId: "mamo2026-29b4a",
    storageBucket: "mamo2026-29b4a.firebasestorage.app"
};

// אתחול Firebase והגדרת הפניות
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const storage = firebase.storage();
