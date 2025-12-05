/* =========================================================
   3D LOADING CALCULATOR - MVP VERSION
   ========================================================= */

let scene, camera, renderer, controls;
let vehicles = [];     // array of vehicle objects
let currentVehicle = 0;

/* =========================================================
   INITIALIZE 3D SCENE
   ========================================================= */
function init3D() {
    const canvas = document.getElementById("three-canvas");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(6, 5, 6);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    window.addEventListener("resize", onWindowResize);

    animate();
}

/* Resize handler */
function onWindowResize() {
    const canvas = document.getElementById("three-canvas");
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

/* Animation loop */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/* =========================================================
   DRAW WIRE CONTAINER / TRUCK
   ========================================================= */
function drawVehicleBox(type) {
    // Clear old scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    let L, W, H;

    switch (type) {
        case "truck":
            L = 13.6; W = 2.45; H = 2.70;
            break;
        case "c20":
            L = 5.90; W = 2.35; H = 2.39;
            break;
        case "c40":
            L = 12.03; W = 2.35; H = 2.39;
            break;
        case "c40hc":
            L = 12.03; W = 2.35; H = 2.69;
            break;
        default:
            L = 13.6; W = 2.45; H = 2.70;
    }

    const geometry = new THREE.BoxGeometry(L, H, W);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const wireframe = new THREE.LineSegments(edges, material);

    wireframe.position.set(L/2, H/2, W/2);
    scene.add(wireframe);
}

/* =========================================================
   ADD ITEM UI LOGIC
   ========================================================= */
document.getElementById("addItemBtn").addEventListener("click", addItem);

function addItem() {
    const container = document.getElementById("items-list");

    const itemDiv = document.createElement("div");
    itemDiv.className = "cargo-item";

    itemDiv.innerHTML = `
        <div class="cargo-header">
            <h3>Cargo Item</h3>
            <button class="remove-item-btn">Remove</button>
        </div>

        <div class="input-row">
            <div class="input-block">
                <label>Type</label>
                <select class="item-type">
                    <option value="box">Box</option>
                    <option value="bag">Bag</option>
                    <option value="bigbag">Big Bag</option>
                    <option value="barrel">Barrel</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            <div class="input-block">
                <label>Quantity</label>
                <input type="number" class="item-qty" min="1" value="1">
            </div>
        </div>

        <div class="input-row">
            <div class="input-block">
                <label>Length (mm)</label>
                <input type="number" class="item-l" value="1200">
            </div>
            <div class="input-block">
                <label>Width (mm)</label>
                <input type="number" class="item-w" value="800">
            </div>
            <div class="input-block">
                <label>Height (mm)</label>
                <input type="number" class="item-h" value="1000">
            </div>
        </div>

        <div class="input-row">
            <div class="input-block">
                <label>Weight (kg)</label>
                <input type="number" class="item-weight" value="500">
            </div>
            <div class="input-block">
                <label>Palletized?</label>
                <select class="item-pallet">
                    <option value="yes">Yes (1 unit per pallet)</option>
                    <option value="no">No</option>
                </select>
            </div>
        </div>
    `;

    /* Remove item button */
    itemDiv.querySelector(".remove-item-btn").onclick = () => {
        itemDiv.remove();
    };

    container.appendChild(itemDiv);
}

/* =========================================================
   PARSE UI INTO CARGO OBJECTS
   ========================================================= */
function getCargoItems() {
    const items = [];
    const blocks = document.querySelectorAll(".cargo-item");

    blocks.forEach(block => {
        const type = block.querySelector(".item-type").value;
        const qty = parseInt(block.querySelector(".item-qty").value);
        const L = parseFloat(block.querySelector(".item-l").value) / 1000;
        const W = parseFloat(block.querySelector(".item-w").value) / 1000;
        const H = parseFloat(block.querySelector(".item-h").value) / 1000;
        const weight = parseFloat(block.querySelector(".item-weight").value);
        const palletized = block.querySelector(".item-pallet").value;

        for (let i = 0; i < qty; i++) {
            let finalL = L, finalW = W, finalH = H, finalWeight = weight;

            if (palletized === "yes") {
                const palletL = 1.2;
                const palletW = 0.8;
                const palletH = 0.144;
                const palletWeight = 25;

                finalL = palletL;
                finalW = palletW;
                finalH = palletH + H;
                finalWeight = palletWeight + weight;
            }

            items.push({
                type,
                L: finalL,
                W: finalW,
                H: finalH,
                weight: finalWeight
            });
        }
    });

    return items;
}

/* =========================================================
   PACKING ENGINE (VERY SIMPLE HEURISTIC - MVP)
   ========================================================= */
function packItemsIntoVehicles(items, vehicleType) {

    let L, W, H, maxWeight;

    switch (vehicleType) {
        case "truck":
            L = 13.6; W = 2.45; H = 2.70; maxWeight = 25000;
            break;
        case "c20":
            L = 5.90; W = 2.35; H = 2.39; maxWeight = 24000;
            break;
        case "c40":
            L = 12.03; W = 2.35; H = 2.39; maxWeight = 26000;
            break;
        case "c40hc":
            L = 12.03; W = 2.35; H = 2.69; maxWeight = 26000;
            break;
    }

    items.sort((a, b) => (b.L * b.W) - (a.L * a.W));

    const vehicles = [];
    let vehicle = { items: [], usedWeight: 0 };
    let x = 0, y = 0, z = 0;

    for (const item of items) {
        if (vehicle.usedWeight + item.weight > maxWeight ||
            x + item.L > L ||
            y + item.H > H ||
            z + item.W > W) {
            vehicles.push(vehicle);
            vehicle = { items: [], usedWeight: 0 };
            x = y = z = 0;
        }

        item.pos = { x, y, z };
        vehicle.items.push(item);
        vehicle.usedWeight += item.weight;

        x += item.L;

        if (x > L) {
            x = 0;
            z += item.W;
        }
    }

    vehicles.push(vehicle);

    return vehicles;
}

/* =========================================================
   RENDER VEHICLE CONTENTS
   ========================================================= */
function renderVehicle(vehicleIndex) {
    const vehicle = vehicles[vehicleIndex];

    const type = document.querySelector("#vehicleType") ?
        document.querySelector("#vehicleType").value : "truck";

    drawVehicleBox(type);

    for (const item of vehicle.items) {
        const geometry = new THREE.BoxGeometry(item.L, item.H, item.W);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff8855,
            opacity: 0.85,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            item.pos.x + item.L/2,
            item.pos.y + item.H/2,
            item.pos.z + item.W/2
        );

        scene.add(mesh);
    }

    updateVehicleNav();
}

/* =========================================================
   VEHICLE NAVIGATION
   ========================================================= */
function updateVehicleNav() {
    const label = document.getElementById("vehicleLabel");
    label.textContent = `Vehicle ${currentVehicle + 1} / ${vehicles.length}`;

    document.getElementById("prevVehicle").disabled = currentVehicle === 0;
    document.getElementById("nextVehicle").disabled = currentVehicle === vehicles.length - 1;
}

document.getElementById("prevVehicle").onclick = () => {
    if (currentVehicle > 0) {
        currentVehicle--;
        renderVehicle(currentVehicle);
    }
};

document.getElementById("nextVehicle").onclick = () => {
    if (currentVehicle < vehicles.length - 1) {
        currentVehicle++;
        renderVehicle(currentVehicle);
    }
};

/* =========================================================
   MAIN CALCULATE BUTTON
   ========================================================= */
document.getElementById("calculateBtn").addEventListener("click", () => {
    const items = getCargoItems();

    if (items.length === 0) {
        alert("Please add at least one cargo item.");
        return;
    }

    const vehicleType = "truck"; // default for MVP

    vehicles = packItemsIntoVehicles(items, vehicleType);
    currentVehicle = 0;

    renderVehicle(0);
});

/* =========================================================
   INIT
   ========================================================= */
init3D();
