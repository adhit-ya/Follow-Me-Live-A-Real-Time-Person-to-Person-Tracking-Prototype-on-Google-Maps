const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "live-location-tracker-4a1de.firebaseapp.com",
databaseURL: "https://live-location-tracker-4a1de-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "live-location-tracker-4a1de",
storageBucket: "live-location-tracker-4a1de.firebasestorage.app",
messagingSenderId: "706368227150",
appId: "1:706368227150:d29fc573a34f6e85401f",
measurementId: "G-PKKMT39NRM"
};

// Initialize Firebase (global firebase comes from firebase-app-compat.js)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const shareInput = document.getElementById('shareLink');
const statusDiv = document.getElementById('status');

// Generate unique session ID and show it in the input
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
shareInput.value = sessionId;

// Start sharing location
function startSharing() {
if (!navigator.geolocation) {
statusDiv.textContent = "Geolocation not supported!";
statusDiv.className = "error";
return;
}

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

  // Write to Realtime Database
  database.ref('liveLocations/' + sessionId).set(locationData)
    .then(() => {
      statusDiv.innerHTML =
        " Sharing Active<br>" +
        "Lat: " + locationData.lat.toFixed(6) + "<br>" +
        "Lng: " + locationData.lng.toFixed(6) + "<br>" +
        "Updated: " + new Date().toLocaleTimeString();
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
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 3000
}
);
}

function copyLink() {
shareInput.select();
document.execCommand('copy');
alert("Session ID copied! Share this with follower.");
}

// Auto-start on page load
startSharing();