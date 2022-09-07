# Implementação: Animação com WebGL e Three.js

> Criar uma animação utilizando WebGL e a biblioteca Three.js que siga os seguintes critérios:

1. Utilizar animação com RequestAnimationFrame

```js
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
      po.position.z - plane.normal.z
    );
  }
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
};
```

2. Utilize pelo menos 3 tipos diferentes de geometrias

```js
const BoxGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
const TorusKnotGeometry = new THREE.TorusKnotGeometry(0.4, 0.15, 220, 60);
const IcosahedronGeometry = new THREE.IcosahedronGeometry(0.2, 15);
```

3. Utilize pelo menos 2 tipos de materiais

```js
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
};
```

```js
const initMaterial = (planes) => {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffc107,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: planes,
    clipShadows: true,
    shadowSide: THREE.DoubleSide,
  });
  return material;
};

const initPlaneMaterial = (planes, plane) => {
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0xe91e63,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: planes.filter((p) => p !== plane),
    stencilWrite: true,
    stencilRef: 0,
    stencilFunc: THREE.NotEqualStencilFunc,
    stencilFail: THREE.ReplaceStencilOp,
    stencilZFail: THREE.ReplaceStencilOp,
    stencilZPass: THREE.ReplaceStencilOp,
  });
  return planeMat;
};
```

4. Carregue pelo menos 1 textura

```js
const initLoader = () => {
  const loader = new THREE.TextureLoader();
  const texture = loader.load("./assets/textura.jpg");
  texture.anisotropy = 16;
  const textureMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    fog: true,
  });
  return textureMaterial;
};
```

5. Possua pelo menos 2 fontes de iluminação

```js
const initAmbientLight = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  return ambientLight;
};

const initDirLight = () => {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  return dirLight;
};

const initDirLightHelper = (dirLight) => {
  const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
  return dirLightHelper;
};
```

6. Carregue pelo menos um modelo externo

```js
    ...

```

7. Realize a criação de objetos dinâmicos

```js
const backgroundSphere = (scene) => {
  const icosahedronGeometry = [
    [new THREE.IcosahedronGeometry(1, 15), 50],
    [new THREE.IcosahedronGeometry(0.8, 15), 300],
    [new THREE.IcosahedronGeometry(0.6, 15), 1000],
    [new THREE.IcosahedronGeometry(0.4, 15), 2000],
    [new THREE.IcosahedronGeometry(0.3, 15), 8000],
  ];
  const loaderMaterial = initLoaderMadeira();

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
};
```

8. Possua algum tipo de interação com o usuário (mouse ou teclado)

```js
const initOrbitControls = (camera, renderer) => {
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2.0;
  controls.maxDistance = 20.0;
  controls.update();
  return controls;
};
```

```js
const initGUI = (
  controls,
  params,
  planeHelpers,
  planes,
  dirLight,
  dirLightHelper
) => {
  const gui = new dat.GUI();
  gui.add(params, "animate");

  const light = gui.addFolder("Light");
  light.add(params.light, "directionalLight").onChange(() => {
    dirLight.visible = !dirLight.visible;
    dirLightHelper.visible = !dirLightHelper.visible;
  });
  light.open();

  const planeX = gui.addFolder("planeX");
  planeX
    .add(params.planeX, "displayHelper")
    .onChange((v) => (planeHelpers[0].visible = v));
  planeX
    .add(params.planeX, "constant")
    .min(-1.0)
    .max(3.0)
    .onChange((d) => (planes[0].constant = d));
  planeX.add(params.planeX, "negated").onChange(() => {
    planes[0].negate();
    params.planeX.constant = planes[0].constant;
  });
  planeX.open();

  const planeY = gui.addFolder("planeY");
  planeY
    .add(params.planeY, "displayHelper")
    .onChange((v) => (planeHelpers[1].visible = v));
  planeY
    .add(params.planeY, "constant")
    .min(-1.0)
    .max(3.0)
    .onChange((d) => (planes[1].constant = d));
  planeY.add(params.planeY, "negated").onChange(() => {
    planes[1].negate();
    params.planeY.constant = planes[1].constant;
  });
  planeY.open();

  const planeZ = gui.addFolder("planeZ");
  planeZ
    .add(params.planeZ, "displayHelper")
    .onChange((v) => (planeHelpers[2].visible = v));
  planeZ
    .add(params.planeZ, "constant")
    .min(-1.0)
    .max(3.0)
    .onChange((d) => (planes[2].constant = d));
  planeZ.add(params.planeZ, "negated").onChange(() => {
    planes[2].negate();
    params.planeZ.constant = planes[2].constant;
  });
  planeZ.open();

  gui.add(controls, "backgroundSphere");
};
```
