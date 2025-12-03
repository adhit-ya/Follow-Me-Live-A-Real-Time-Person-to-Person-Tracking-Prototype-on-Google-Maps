import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC62lDcrnZUTaxRuFI6HLC5SWrVgMp87NE",
  authDomain: "live-location-tracker-4a1de.firebaseapp.com",
  databaseURL: "https://live-location-tracker-4a1de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "live-location-tracker-4a1de",
  storageBucket: "live-location-tracker-4a1de.firebasestorage.app",
  messagingSenderId: "706368227150",
  appId: "1:706368227150:web:75d29fc573a34f6e85401f",
  measurementId: "G-PKKMT39NRM"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Generate unique session ID
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
document.getElementById('shareLink').value = sessionId;

const statusDiv = document.getElementById('status');

// Start sharing location
function startSharing() {
  if (!navigator.geolocation) {
    statusDiv.textContent = "Geolocation not supported!";
    statusDiv.className = "error";
    return;
  }

  // Watch position continuously
  navigator.geolocation.watchPosition(
    (position) => {
      const locationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || 0,
        heading: position.coords.heading || null,
        timestamp: Date.now()
      };

      // Push to Firebase Realtime Database
      database.ref('liveLocations/' + sessionId).set(locationData)
        .then(() => {
          statusDiv.innerHTML = `✅ Sharing Active<br>
            Lat: ${locationData.lat.toFixed(6)}<br>
            Lng: ${locationData.lng.toFixed(6)}<br>
            Updated: ${new Date().toLocaleTimeString()}`;
          statusDiv.className = "sharing";
        })
        .catch((error) => {
          statusDiv.textContent = "Error: " + error.message;
          statusDiv.className = "error";
        });
    },
    (error) => {
      statusDiv.textContent = "GPS Error: " + error.message;
      statusDiv.className = "error";
    },
    {
      enableHighAccuracy: true,  // Use GPS, not just WiFi
      timeout: 5000,
      maximumAge: 3000           // Cache for 3 seconds max
    }
  );
}

function copyLink() {
  document.getElementById('shareLink').select();
  document.execCommand('copy');
  alert('Session ID copied! Share this with follower.');
}

// Auto-start on page load
startSharing();