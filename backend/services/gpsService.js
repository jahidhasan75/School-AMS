'use strict';

/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Verify if a user's GPS coordinates are within allowed radius of school
 * @param {object} userCoords - { latitude, longitude }
 * @param {object} schoolCoords - { latitude, longitude }
 * @param {number} allowedRadius - Maximum allowed distance in meters
 * @returns {object} { isValid, distance }
 */
function verifyGpsLocation(userCoords, schoolCoords, allowedRadius) {
  const distance = calculateDistance(
    parseFloat(userCoords.latitude),
    parseFloat(userCoords.longitude),
    parseFloat(schoolCoords.latitude),
    parseFloat(schoolCoords.longitude)
  );

  return {
    isValid: distance <= allowedRadius,
    distance: Math.round(distance)
  };
}

module.exports = { calculateDistance, verifyGpsLocation };
