// Get the canvas and context
const canvas = document.getElementById('seaCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Island properties
const island = {
    x: canvas.width * 0.98,
    y: canvas.height * 0.98,
    radius: 70
};

// Boat object properties
const boat = {
    x: island.x,
    y: island.y,
    width: 25,
    height: 10,
    speed: 0.4,
    moving: false,
    observationRadius: 2000
};

// Constants
const DAYS_IN_MONTH = 30;
const MONTHS_IN_YEAR = 12;
const SIMULATION_SPEED = 0.1; // Real seconds per simulated day
const SECONDS_PER_REAL_SECOND = 1; // 1 real second per animation frame

const BOAT_SPEED = canvas.width / (120 * DAYS_IN_MONTH); // Boat traverses the screen in 4 months

const BLUE_WHALE_LIFESPAN_YEARS = 50; // Average lifespan in years

// Timer variables
let currentDay = 1;
let currentMonth = 1;
let currentYear = 1;
let daysPassed = 0; // Track total number of simulation days passed


// Start the simulation time
function updateTimer() {
    // Increase the number of days passed based on SIMULATION_SPEED
    daysPassed += SIMULATION_SPEED * SECONDS_PER_REAL_SECOND;

    // Convert daysPassed into currentDay, currentMonth, and currentYear
    while (daysPassed >= 1) {
        currentDay += 1;
        daysPassed -= 1; // Decrease the number of passed days once it's accounted for
        if (currentDay > DAYS_IN_MONTH) {
            currentDay = 1;
            currentMonth += 1;
        }
        if (currentMonth > MONTHS_IN_YEAR) {
            currentMonth = 1;
            currentYear += 1;
        }
    }
}




// Path drawing properties
let path = [];  // List of points the boat should follow
let isDrawing = false; // Whether the user is drawing the path
let readyToMove = false; // Flag to start moving the boat after drawing

// Whale object properties
const whales = [];
const whaleCount = 10; // Number of whales
let whalesSeen = new Set(); // Track whales the boat has seen

// Whale object properties
function createWhale() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30,
        speed: 2,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        sex: Math.random() > 0.5 ? 'male' : 'female', // Random sex
        metMaleThisYear: false, // For female whales to track if they met a male
        birthYear: currentYear, // Track birth year to limit reproduction to once per year
        age: 0, // Start from age 0
        lifespan: Math.random() * 10 + BLUE_WHALE_LIFESPAN_YEARS // Random lifespan close to average
    };
}

// Function to simulate whale reproduction
function handleReproduction() {
    // Only happens during summer (June, July, August)
    if (currentMonth >= 6 && currentMonth <= 8) {
        for (const whale of whales) {
            if (whale.sex === 'female' && whale.metMaleThisYear && currentYear > whale.birthYear) {
                // Reproduce once a year
                if (Math.random() < 0.1) { // Random chance for reproduction in summer
                    newWhale = createWhale();
                    newWhale.x = whale.x;
                    newWhale.y = whale.y;
                    whales.push(newWhale); // Add new baby whale
                    whale.metMaleThisYear = false; // Reset for next year
                    whale.birthYear = currentYear; // Only reproduce once a year
                    
                }
            }
        }
    }
}
// Check for encounters between male and female whales
function checkWhaleEncounters() {
    for (let i = 0; i < whales.length; i++) {
        const whaleA = whales[i];
        for (let j = i + 1; j < whales.length; j++) {
            const whaleB = whales[j];
            const dist = distance(whaleA.x, whaleA.y, whaleB.x, whaleB.y);
            if (dist < 50 && whaleA.sex !== whaleB.sex) {
                // If male and female whale meet, females flag this for reproduction
                if (whaleA.sex === 'female') whaleA.metMaleThisYear = true;
                if (whaleB.sex === 'female') whaleB.metMaleThisYear = true;
            }
        }
    }
}

// Whale aging and stochastic death simulation
function handleWhaleLifespan() {
    for (let i = whales.length - 1; i >= 0; i--) {
        const whale = whales[i];
        whale.age += 1 / DAYS_IN_MONTH; // Age by one month
        const deathProbability = 1 / (whale.lifespan * 12 * DAYS_IN_MONTH); // Daily death probability
        if (Math.random() < deathProbability) {
            whales.splice(i, 1); // Whale dies and is removed
        }
    }
}


// Helper function to check if a point is on the island
function isPointOnIsland(x, y) {
    return distance(x, y, island.x, island.y) < island.radius;
}

// Function to create whales randomly in the sea (but not on the island)
function createWhales() {
    for (let i = 0; i < whaleCount; i++) {
        let whale;
        do {
            whale = createWhale(); // Add new baby whale
            whale.metMaleThisYear = false; // Reset for next year
            whale.birthYear = currentYear; // Only reproduce once a year
        } while (isPointOnIsland(whale.x, whale.y)); // Ensure the whale is not on the island
        whales.push(whale);
    }
}



// Function to check if a line from (x1, y1) to (x2, y2) crosses the island
function doesCrossIsland(x1, y1, x2, y2) {
    // Island center and radius
    const cx = island.x;
    const cy = island.y;
    const r = island.radius;

    // Vector from (x1, y1) to (x2, y2)
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Vector from (x1, y1) to the center of the island (cx, cy)
    const fx = x1 - cx;
    const fy = y1 - cy;

    // Quadratic coefficients for solving intersection
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = (fx * fx + fy * fy) - r * r;

    // Calculate the discriminant
    const discriminant = b * b - 4 * a * c;

    // If the discriminant is negative, there's no intersection
    if (discriminant < 0) {
        return false;
    }

    // If the discriminant is zero or positive, we have potential intersections
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

    // Check if either intersection point is within the line segment (t should be between 0 and 1)
    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
        return true; // Line crosses the island
    }

    return false; // No intersection
}


// Function to move whales toward their target
function moveWhales() {
    for (const whale of whales) {
        const dist = distance(whale.x, whale.y, whale.targetX, whale.targetY);
        
        // If whale has reached its target, choose a new random target
        if (dist < 1 || doesCrossIsland(whale.x, whale.y, whale.targetX, whale.targetY)) {
            // Pick a new target that does not cross the island
            do {
                whale.targetX = Math.random() * canvas.width;
                whale.targetY = Math.random() * canvas.height;
            } while (doesCrossIsland(whale.x, whale.y, whale.targetX, whale.targetY));
        } else {
            const angle = Math.atan2(whale.targetY - whale.y, whale.targetX - whale.x);
            whale.x += whale.speed * Math.cos(angle);
            whale.y += whale.speed * Math.sin(angle);
        }
    }
}


// Draw the sea with gradient effect around the boat
function drawSea() {
    // Create radial gradient centered around the boat
     // Radius of the gradient effect around the boat
    const gradient = ctx.createRadialGradient(boat.x, boat.y, 0, boat.x, boat.y, boat.observationRadius);
    
    // Define gradient colors from light blue to dark blue
    gradient.addColorStop(0, 'lightblue');  // Closest to boat
    gradient.addColorStop(1, '#006994');    // Default sea color (farther from boat)
    
    // Fill the entire sea with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the boat
function drawBoat() {
    ctx.fillStyle = '#8B4513'; // Brown color for the boat
    ctx.fillRect(boat.x - boat.width / 2, boat.y - boat.height / 2, boat.width, boat.height);
}

// Draw the whales (only in the bright sea area around the boat)
function drawWhales() {
    for (const whale of whales) {
        // Calculate distance between whale and boat
        const dist = distance(boat.x, boat.y, whale.x, whale.y);

        // Only draw the whale if it's within the bright area (gradient radius)
        if (dist < boat.observationRadius) {
            ctx.fillStyle = whale.sex == "male" ? 'gray' :"red"; // Whale color
            ctx.beginPath();
            ctx.arc(whale.x, whale.y, whale.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // Mark whale as seen if it's not already in the set
            if (!whalesSeen.has(whale)) {
                whalesSeen.add(whale);
            }
        }
    }
}

// Draw the path trajectory
function drawPath() {
    if (path.length > 0) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }

        ctx.stroke();
    }
}

// Draw the island in the middle
function drawIsland() {
    ctx.fillStyle = '#3cb371'; // Green color for the island
    ctx.beginPath();
    ctx.arc(island.x, island.y, island.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Move the boat along the path
function moveBoat() {
    if (path.length === 0 || !readyToMove) return;
    
    const nextPoint = path[0];
    const dist = distance(boat.x, boat.y, nextPoint.x, nextPoint.y);

    if (dist < 1) {
        path.shift();
        if (path.length === 0) {
            boat.moving = false;
        }
        return;
    }

    const angle = Math.atan2(nextPoint.y - boat.y, nextPoint.x - boat.x);
    boat.x += BOAT_SPEED * Math.cos(angle); // Adjust boat speed
    boat.y += BOAT_SPEED * Math.sin(angle);

    boat.moving = true;
}

// Draw the timer in the upper-right corner
function drawTimer() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    const timerText = `Year ${currentYear}, Month ${currentMonth}, Day ${currentDay}`;
    ctx.fillText(timerText, canvas.width - 230, 30);
}

// Animate the scene
function animate() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update the timer and whales' behavior
    updateTimer();
    handleReproduction();
    handleWhaleLifespan();
    checkWhaleEncounters();

    // Draw everything
    drawSea();
    drawIsland();
    drawBoat();
    drawWhales();
    drawPath();
    drawTimer(); // Draw the timer

    // Move whales and the boat
    moveWhales();
    moveBoat();

    // Draw the whale counter
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Whales seen: ${whalesSeen.size}`, 10, 30);

    // Request the next frame
    requestAnimationFrame(animate);
}




// Autocomplete the path to end at the island
function completePathToIsland() {
    const lastPoint = path[path.length - 1];
    const distToIsland = distance(lastPoint.x, lastPoint.y, island.x, island.y);

    if (distToIsland > island.radius) {
        path.push({ x: island.x, y: island.y });
    }
}

// Start drawing the path when the mouse is pressed
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    readyToMove = false; // Reset the boat movement flag
    path = []; // Clear any previous path
    const startPoint = { x: event.clientX, y: event.clientY };
    path.push(startPoint); // Add the starting point of the path
});

// Continue drawing the path as the mouse moves
canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
        const newPoint = { x: event.clientX, y: event.clientY };
        path.push(newPoint); // Add points to the path as the user drags
    }
});

// Stop drawing the path when the mouse is released, complete the path, and start boat movement
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    completePathToIsland(); // Ensure path ends at the island
    readyToMove = true; // Boat will start moving once path is drawn
});

// Start the animation loop and create whales
createWhales();
animate();
