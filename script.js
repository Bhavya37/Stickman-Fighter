// Basic setup for Stickman Fighting Game (Single Player Prototype)

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.addEventListener("keydown", (e) => {
    if (["Control", "s", "u", "d"].includes(e.key) && e.ctrlKey) {
        e.preventDefault();
    }
});

let groundY = canvas.height - 50;
let player = {
    x: 200,
    y: groundY - 110, // Adjusted so feet touch the ground
    radius: 20, // Head size
    speed: 5,
    dx: 0,
    dy: 0,
    armLength: 30,
    legLength: 40,
    bodyHeight: 50,
    isJumping: false,
    isCrouching: false,
    crouchOffset: 15 // Adjust height when crouching
};

let keys = {};
let drawing = false;
let weaponPath = [];
let weaponEquipped = false;
let weaponOffset = { x: player.armLength, y: player.bodyHeight / 2 };
let attack = false;
let weaponAngle = 0;
let mouseHeld = false;

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " && !player.isJumping) {
        player.dy = -12;
        player.isJumping = true;
    }
    if (e.key === "Control") {
        player.isCrouching = true;
        player.y += player.crouchOffset; // Adjust y-position when crouching
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.key === "Control") {
        player.isCrouching = false;
        player.y -= player.crouchOffset; // Reset y-position when not crouching
    }
});

canvas.addEventListener("mousedown", (e) => {
    mouseHeld = true;
    startDrawing(e);
});
canvas.addEventListener("mousemove", (e) => {
    if (mouseHeld) {
        drawWeapon(e);
        attackWeapon(e);
    }
});
canvas.addEventListener("mouseup", (e) => {
    mouseHeld = false;
    stopDrawing(e);
});

function movePlayer() {
    player.dx = 0;
    if (keys["ArrowRight"] || keys["d"]) player.dx = player.isCrouching ? player.speed / 2 : player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.dx = player.isCrouching ? -player.speed / 2 : -player.speed;
    player.x += player.dx;
    
    player.y += player.dy;
    player.dy += 0.5; // Gravity
    if (player.y >= groundY - 110) {
        player.y = groundY - 110;
        player.dy = 0;
        player.isJumping = false;
    }
}

function checkWeaponCollision() {
    if (!weaponEquipped) return;
    let weaponPivotX = player.x + player.armLength;
    let weaponPivotY = player.y + player.radius + 20;
    for (let i = 0; i < weaponPath.length; i++) {
        let weaponX = weaponPivotX + (weaponPath[i].x - weaponPath[0].x) * Math.cos(weaponAngle) - (weaponPath[i].y - weaponPath[0].y) * Math.sin(weaponAngle);
        let weaponY = weaponPivotY + (weaponPath[i].x - weaponPath[0].x) * Math.sin(weaponAngle) + (weaponPath[i].y - weaponPath[0].y) * Math.cos(weaponAngle);
        
        // Prevent weapon from going under the ground
        if (weaponY >= groundY) {
            weaponY = groundY;
        }
        
        // Prevent weapon from going through the player
        if (weaponX >= player.x - player.radius && weaponX <= player.x + player.radius && weaponY >= player.y - player.radius && weaponY <= player.y + player.radius + player.bodyHeight) {
            // Resolve collision by adjusting positions without applying excessive force
            let overlapX = (player.x + player.radius) - weaponX;
            let overlapY = (player.y + player.radius + player.bodyHeight) - weaponY;
            player.x -= overlapX / 4;
            player.y -= overlapY / 4;
            weaponPivotX += overlapX / 4;
            weaponPivotY += overlapY / 4;
        }
    }
}

function drawGround() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, groundY, canvas.width, 10);
}

function drawPlayer() {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    
    let bodyYOffset = player.isCrouching ? player.crouchOffset : 0;

    // Draw head
    ctx.beginPath();
    ctx.arc(player.x, player.y + bodyYOffset, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw body
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.radius + bodyYOffset);
    ctx.lineTo(player.x, player.y + player.radius + player.bodyHeight - bodyYOffset);
    ctx.stroke();
    
    // Draw arms
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.radius + 10 + bodyYOffset);
    ctx.lineTo(player.x - player.armLength, player.y + player.radius + 20 + bodyYOffset);
    ctx.moveTo(player.x, player.y + player.radius + 10 + bodyYOffset);
    ctx.lineTo(player.x + player.armLength, player.y + player.radius + 20 + bodyYOffset);
    ctx.stroke();
    
    // Draw animated legs
    let legOffset = Math.sin(Date.now() / 50) * 10 * (player.dx !== 0 ? 1 : 0);
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.radius + player.bodyHeight - bodyYOffset);
    ctx.lineTo(player.x - player.legLength + legOffset, player.y + player.radius + player.bodyHeight + player.legLength - bodyYOffset);
    ctx.moveTo(player.x, player.y + player.radius + player.bodyHeight - bodyYOffset);
    ctx.lineTo(player.x + player.legLength - legOffset, player.y + player.radius + player.bodyHeight + player.legLength - bodyYOffset);
    ctx.stroke();
}

function startDrawing(e) {
    if (weaponEquipped) return;
    drawing = true;
    weaponPath = [{ x: e.clientX, y: e.clientY }];
}

function drawWeapon(e) {
    if (!drawing) return;
    weaponPath.push({ x: e.clientX, y: e.clientY });
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i < weaponPath.length - 1; i++) {
        ctx.moveTo(weaponPath[i].x, weaponPath[i].y);
        ctx.lineTo(weaponPath[i + 1].x, weaponPath[i + 1].y);
    }
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
    if (weaponPath.length > 2) {
        weaponEquipped = true;
    }
}

function drawWeaponOnPlayer() {
    if (!weaponEquipped) return;
    ctx.save();
    let weaponPivotX = player.x + player.armLength;
    let weaponPivotY = player.y + player.radius + 20;
    ctx.translate(weaponPivotX, weaponPivotY);
    ctx.rotate(weaponAngle);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i < weaponPath.length - 1; i++) {
        ctx.moveTo(
            weaponPath[i].x - weaponPath[0].x,
            weaponPath[i].y - weaponPath[0].y
        );
        ctx.lineTo(
            weaponPath[i + 1].x - weaponPath[0].x,
            weaponPath[i + 1].y - weaponPath[0].y
        );
    }
    ctx.stroke();
    ctx.restore();
}

function attackWeapon(e) {
    if (!weaponEquipped) return;
    let dx = e.clientX - (player.x + player.armLength);
    let dy = e.clientY - (player.y + player.radius + 20);
    weaponAngle = Math.atan2(dy, dx);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    movePlayer();
    drawPlayer();
    drawWeaponOnPlayer();
    checkWeaponCollision(); // Check for weapon collision
    requestAnimationFrame(update);
}

update();