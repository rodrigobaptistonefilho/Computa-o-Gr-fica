const params = {
    animate: true,
    light: {
        directionalLight: true,
    },
    planeX: {
        constant: 0.0,
        negated: false,
        displayHelper: false
    },
    planeY: {
        constant: 0.0,
        negated: false,
        displayHelper: false
    },
    planeZ: {
        constant: 0.0,
        negated: false,
        displayHelper: false
    }
};
const init = () => {
    const clock = initClock();

    const scene = initScene();

    const ambientLight = initAmbientLight();
    const dirLight = initDirLight();
    const dirLightHelper = initDirLightHelper(dirLight);

    const camera = initCamera();
    const renderer = initRenderer();

    const ground = initGround();

    // Light
    scene.add(ambientLight);
    scene.add(dirLight);

    // Ground
    scene.add(ground);

    // Stats
    const stats = initStats();
    stats.update();

    document.getElementById("webgloutput").appendChild(renderer.domElement);

    const planes = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    ];

    const planeHelpers = planes.map(p => new THREE.PlaneHelper(p, 6, 0xffffff));
    planeHelpers.forEach(ph => {
        ph.visible = false;
        scene.add(ph);
    });

    const BoxGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const TorusKnotGeometry = new THREE.TorusKnotGeometry(0.4, 0.15, 220, 60);
    const IcosahedronGeometry = new THREE.IcosahedronGeometry(0.2, 15);

    const object = new THREE.Group();
    scene.add(object);

    const planeObjects = [];
    const planeGeom = new THREE.PlaneGeometry(10, 10);

    for (let i = 0; i < 3; i++) {
        const poGroup = new THREE.Group();
        const plane = planes[i];

        const stencilGroupBox = createPlaneStencilGroup(BoxGeometry, plane, i + 1);
        const stencilGroupTorusKnot = createPlaneStencilGroup(TorusKnotGeometry, plane, i + 1);
        const stencilGroupIcosahedron = createPlaneStencilGroup(IcosahedronGeometry, plane, i + 1);

        // plane is clipped by the other clipping planes
        const planeMat = initPlaneMaterial(planes, plane);
        const po = new THREE.Mesh(planeGeom, planeMat);
        po.onAfterRender = (renderer) => {
            renderer.clearStencil();
        };

        po.renderOrder = i + 1.1;

        object.add(stencilGroupBox);
        object.add(stencilGroupTorusKnot);
        object.add(stencilGroupIcosahedron);
        poGroup.add(po);
        planeObjects.push(po);
        scene.add(poGroup);
    }

    const material = initMaterial(planes);

    const clippedColorFrontBox = new THREE.Mesh(BoxGeometry, material);
    clippedColorFrontBox.castShadow = true;
    clippedColorFrontBox.position.set(0, -1, -1);
    clippedColorFrontBox.renderOrder = 6;
    object.add(clippedColorFrontBox);

    const clippedColorFrontTorusKnot = new THREE.Mesh(TorusKnotGeometry, material);
    clippedColorFrontTorusKnot.castShadow = true;
    clippedColorFrontTorusKnot.position.set(0, 0, 0);
    clippedColorFrontTorusKnot.renderOrder = 6;
    object.add(clippedColorFrontTorusKnot);

    const clippedColorFrontIcosahedron = new THREE.Mesh(IcosahedronGeometry, material);
    clippedColorFrontIcosahedron.castShadow = true;
    clippedColorFrontIcosahedron.position.set(0, 1, 1);
    clippedColorFrontIcosahedron.renderOrder = 6;
    object.add(clippedColorFrontIcosahedron);

    const animate = () => {
        const delta = clock.getDelta();
        requestAnimationFrame(animate);
        if (params.animate) {
            object.rotation.x += delta * 0.5;
            object.rotation.y += delta * 0.2;
        }
        for (let i = 0; i < planeObjects.length; i++) {
            const plane = planes[i];
            const po = planeObjects[i];
            plane.coplanarPoint(po.position);
            po.lookAt(
                po.position.x - plane.normal.x,
                po.position.y - plane.normal.y,
                po.position.z - plane.normal.z,
            );
        }
        stats.begin();
        renderer.render(scene, camera);
        stats.end();
    };

    controls = {
        backgroundSphere: () => {
            backgroundSphere(scene)
        }
    }

    initOrbitControls(camera, renderer);
    initGUI(controls, params, planeHelpers, planes, dirLight, dirLightHelper);

    animate();

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
}
// -----------------------------------------------------------------------
const initClock = () => {
    const clock = new THREE.Clock();
    return clock;
}
// -----------------------------------------------------------------------
const initScene = () => {
    const scene = new THREE.Scene();
    return scene;
}
// -----------------------------------------------------------------------
const initCamera = () => {
    const fov = 36;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(4, 4, 4);
    return camera;
}
// -----------------------------------------------------------------------
const initRenderer = () => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x263238);
    window.addEventListener('resize', init.onWindowResize);
    document.body.appendChild(renderer.domElement);
    renderer.localClippingEnabled = true;
    return renderer;
}
// -----------------------------------------------------------------------
const initGround = () => {
    const groundGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    const groundMaterial = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.5, side: THREE.DoubleSide })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    return ground;
}
// -----------------------------------------------------------------------
const initStats = (type) => {
    const panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    const stats = new Stats();
    stats.showPanel(panelType);
    document.body.appendChild(stats.dom);
    return stats;
}
// -----------------------------------------------------------------------
const initAmbientLight = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    return ambientLight;
}

const initDirLight = () => {
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    return dirLight;
}

const initDirLightHelper = (dirLight) => {
    const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
    return dirLightHelper;
}
// -----------------------------------------------------------------
const initOrbitControls = (camera, renderer) => {
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2.0;
    controls.maxDistance = 20.0;
    controls.update();
    return controls;
}
// -----------------------------------------------------------------
const initGUI = (controls, params, planeHelpers, planes, dirLight, dirLightHelper) => {
    const gui = new dat.GUI();
    gui.add(params, 'animate');

    const light = gui.addFolder('Light');
    light.add(params.light, 'directionalLight').onChange(() => {
        dirLight.visible = !dirLight.visible;
        dirLightHelper.visible = !dirLightHelper.visible;
    });
    light.open();

    const planeX = gui.addFolder('planeX');
    planeX.add(params.planeX, 'displayHelper').onChange(v => planeHelpers[0].visible = v);
    planeX.add(params.planeX, 'constant').min(-1.0).max(3.0).onChange(d => planes[0].constant = d);
    planeX.add(params.planeX, 'negated').onChange(() => {
        planes[0].negate();
        params.planeX.constant = planes[0].constant;
    });
    planeX.open();

    const planeY = gui.addFolder('planeY');
    planeY.add(params.planeY, 'displayHelper').onChange(v => planeHelpers[1].visible = v);
    planeY.add(params.planeY, 'constant').min(-1.0).max(3.0).onChange(d => planes[1].constant = d);
    planeY.add(params.planeY, 'negated').onChange(() => {
        planes[1].negate();
        params.planeY.constant = planes[1].constant;
    });
    planeY.open();

    const planeZ = gui.addFolder('planeZ');
    planeZ.add(params.planeZ, 'displayHelper').onChange(v => planeHelpers[2].visible = v);
    planeZ.add(params.planeZ, 'constant').min(-1.0).max(3.0).onChange(d => planes[2].constant = d);
    planeZ.add(params.planeZ, 'negated').onChange(() => {
        planes[2].negate();
        params.planeZ.constant = planes[2].constant;
    });
    planeZ.open();

    gui.add(controls, 'backgroundSphere');
}
// -----------------------------------------------------------------
const createPlaneStencilGroup = (geometry, plane, renderOrder) => {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0 = new THREE.Mesh(geometry, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
}
// -----------------------------------------------------------------
const initMaterial = (planes) => {
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFC107,
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: planes,
        clipShadows: true,
        shadowSide: THREE.DoubleSide,
    });
    return material;
}

const initPlaneMaterial = (planes, plane) => {
    const planeMat = new THREE.MeshStandardMaterial({
        color: 0xE91E63,
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: planes.filter(p => p !== plane),
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
    });
    return planeMat;
}
// -----------------------------------------------------------------
const initLoader = () => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./assets/textura.jpg');
    texture.anisotropy = 16;
    const textureMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        fog: true,
    });
    return textureMaterial;
}
// -----------------------------------------------------------------
const backgroundSphere = (scene) => {
    const icosahedronGeometry = [
        [new THREE.IcosahedronGeometry(1, 15), 50],
        [new THREE.IcosahedronGeometry(0.8, 15), 300],
        [new THREE.IcosahedronGeometry(0.6, 15), 1000],
        [new THREE.IcosahedronGeometry(0.4, 15), 2000],
        [new THREE.IcosahedronGeometry(0.3, 15), 8000]
    ];
    const loaderMaterial = initLoader();

    const lod = new THREE.LOD();
    for (let i = 0; i < icosahedronGeometry.length; i++) {
        const mesh = new THREE.Mesh(icosahedronGeometry[i][0], loaderMaterial);
        mesh.scale.set(1.5, 1.5, 1.5);
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        lod.addLevel(mesh, icosahedronGeometry[i][1]);
    }
    lod.position.x = 100 * (0.5 - Math.random());
    lod.position.y = 100 * (0.5 - Math.random());
    lod.position.z = 100 * (0.5 - Math.random());
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;
    scene.add(lod);
}