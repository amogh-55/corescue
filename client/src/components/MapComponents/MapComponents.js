import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


import './MapComponents.css'; // Import your CSS file for styling

const MapComponent = () => {
  const [userData, setUserData] = useState([]);
  const [mail, setMail] = useState([]);
  const [map, setMap] = useState(null); // State to store the map instance

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user-data');
        const data = await response.json();
        const updatedUserData = data.map((user) => ({
          name:user.CenterName,
          latitude: user.latitude,
          longitude: user.longitude,
        }));
        const updatedmailData = data.map((user) => ({
          name:user.CenterName,
          email:user.email,
        }));
        setUserData(updatedUserData);
        setMail(updatedmailData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!map) {
      // If the map is not initialized, create a new instance
      const newMap = L.map('map').setView([0, 0], 2); // Default to the center of the world
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(newMap);

      setMap(newMap);
    }

    const showPresentLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Update map view to the present location
            if (map) {
              map.setView([latitude, longitude], 15);
            }

            // Display a marker at the present location
            const customIcon = L.divIcon({ className: 'dynamic-marker' });
            L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

            // Display all existing static markers
            displayStaticMarkers();

            // Add event listener to the button to show nearest markers on click
            document.getElementById('showMarkersButton').addEventListener('click', () => {
              // Clear existing markers
              clearMarkers();

              // Find nearest markers
              findNearestMarkers(latitude, longitude, 5);
            });
          },
          (error) => {
            console.error('Error getting the present location:', error.message);
          }
        );
      } else {
        console.error('Geolocation is not supported by your browser');
      }
    };
/*const displayStaticMarkers = () => {
  const staticMarkers = userData.map((user) => ({
    latitude: parseFloat(user.latitude),
    longitude: parseFloat(user.longitude),
  }));

  staticMarkers.forEach((marker) => {
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: blue" class="marker"></div>`,
    });

    // Check if map is not null before adding the marker
    map?.addLayer(
      L.marker([marker.latitude, marker.longitude], { icon: customIcon })
        .bindPopup(
          `<br/>Latitude: ${marker.latitude}<br/>Longitude: ${marker.longitude}`
        )
        .openPopup()
    );
  });
};
 */console.log("email:",mail);
    const displayStaticMarkers = () => {
      const staticMarkers = userData.map((user) => ({
      name:user.name,
       
        latitude: parseFloat(user.latitude),
        longitude: parseFloat(user.longitude),
      }));
      console.log(staticMarkers);
      staticMarkers.forEach((marker) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: blue" class="marker"></div>`,
        });

       if(map)
       {
         L.marker([marker.latitude, marker.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<strong>${marker.name}</strong><br/>Latitude: ${marker.latitude}<br/>Longitude: ${marker.longitude}`
          )
          .openPopup();
       }
      });
    };

    const findNearestMarkers = (currentLatitude, currentLongitude, limit) => {
      const staticMarkers = userData.map((user) => ({
        name:user.name,
        latitude: parseFloat(user.latitude),
        longitude: parseFloat(user.longitude),
      }));

      // Sort the static markers by distance from the current location
      staticMarkers.sort((a, b) => {
        const distanceA = Math.sqrt(
          Math.pow(a.latitude - currentLatitude, 2) + Math.pow(a.longitude - currentLongitude, 2)
        );
        const distanceB = Math.sqrt(
          Math.pow(b.latitude - currentLatitude, 2) + Math.pow(b.longitude - currentLongitude, 2)
        );

        return distanceA - distanceB;
      });

      // Display the nearest markers on the map with different colors
      staticMarkers.slice(0, limit).forEach((marker, index) => {
        const markerColor = index < 5 ? 'blue' : 'red';

        const customIcon = L.divIcon({
          className: `dynamic-marker ${markerColor}`,
          html: `<div class="marker"></div>`,
        });

        L.marker([marker.latitude, marker.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<strong>${marker.name}</strong><br/>Latitude: ${marker.latitude}<br/>Longitude: ${marker.longitude}`
          )
          .openPopup();
      });
    };

    const clearMarkers = () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
    };

    // Call the function to show the present location and set up the button event listener
    showPresentLocation();

    // Clean up on component unmount
   
  }, [map, userData]); // Include map and userData as dependencies for this useEffect

  return (
    <div>
      <button id="showMarkersButton">SOS</button>
      <div id="map"></div>
    </div>
  );
};

export default MapComponent;
