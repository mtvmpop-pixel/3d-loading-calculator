// Basic scaffold for 3D loading calculator
(function() {
    const container = document.getElementById('loading-widget');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    camera.position.set(3,3,3);
    controls.update();

    // Simple container box
    const boxGeo = new THREE.BoxGeometry(2,1,1);
    const boxMat = new THREE.MeshBasicMaterial({color:0x00aaff, wireframe:true});
    const box = new THREE.Mesh(boxGeo, boxMat);
    scene.add(box);

    function animate(){
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
})();
