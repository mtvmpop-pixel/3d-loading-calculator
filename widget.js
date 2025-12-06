/* ============================================
   3D LOADING CALCULATOR – WORKING MVP
   ============================================ */

let scene, camera, renderer, controls;
let vehicles = [];
let currentVehicle = 0;

/* VEHICLE PRESETS */
const VEHICLE_SPECS = {
    truck:  { L: 1360, W: 245, H: 260 },
    c20:    { L: 589,  W: 235, H: 239 },
    c40:    { L: 1203, W: 235, H: 239 },
    c40hc:  { L: 1203, W: 235, H: 269 }
};

/* =========================================================
   INITIALIZE 3D SCENE
   ========================================================= */
function init3D() {
    const canvas = document.getElementById("three-canvas");

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    scene = new THREE.Scene();
    scene.background = new THREE.Color("#111111");

    camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        5000
    );
    camera.position.set(800, 600, 900);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    window.addEventListener("resize", onResize);
    animate();
}

function onResize() {
    const canvas = document.getElementById("three-canvas");
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

/* =========================================================
   RENDER LOOP
   ========================================================= */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/* =========================================================
   BUILD VEHICLE (TRUCK OR CONTAINER)
   ========================================================= */
function buildVehicle(type) {
    const spec = VEHICLE_SPECS[type];
    const g = new THREE.BoxGeometry(spec.L, spec.H, spec.W);
    const m = new THREE.MeshBasicMaterial({
        color: 0x3333ff,
        wireframe: true,
        opacity: 0.4,
        transparent: true
    });

    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(0, 0, 0);

    return {
        type,
        spec,
        objects: [mesh],
        items: []
    };
}

/* =========================================================
   BUILD A BOX FOR AN ITEM
   ========================================================= */
function buildBox(item, color = 0xff8800) {
    const g = new THREE.BoxGeometry(item.L, item.H, item.W);
    const m = new THREE.MeshBasicMaterial({
        color,
        opacity: 0.7,
        transparent: true
    });

    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(item.x, item.H / 2, item.z);
    return mesh;
}

/* =========================================================
   CLEAR SCENE
   ========================================================= */
function clearScene() {
    while (scene.children.length > 0) {
        const obj = scene.children[0];
        scene.remove(obj);
    }
}

/* =========================================================
   RENDER SELECTED VEHICLE
   ========================================================= */
function renderVehicle() {
    clearScene();

    const vehicle = vehicles[currentVehicle];

    vehicle.objects.forEach(obj => scene.add(obj));
    vehicle.items.forEach(i => scene.add(i.mesh));

    document.getElementById("vehicleLabel").innerText =
        `Vehicle ${currentVehicle + 1} / ${vehicles.length}`;

    document.getElementById("prevVehicle").disabled = currentVehicle === 0;
    document.getElementById("nextVehicle").disabled = currentVehicle === vehicles.length - 1;
}

/* =========================================================
   SIMPLE PACKING ALGORITHM (ROW BASED)
   ========================================================= */
function packItemsIntoVehicle(type, items) {
    const spec = VEHICLE_SPECS[type];

    let x = -spec.L / 2 + 20;
    let z = -spec.W / 2 + 20;

    const placed = [];

    items.forEach(item => {
        if (x + item.L > spec.L / 2) {
            x = -spec.L / 2 + 20;
            z += item.W + 10;
        }

        if (z + item.W > spec.W / 2) return; // no more room

        const obj = {
            ...item,
            x,
            z
        };

        placed.push(obj);
        x += item.L + 10;
    });

    return placed;
}

/* =========================================================
   READ ITEM DATA FROM PAGE
   ========================================================= */
function getItems() {
    const blocks = document.querySelectorAll(".cargo-item");
    const list = [];

    blocks.forEach(b => {
        const L = Number(b.querySelector(".item-l").value);
        const W = Number(b.querySelector(".item-w").value);
        const H = Number(b.querySelector(".item-h").value);
        const weight = Number(b.querySelector(".item-weight").value);

        if (!L || !W || !H) return;

        list.push({ L, W, H, weight });
    });

    return list;
}

/* =========================================================
   CALCULATE AND DISPLAY RESULT
   ========================================================= */
function calculate() {
    const type = document.getElementById("vehicleType").value;
    const items = getItems();

    if (items.length === 0) {
        alert("Please add at least one cargo item.");
        return;
    }

    vehicles = [];
    currentVehicle = 0;

    const vehicle = buildVehicle(type);
    const packed = packItemsIntoVehicle(type, items);

    packed.forEach(item => {
        const mesh = buildBox(item);
        vehicle.items.push({ ...item, mesh });
    });

    vehicles.push(vehicle);

    renderVehicle();
}

/* =========================================================
   INIT BUTTONS AND EVENTS
   ========================================================= */
document.getElementById("addItemBtn").onclick = () => {
    const tpl = document.getElementById("item-template");
    const clone = tpl.content.cloneNode(true);
    clone.querySelector(".remove-item").onclick = (e) => {
        e.target.parentElement.remove();
    };
    document.getElementById("items-list").appendChild(clone);
};

document.getElementById("calculateBtn").onclick = calculate;

document.getElementById("prevVehicle").onclick = () => {
    currentVehicle--;
    renderVehicle();
};

document.getElementById("nextVehicle").onclick = () => {
    currentVehicle++;
    renderVehicle();
};

/* =========================================================
   START
   ========================================================= */
init3D();
