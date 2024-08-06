document.getElementById('location-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const location = document.getElementById('location').value;
    const results = document.getElementById('results');
    
    if (!location) {
        results.innerHTML = 'Please enter a location or use your current location.';
        return;
    }
    
    try {
        const latLng = await getLatLng(location);
        const goldenHourData = await fetchGoldenHourData(latLng.lat, latLng.lng);
        displayResults(goldenHourData);
    } catch (error) {
        results.innerHTML = 'Could not retrieve golden hour information. Please try again.';
    }
});

document.getElementById('use-location').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const { latitude, longitude } = position.coords;
            try {
                const goldenHourData = await fetchGoldenHourData(latitude, longitude);
                displayResults(goldenHourData);
            } catch (error) {
                results.innerHTML = 'Could not retrieve golden hour information. Please try again.';
            }
        }, function() {
            results.innerHTML = 'Unable to retrieve your location.';
        });
    } else {
        results.innerHTML = 'Geolocation is not supported by this browser.';
    }
});

async function getLatLng(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`);
    const data = await response.json();
    if (data.length === 0) {
        throw new Error('Location not found');
    }
    return {
        lat: data[0].lat,
        lng: data[0].lon
    };
}

async function fetchGoldenHourData(lat, lng) {
    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
    const data = await response.json();
    const sunrise = new Date(data.results.sunrise);
    const sunset = new Date(data.results.sunset);
    
    // Golden hour calculations
    const goldenHourSunsetStart = new Date(sunset.getTime() - 3600000);
    const goldenHourSunsetEnd = new Date(sunset.getTime());

    const goldenHourSunriseStart = new Date(sunrise.getTime());
    const goldenHourSunriseEnd = new Date(sunrise.getTime() + 3600000);

    // Blue hour calculations (60 minutes duration)
    const blueHourSunsetStart = new Date(sunset.getTime());
    const blueHourSunsetEnd = new Date(sunset.getTime() + 3600000); // 1 hour after sunset

    const blueHourSunriseStart = new Date(sunrise.getTime() - 3600000); // 1 hour before sunrise
    const blueHourSunriseEnd = new Date(sunrise.getTime());

    return {
        sunrise: sunrise.toLocaleTimeString(),
        sunset: sunset.toLocaleTimeString(),
        goldenHourSunsetStart: goldenHourSunsetStart.toLocaleTimeString(),
        goldenHourSunsetEnd: goldenHourSunsetEnd.toLocaleTimeString(),
        goldenHourSunriseStart: goldenHourSunriseStart.toLocaleTimeString(),
        goldenHourSunriseEnd: goldenHourSunriseEnd.toLocaleTimeString(),
        blueHourSunsetStart: blueHourSunsetStart.toLocaleTimeString(),
        blueHourSunsetEnd: blueHourSunsetEnd.toLocaleTimeString(),
        blueHourSunriseStart: blueHourSunriseStart.toLocaleTimeString(),
        blueHourSunriseEnd: blueHourSunriseEnd.toLocaleTimeString()
    };
}

function displayResults(data) {
    const results = document.getElementById('results');
    results.innerHTML = `
        <div class="result-item"><i class="fas fa-sun"></i> Sunrise: ${data.sunrise}</div>
        <div class="result-item"><i class="fas fa-moon"></i> Sunset: ${data.sunset}</div>
        <div class="result-item"><i class="fas fa-sun"></i> Golden Sunrise Hour Start: ${data.goldenHourSunriseStart}</div>
        <div class="result-item"><i class="fas fa-sun"></i> Golden Sunrise Hour End: ${data.goldenHourSunriseEnd}</div>
        <div class="result-item"><i class="fas fa-sun"></i> Golden Sunset Hour Start: ${data.goldenHourSunsetStart}</div>
        <div class="result-item"><i class="fas fa-sun"></i> Golden Sunset Hour End: ${data.goldenHourSunsetEnd}</div>
        <div class="result-item"><i class="fas fa-cloud-sun"></i> Blue Sunrise Hour Start: ${data.blueHourSunriseStart}</div>
        <div class="result-item"><i class="fas fa-cloud-sun"></i> Blue Sunrise Hour End: ${data.blueHourSunriseEnd}</div>
        <div class="result-item"><i class="fas fa-cloud-moon"></i> Blue Sunset Hour Start: ${data.blueHourSunsetStart}</div>
        <div class="result-item"><i class="fas fa-cloud-moon"></i> Blue Sunset Hour End: ${data.blueHourSunsetEnd}</div>
    `;
}
