// universe.js faylining yangi versiyasi

// Avval DOM yuklanishini kutamiz
document.addEventListener('DOMContentLoaded', function() {
    // Loading ekranini boshlash
    fakeLoadingAnimation();
});

function fakeLoadingAnimation() {
    let progress = 0;
    const planetsEl = document.getElementById('loadedObjects');
    const starsEl = document.getElementById('loadedStars');
    const texturesEl = document.getElementById('loadedTextures');
    const progressBar = document.querySelector('.loading-progress');
    
    // Har 50 ms da progressni oshiramiz
    const interval = setInterval(() => {
        progress += 2;
        if (progressBar) progressBar.style.width = progress + '%';
        
        // Raqamlarni yangilash
        if (planetsEl) planetsEl.textContent = Math.min(8, Math.floor(progress / 100 * 8));
        if (starsEl) starsEl.textContent = Math.min(250, Math.floor(progress / 100 * 250));
        if (texturesEl) texturesEl.textContent = Math.min(12, Math.floor(progress / 100 * 12));
        
        if (progress >= 100) {
            clearInterval(interval);
            // Loading ekranini yashirish
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Endi asl koinotni yaratishni boshlaymiz
                    realInitUniverse();
                }, 500);
            } else {
                // Agar loadingScreen topilmasa, bemalol realInitUniverse ni chaqiramiz
                realInitUniverse();
            }
        }
    }, 50);
}

// Asl koinotni yaratish funksiyasi
function realInitUniverse() {
    // Sizning asl initUniverse funksiyangizning kodi shu yerga keladi
    // Ya'ni, Three.js sahni, kamera, renderer, yulduzlar, sayyoralarni yaratish
    
    // ... (sizning mavjud kodingiz)
    
    // Lekin, eslatma: sizning mavjud kodingizda initUniverse deb nomlangan funksiya bor.
    // Uni shu realInitUniverse ichiga ko'chirishingiz kerak.
}
// ========== MAIN UNIVERSE SIMULATION ==========

// Global variables
let scene, camera, renderer, controls;
let solarSystem, starsField, planets = {}, orbits = {};
let selectedPlanet = 'earth';
let timeScale = 1;
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;
let isLoading = true;
let currentViewMode = 'solar';
let otherExplorers = [];

// Initialize the universe
function initUniverse() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000011, 0.0001);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);
    camera.position.set(0, 50, 200);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('universeCanvas'),
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10000;
    controls.maxPolarAngle = Math.PI;
    
    // Add lighting
    addLighting();
    
    // Create the universe
    createStars();
    createSolarSystem();
    createGalaxyBackground();
    createDistantGalaxies();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation
    animate();
    
    // Hide loading screen after 3 seconds
    setTimeout(() => {
        hideLoadingScreen();
    }, 3000);
}

// Add realistic lighting
function addLighting() {
    // Sun light (main directional light)
    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    sunLight.position.set(100, 50, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 10000;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    scene.add(sunLight);
    
    // Ambient light for fill
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    scene.add(ambientLight);
    
    // Hemisphere light for sky/ground
    const hemisphereLight = new THREE.HemisphereLight(0x4488FF, 0x002244, 0.2);
    scene.add(hemisphereLight);
    
    // Add point lights for other stars (simulated)
    for (let i = 0; i < 100; i++) {
        const light = new THREE.PointLight(0xFFFFFF, Math.random() * 0.1);
        light.position.set(
            (Math.random() - 0.5) * 10000,
            (Math.random() - 0.5) * 10000,
            (Math.random() - 0.5) * 10000
        );
        scene.add(light);
    }
}

// Create realistic star field
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = STAR_DATA.count;
    
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Spherical distribution
        const radius = 5000 + Math.random() * 45000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Star color based on temperature
        const colorType = Math.floor(Math.random() * STAR_DATA.colorRange.length);
        const colorData = STAR_DATA.colorRange[colorType];
        const color = new THREE.Color(colorData.color);
        const intensity = colorData.intensity * (0.8 + Math.random() * 0.4);
        
        colors[i * 3] = color.r * intensity;
        colors[i * 3 + 1] = color.g * intensity;
        colors[i * 3 + 2] = color.b * intensity;
        
        // Star size
        sizes[i] = (Math.random() * 2 + 0.5) * STAR_DATA.size;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        sizeAttenuation: true,
        opacity: 0.9
    });
    
    starsField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starsField);
    
    updateLoadingStats('stars', starCount);
}

// Create the solar system with real scale
function createSolarSystem() {
    solarSystem = new THREE.Group();
    
    // Create Sun
    const sunData = PLANETS_DATA.sun;
    const sunGeometry = new THREE.SphereGeometry(
        sunData.radius * SOLAR_SYSTEM_CONFIG.scale, 
        64, 64
    );
    
    // Create realistic sun texture
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 1024;
    sunCanvas.height = 1024;
    const ctx = sunCanvas.getContext('2d');
    
    // Sun texture with realistic details
    const sunGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    sunGradient.addColorStop(0, '#FFFF00');
    sunGradient.addColorStop(0.3, '#FFAA00');
    sunGradient.addColorStop(0.6, '#FF6600');
    sunGradient.addColorStop(1, '#FF3300');
    ctx.fillStyle = sunGradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add sunspots
    ctx.fillStyle = '#CC6600';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const sunTexture = new THREE.CanvasTexture(sunCanvas);
    const sunMaterial = new THREE.MeshStandardMaterial({
        map: sunTexture,
        emissive: 0xFF6600,
        emissiveIntensity: 1,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { type: 'sun', data: sunData };
    planets.sun = sun;
    solarSystem.add(sun);
    
    // Create planets
    const planetOrder = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    
    planetOrder.forEach((planetName, index) => {
        const planetData = PLANETS_DATA[planetName];
        const distance = planetData.distanceValue * SOLAR_SYSTEM_CONFIG.distanceScale;
        
        // Create planet
        const planetGeometry = new THREE.SphereGeometry(
            planetData.radius * SOLAR_SYSTEM_CONFIG.scale * 5, // Slightly larger for visibility
            64, 64
        );
        
        // Create planet texture
        const planetCanvas = document.createElement('canvas');
        planetCanvas.width = 1024;
        planetCanvas.height = 1024;
        const pCtx = planetCanvas.getContext('2d');
        
        // Base color
        const color = new THREE.Color(planetData.color);
        pCtx.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
        pCtx.fillRect(0, 0, 1024, 1024);
        
        // Add details based on planet type
        if (planetName === 'earth') {
            // Earth-like texture
            addEarthDetails(pCtx);
        } else if (planetName === 'mars') {
            // Mars-like texture
            addMarsDetails(pCtx);
        } else if (planetName === 'jupiter') {
            // Jupiter bands
            addJupiterDetails(pCtx);
        }
        
        const planetTexture = new THREE.CanvasTexture(planetCanvas);
        const planetMaterial = new THREE.MeshStandardMaterial({
            map: planetTexture,
            roughness: planetName === 'earth' ? 0.7 : 0.9,
            metalness: 0.1
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.x = distance;
        planet.userData = {
            type: 'planet',
            name: planetName,
            data: planetData,
            orbitRadius: distance,
            orbitSpeed: SOLAR_SYSTEM_CONFIG.orbitSpeeds[planetName] || 0.01,
            angle: Math.random() * Math.PI * 2
        };
        
        planets[planetName] = planet;
        solarSystem.add(planet);
        
        // Create orbit ring
        const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.1
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        orbits[planetName] = orbit;
        solarSystem.add(orbit);
        
        // Add moons for Earth
        if (planetName === 'earth') {
            const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.userData = { orbitRadius: 5, orbitSpeed: 0.05, angle: Math.random() * Math.PI * 2 };
            planet.userData.moon = moon;
            planet.add(moon);
        }
        
        // Add rings for Saturn
        if (planetName === 'saturn') {
            const ringGeometry = new THREE.RingGeometry(8, 15, 64);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFDD88,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }
        
        updateLoadingStats('planets', index + 1);
    });
    
    scene.add(solarSystem);
}

// Add Earth details to texture
function addEarthDetails(ctx) {
    // Continents (simplified)
    const continents = [
        {x: 300, y: 300, w: 200, h: 150, color: '#228822'}, // Africa
        {x: 600, y: 250, w: 150, h: 100, color: '#22AA22'}, // Europe
        {x: 800, y: 350, w: 180, h: 120, color: '#44CC44'}, // Asia
        {x: 200, y: 500, w: 250, h: 200, color: '#33BB33'}  // Americas
    ];
    
    continents.forEach(continent => {
        ctx.fillStyle = continent.color;
        ctx.fillRect(continent.x, continent.y, continent.w, continent.h);
        
        // Add some texture
        ctx.fillStyle = '#116611';
        for (let i = 0; i < 20; i++) {
            const x = continent.x + Math.random() * continent.w;
            const y = continent.y + Math.random() * continent.h;
            ctx.fillRect(x, y, 3, 3);
        }
    });
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Add Mars details
function addMarsDetails(ctx) {
    // Mars surface details
    ctx.fillStyle = '#884422';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const w = Math.random() * 50 + 10;
        const h = Math.random() * 30 + 5;
        ctx.fillRect(x, y, w, h);
    }
    
    // Craters
    ctx.fillStyle = '#663311';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const radius = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Crater shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x - radius/3, y - radius/3, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#663311';
    }
}

// Add Jupiter details
function addJupiterDetails(ctx) {
    // Jupiter bands
    const bands = [
        {y: 100, h: 60, color: '#FFAA66'},
        {y: 200, h: 80, color: '#FF9966'},
        {y: 350, h: 70, color: '#FF8866'},
        {y: 480, h: 90, color: '#FF7766'},
        {y: 620, h: 65, color: '#FF6666'}
    ];
    
    bands.forEach(band => {
        ctx.fillStyle = band.color;
        ctx.fillRect(0, band.y, 1024, band.h);
        
        // Add texture to bands
        ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 1024;
            const y = band.y + Math.random() * band.h;
            ctx.fillRect(x, y, 20, 3);
        }
    });
    
    // Great Red Spot
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.ellipse(800, 512, 100, 50, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Create galaxy background
function createGalaxyBackground() {
    // Milky Way galaxy disk
    const galaxyGeometry = new THREE.RingGeometry(5000, 15000, 64, 1);
    const galaxyMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488FF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    });
    const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    galaxy.rotation.x = Math.PI / 2;
    scene.add(galaxy);
    
    updateLoadingStats('textures', 8);
}

// Create distant galaxies
function createDistantGalaxies() {
    for (let i = 0; i < 20; i++) {
        const size = Math.random() * 500 + 100;
        const galaxyGeometry = new THREE.SphereGeometry(size, 8, 8);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488FF,
            transparent: true,
            opacity: 0.03,
            side: THREE.BackSide
        });
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        
        // Position in spherical distribution
        const radius = 20000 + Math.random() * 30000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        galaxy.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        scene.add(galaxy);
    }
}

// Update loading screen
function updateLoadingStats(type, value) {
    const elements = {
        'planets': 'loadedObjects',
        'stars': 'loadedStars',
        'textures': 'loadedTextures'
    };
    
    if (elements[type]) {
        document.getElementById(elements[type]).textContent = value.toLocaleString();
    }
    
    // Update progress bar
    const totalProgress = (frameCount / 100) * 100;
    document.querySelector('.loading-progress').style.width = Math.min(totalProgress, 100) + '%';
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        isLoading = false;
        
        // Show welcome notification
        showNotification('Welcome to the Universe Explorer!', 'info');
        showNotification('Use WASD to move, mouse to look around', 'info');
        
        // Initialize user data
        initUserData();
    }, 500);
}

// Initialize user data from login
function initUserData() {
    const userData = JSON.parse(localStorage.getItem('spaceExplorer')) || {
        username: 'Explorer_' + Math.floor(Math.random() * 10000),
        loginTime: new Date().toISOString()
    };
    
    document.getElementById('usernameDisplay').textContent = userData.username;
    
    // Add user to explorers list
    otherExplorers.push({
        id: 0,
        name: userData.username,
        location: 'Near Earth',
        distance: 0
    });
    
    // Add simulated explorers
    EXPLORERS_DATA.forEach(explorer => {
        otherExplorers.push(explorer);
    });
    
    updateExplorersList();
}

// Update explorers list in UI
function updateExplorersList() {
    const container = document.getElementById('explorersList');
    container.innerHTML = '';
    
    otherExplorers.forEach(explorer => {
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.innerHTML = `
            <div class="explorer-avatar">${explorer.name.charAt(0)}</div>
            <div class="explorer-info">
                <div class="explorer-name">${explorer.name}</div>
                <div class="explorer-location">${explorer.location}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'} notification-icon"></i>
            <div class="notification-text">${message}</div>
        </div>
        <div class="notification-time">${new Date().toLocaleTimeString()}</div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Update planet info in UI
function updatePlanetInfo(planetName) {
    const data = PLANETS_DATA[planetName];
    
    document.getElementById('planetName').textContent = data.name;
    document.getElementById('planetType').textContent = data.type;
    document.getElementById('infoDiameter').textContent = data.diameter;
    document.getElementById('infoMass').textContent = data.mass;
    document.getElementById('infoTemp').textContent = data.temperature;
    document.getElementById('infoGravity').textContent = data.gravity;
    document.getElementById('infoDistance').textContent = data.distance;
    document.getElementById('infoOrbit').textContent = data.orbit;
    document.getElementById('planetDescription').textContent = data.description;
    
    // Update planet sphere color
    const sphere = document.getElementById('planetSphere');
    sphere.style.background = `radial-gradient(circle at 30% 30%, #${data.color.toString(16)}, #${data.emissive.toString(16)})`;
    
    // Update active state in planet list
    document.querySelectorAll('.planet-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.planet === planetName) {
            item.classList.add('active');
        }
    });
}

// Teleport to selected planet
function teleportToPlanet() {
    const planet = planets[selectedPlanet];
    if (planet) {
        const distance = planet.userData.orbitRadius * 3;
        const targetPosition = planet.position.clone().multiplyScalar(1.5);
        targetPosition.y += distance * 0.3;
        
        // Animate camera to planet
        gsap.to(camera.position, {
            duration: 2,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut",
            onUpdate: () => {
                controls.update();
            }
        });
        
        showNotification(`Teleporting to ${PLANETS_DATA[selectedPlanet].name}...`, 'info');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Planet selection
    document.querySelectorAll('.planet-item').forEach(item => {
        item.addEventListener('click', () => {
            selectedPlanet = item.dataset.planet;
            updatePlanetInfo(selectedPlanet);
            showNotification(`Selected: ${PLANETS_DATA[selectedPlanet].name}`, 'info');
        });
    });
    
    // View mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentViewMode = btn.dataset.mode;
            changeViewMode(currentViewMode);
        });
    });
    
    // Time scale slider
    const timeSlider = document.getElementById('timeSlider');
    timeSlider.addEventListener('input', (e) => {
        timeScale = parseFloat(e.target.value) / 10;
        document.getElementById('timeSpeed').textContent = timeScale.toFixed(1) + 'x';
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        const speed = 10;
        
        switch(e.key.toLowerCase()) {
            case 'w':
                camera.position.z -= speed;
                break;
            case 's':
                camera.position.z += speed;
                break;
            case 'a':
                camera.position.x -= speed;
                break;
            case 'd':
                camera.position.x += speed;
                break;
            case ' ':
                camera.position.y += speed;
                break;
            case 'shift':
                camera.position.y -= speed;
                break;
            case 'f':
                teleportToPlanet();
                break;
            case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
                const planetIndex = parseInt(e.key) - 1;
                const planetOrder = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
                if (planetIndex < planetOrder.length) {
                    selectedPlanet = planetOrder[planetIndex];
                    updatePlanetInfo(selectedPlanet);
                }
                break;
        }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Update camera distance display
    setInterval(() => {
        const distance = camera.position.length();
        const au = distance / 149600000; // Convert to AU
        document.getElementById('cameraDistance').textContent = au.toFixed(3) + ' AU';
    }, 1000);
}

// Change view mode
function changeViewMode(mode) {
    switch(mode) {
        case 'solar':
            camera.position.set(0, 50, 200);
            controls.maxDistance = 10000;
            showNotification('Switched to Solar System view', 'info');
            break;
        case 'galaxy':
            camera.position.set(0, 5000, 10000);
            controls.maxDistance = 50000;
            showNotification('Switched to Galaxy view', 'info');
            break;
        case 'universe':
            camera.position.set(0, 50000, 100000);
            controls.maxDistance = 1000000;
            showNotification('Switched to Universe view', 'info');
            break;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Calculate FPS
    frameCount++;
    if (frameCount % 60 === 0) {
        fps = Math.round(1 / deltaTime);
        document.getElementById('fpsCounter').textContent = fps;
        document.getElementById('renderedObjects').textContent = scene.children.length;
    }
    
    if (!isLoading) {
        // Update planets rotation and orbits
        Object.values(planets).forEach(planet => {
            if (planet.userData.type === 'planet') {
                // Rotation
                planet.rotation.y += planet.userData.data.rotationSpeed * timeScale * deltaTime;
                
                // Orbit
                planet.userData.angle += planet.userData.orbitSpeed * timeScale * deltaTime;
                planet.position.x = Math.cos(planet.userData.angle) * planet.userData.orbitRadius;
                planet.position.z = Math.sin(planet.userData.angle) * planet.userData.orbitRadius;
                
                // Update moon if exists
                if (planet.userData.moon) {
                    const moon = planet.userData.moon;
                    moon.userData.angle += moon.userData.orbitSpeed * timeScale * deltaTime;
                    moon.position.x = Math.cos(moon.userData.angle) * moon.userData.orbitRadius;
                    moon.position.z = Math.sin(moon.userData.angle) * moon.userData.orbitRadius;
                }
            } else if (planet.userData.type === 'sun') {
                // Sun rotation
                planet.rotation.y += 0.001 * timeScale * deltaTime;
            }
        });
        
        // Slowly rotate star field
        if (starsField) {
            starsField.rotation.y += 0.00001 * timeScale * deltaTime;
        }
        
        // Update universe time
        updateUniverseTime();
        
        // Update controls
        controls.update();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Update universe time display
function updateUniverseTime() {
    const now = new Date();
    const universeTime = new Date(now.getTime() * timeScale);
    
    const timeString = universeTime.toUTCString().replace('GMT', 'Universe Time');
    document.getElementById('universeTime').textContent = timeString;
    
    // Update online count with random variation
    const baseCount = 1235;
    const variation = Math.floor(Math.sin(Date.now() / 10000) * 50);
    document.getElementById('onlineCount').textContent = (baseCount + variation).toLocaleString();
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Logout function
function logout() {
    showNotification('Returning to login screen...', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initUniverse();
    updatePlanetInfo('earth');
    
    // Add GSAP for animations
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
    document.head.appendChild(script);
});
document.addEventListener('DOMContentLoaded', function() {
    // ... initUniverse ni chaqirish
});