// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "live-location-tracker-4a1de.firebaseapp.com",
  databaseURL: "https://live-location-tracker-4a1de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "live-location-tracker-4a1de"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Map variables
let map, directionsService, directionsRenderer;
let sharerMarker, trackerMarker;
let trackerPosition = null;
let sharerPosition = null;

// Custom marker icons
const sharerIcon = {
  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  scaledSize: new google.maps.Size(40, 40)
};
const trackerIcon = {
  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  scaledSize: new google.maps.Size(40, 40)
};

// Initialize map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: { lat: 12.9716, lng: 77.5946 }, // Default: Bangalore
    mapTypeControl: false,
    streetViewControl: false
  });

  // Initialize Directions Service and Renderer
  directionsService = new google.maps.DirectionsService();
  
  // DirectionsRenderer draws the BLUE route path automatically
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,  // We'll add custom markers
    polylineOptions: {
      strokeColor: '#4285F4',  // Google Maps blue
      strokeOpacity: 0.8,
      strokeWeight: 6
    }
  });

  // Create markers
  sharerMarker = new google.maps.Marker({
    map: map,
    icon: sharerIcon,
    title: 'Professor (Sharer)'
  });

  trackerMarker = new google.maps.Marker({
    map: map,
    icon: trackerIcon,
    title: 'You (Tracker)'
  });

  // Get tracker's own position
  watchTrackerPosition();
}

let lastTrackerPosition = null;

function watchTrackerPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Optional: rotate map in direction of movement
        if (lastTrackerPosition) {
          const heading = google.maps.geometry.spherical.computeHeading(
            new google.maps.LatLng(lastTrackerPosition.lat, lastTrackerPosition.lng),
            new google.maps.LatLng(newPos.lat, newPos.lng)
          );
          map.setHeading(heading);
          map.setTilt(45);
        }

        lastTrackerPosition = newPos;
        trackerPosition = newPos;

        const latLng = new google.maps.LatLng(newPos.lat, newPos.lng);
        trackerMarker.setPosition(latLng);   // blue marker moves
        map.panTo(latLng);                   // keep view centered on tracker

        if (sharerPosition) {
          calculateRoute();                  // update route, distance, ETA
        }
      },
      (error) => console.error('Tracker GPS error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
    );
  }
}


// Watch tracker's (your) position
function watchTrackerPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        trackerPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        trackerMarker.setPosition(trackerPosition);
        
        // Recalculate route if sharer position exists
        if (sharerPosition) {
          calculateRoute();
        }
      },
      (error) => console.error('Tracker GPS error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
    );
  }
}

// Start tracking sharer
function startTracking() {
  const sessionId = document.getElementById('sessionId').value.trim();
  if (!sessionId) {
    alert('Please enter a Session ID');
    return;
  }

  // Listen to Firebase for real-time updates
  database.ref('liveLocations/' + sessionId).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      sharerPosition = { lat: data.lat, lng: data.lng };
      
      // Animate marker to new position (smooth movement)
      animateMarker(sharerMarker, sharerPosition);
      
      // Update speed display
      if (data.speed) {
        const speedKmh = (data.speed * 3.6).toFixed(1);
        document.getElementById('speed').textContent = speedKmh + ' km/h';
      }
      
      // Update last update time
      const updateTime = new Date(data.timestamp).toLocaleTimeString();
      document.getElementById('lastUpdate').textContent = updateTime;
      
      // Calculate and display route
      if (trackerPosition) {
        calculateRoute();
      }
      
      // Center map to show both markers
      fitMapToBounds();
    }
  });
}

// Animate marker movement (like Uber)
function animateMarker(marker, newPosition) {
  const startPos = marker.getPosition();
  if (!startPos) {
    marker.setPosition(newPosition);
    return;
  }
  
  const frames = 30;
  let frame = 0;
  
  const interval = setInterval(() => {
    frame++;
    const lat = startPos.lat() + (newPosition.lat - startPos.lat()) * (frame / frames);
    const lng = startPos.lng() + (newPosition.lng - startPos.lng()) * (frame / frames);
    marker.setPosition({ lat, lng });
    
    if (frame >= frames) clearInterval(interval);
  }, 33); // ~30fps
}

// Calculate route and update distance/ETA
function calculateRoute() {
  if (!trackerPosition || !sharerPosition) return;

  const request = {
    origin: trackerPosition,
    destination: sharerPosition,
    travelMode: google.maps.TravelMode.DRIVING,
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: 'bestguess'
    }
  };

  directionsService.route(request, (result, status) => {
    if (status === 'OK') {
      // Draw blue route path on map
      directionsRenderer.setDirections(result);
      
      // Extract distance and duration
      const leg = result.routes[0].legs[0];
      document.getElementById('distance').textContent = leg.distance.text;
      
      // Use traffic-aware duration if available
      const duration = leg.duration_in_traffic || leg.duration;
      document.getElementById('eta').textContent = duration.text;
    }
  });
}

// Fit map to show both markers
function fitMapToBounds() {
  if (!trackerPosition || !sharerPosition) return;
  
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(trackerPosition);
  bounds.extend(sharerPosition);
  map.fitBounds(bounds, { padding: 50 });
}

// Initialize on page load
initMap();
