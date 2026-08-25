// ============================================================
// CITY LEGENDS
// MAIN GAME ENGINE
// FULL REPLACEMENT
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
    PlayerController,
    PlayerState
} from "./player.js";


// ============================================================
// GAME STATE
// ============================================================

const GameState = {

    running: false,
    paused: false,

    health: 100,
    stamina: 100,
    armor: 0,

    money: 500,

    wantedLevel: 0,

    gameTime: 8 * 60,

    player: null,
    playerController: null,

    scene: null,
    camera: null,
    renderer: null,

    clock: new THREE.Clock(),

    objects: [],

    buildings: [],
    roads: [],
    props: [],

    worldSize: 4000,

    fps: 0,
    frameCount: 0,
    fpsTimer: 0,

    currentMission: {
        title: "Explore the City",
        objective: "Explore the surrounding area."
    }

};


// ============================================================
// DOM
// ============================================================

const canvas =
    document.getElementById("gameCanvas");


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        canvas,

        antialias: true,

        powerPreference:
            "high-performance"

    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio || 1,
        2
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.1;


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x86b7df
    );


scene.fog =
    new THREE.Fog(
        0x86b7df,
        400,
        2200
    );


GameState.scene =
    scene;


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        60,

        window.innerWidth /
        window.innerHeight,

        0.1,

        5000

    );


camera.position.set(
    0,
    6,
    14
);


GameState.camera =
    camera;


// ============================================================
// LIGHTING
// ============================================================

const hemisphere =
    new THREE.HemisphereLight(

        0xffffff,

        0x405060,

        1.5

    );


scene.add(
    hemisphere
);


const sun =
    new THREE.DirectionalLight(

        0xffffff,

        2.5

    );


sun.position.set(
    300,
    500,
    200
);


sun.castShadow =
    true;


sun.shadow.mapSize.width =
    2048;


sun.shadow.mapSize.height =
    2048;


sun.shadow.camera.left =
    -800;

sun.shadow.camera.right =
    800;

sun.shadow.camera.top =
    800;

sun.shadow.camera.bottom =
    -800;


sun.shadow.camera.near =
    10;

sun.shadow.camera.far =
    1500;


scene.add(
    sun
);


// ============================================================
// MATERIAL HELPERS
// ============================================================

function material(
    color,
    roughness = 0.8
) {

    return new THREE.MeshStandardMaterial({

        color,

        roughness,

        metalness: 0

    });

}


// ============================================================
// WORLD CREATION
// ============================================================

function createWorld() {

    createGround();

    createRoadNetwork();

    createCityBlocks();

    createParks();

    createStreetLights();

    createRoadMarkings();

    createTrees();

    createWorldBoundary();

}


// ============================================================
// GROUND
// ============================================================

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(
            GameState.worldSize,
            GameState.worldSize
        );


    const groundMaterial =
        material(
            0x467447,
            1
        );


    const ground =
        new THREE.Mesh(
            geometry,
            groundMaterial
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.receiveShadow =
        true;


    scene.add(
        ground
    );


    GameState.objects.push(
        ground
    );

}


// ============================================================
// ROAD NETWORK
// ============================================================

function createRoadNetwork() {

    const roadWidth = 28;

    const spacing = 120;

    const half =
        GameState.worldSize / 2;


    for (
        let x = -half;
        x <= half;
        x += spacing
    ) {

        createRoad(
            x,
            0,
            GameState.worldSize,
            roadWidth,
            "vertical"
        );

    }


    for (
        let z = -half;
        z <= half;
        z += spacing
    ) {

        createRoad(
            0,
            z,
            GameState.worldSize,
            roadWidth,
            "horizontal"
        );

    }

}


// ============================================================
// ROAD
// ============================================================

function createRoad(
    x,
    z,
    length,
    width,
    direction
) {

    const geometry =

        direction ===
        "horizontal"

            ? new THREE.PlaneGeometry(
                length,
                width
            )

            : new THREE.PlaneGeometry(
                width,
                length
            );


    const roadMaterial =
        material(
            0x202326,
            0.95
        );


    const road =
        new THREE.Mesh(
            geometry,
            roadMaterial
        );


    road.rotation.x =
        -Math.PI / 2;


    road.position.set(
        x,
        0.03,
        z
    );


    road.receiveShadow =
        true;


    scene.add(
        road
    );


    GameState.roads.push(
        road
    );


    GameState.objects.push(
        road
    );

}


// ============================================================
// CITY BLOCKS
// ============================================================

function createCityBlocks() {

    const spacing = 120;

    const half =
        1200;


    for (
        let x = -half;
        x <= half;
        x += spacing
    ) {

        for (
            let z = -half;
            z <= half;
            z += spacing
        ) {

            if (
                Math.abs(x) < 80 &&
                Math.abs(z) < 80
            ) {

                continue;

            }


            createBlock(
                x,
                z
            );

        }

    }

}


// ============================================================
// BUILDING BLOCK
// ============================================================

function createBlock(
    centerX,
    centerZ
) {

    const buildingCount =
        2 +
        Math.floor(
            Math.random() * 5
        );


    const colors = [

        0x72767b,
        0x858585,
        0x927c69,
        0x5e666d,
        0x77706a,
        0x62666a,
        0x8d8b84

    ];


    for (
        let i = 0;
        i < buildingCount;
        i++
    ) {

        const width =
            22 +
            Math.random() * 32;


        const depth =
            22 +
            Math.random() * 32;


        const height =
            18 +
            Math.random() * 130;


        const geometry =
            new THREE.BoxGeometry(

                width,

                height,

                depth

            );


        const buildingMaterial =
            material(

                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],

                0.75

            );


        const building =
            new THREE.Mesh(

                geometry,

                buildingMaterial

            );


        building.position.set(

            centerX +
            (Math.random() - 0.5) *
            70,

            height / 2,

            centerZ +
            (Math.random() - 0.5) *
            70

        );


        building.castShadow =
            true;


        building.receiveShadow =
            true;


        scene.add(
            building
        );


        GameState.buildings.push(
            building
        );


        GameState.objects.push(
            building
        );


        addBuildingRoof(
            building
        );

    }

}


// ============================================================
// BUILDING ROOF DETAIL
// ============================================================

function addBuildingRoof(
    building
) {

    if (
        Math.random() > 0.35
    ) {

        return;

    }


    const roofGeometry =
        new THREE.BoxGeometry(

            building.scale.x * 2,
            2,

            building.scale.z * 2

        );


    const roofMaterial =
        material(
            0x3c3c3c
        );


    const roof =
        new THREE.Mesh(

            roofGeometry,

            roofMaterial

        );


    roof.position.set(

        building.position.x,

        building.position.y +
        building.geometry.parameters.height /
        2 +
        1,

        building.position.z

    );


    roof.castShadow =
        true;


    scene.add(
        roof
    );


}


// ============================================================
// PARKS
// ============================================================

function createParks() {

    const parkLocations = [

        [-600, -600],
        [600, -600],
        [-600, 600],
        [600, 600],
        [0, -600],
        [0, 600]

    ];


    for (
        const location
        of parkLocations
    ) {

        createPark(
            location[0],
            location[1]
        );

    }

}


// ============================================================
// PARK
// ============================================================

function createPark(
    x,
    z
) {

    const geometry =
        new THREE.BoxGeometry(
            75,
            0.5,
            75
        );


    const parkMaterial =
        material(
            0x3f7d3f
        );


    const park =
        new THREE.Mesh(
            geometry,
            parkMaterial
        );


    park.position.set(
        x,
        0.25,
        z
    );


    park.receiveShadow =
        true;


    scene.add(
        park
    );


    GameState.props.push(
        park
    );


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        createTree(

            x +
            (Math.random() - 0.5) *
            60,

            z +
            (Math.random() - 0.5) *
            60

        );

    }

}


// ============================================================
// TREES
// ============================================================

function createTrees() {

    for (
        let i = 0;
        i < 180;
        i++
    ) {

        const x =
            (Math.random() - 0.5) *
            2400;


        const z =
            (Math.random() - 0.5) *
            2400;


        if (
            isNearRoad(
                x,
                z
            )
        ) {

            continue;

        }


        createTree(
            x,
            z
        );

    }

}


// ============================================================
// TREE
// ============================================================

function createTree(
    x,
    z
) {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.6,
            0.8,
            5,
            8
        );


    const trunkMaterial =
        material(
            0x65442c
        );


    const trunk =
        new THREE.Mesh(

            trunkGeometry,

            trunkMaterial

        );


    trunk.position.set(
        x,
        2.5,
        z
    );


    trunk.castShadow =
        true;


    scene.add(
        trunk
    );


    const leavesGeometry =
        new THREE.SphereGeometry(
            3.2,
            10,
            8
        );


    const leavesMaterial =
        material(
            0x2f6e38
        );


    const leaves =
        new THREE.Mesh(

            leavesGeometry,

            leavesMaterial

        );


    leaves.position.set(
        x,
        6,
        z
    );


    leaves.castShadow =
        true;


    scene.add(
        leaves
    );


    GameState.props.push(
        trunk,
        leaves
    );

}


// ============================================================
// ROAD CHECK
// ============================================================

function isNearRoad(
    x,
    z
) {

    const spacing = 120;

    const roadWidth = 32;


    const nearestX =
        Math.round(
            x / spacing
        ) * spacing;


    const nearestZ =
        Math.round(
            z / spacing
        ) * spacing;


    return (

        Math.abs(
            x - nearestX
        ) < roadWidth ||

        Math.abs(
            z - nearestZ
        ) < roadWidth

    );

}


// ============================================================
// STREET LIGHTS
// ============================================================

function createStreetLights() {

    const spacing = 120;

    const half = 1200;


    for (
        let x = -half;
        x <= half;
        x += spacing
    ) {

        for (
            let z = -half;
            z <= half;
            z += spacing
        ) {

            createStreetLight(
                x + 18,
                z + 18
            );

            createStreetLight(
                x - 18,
                z - 18
            );

        }

    }

}


// ============================================================
// STREET LIGHT
// ============================================================

function createStreetLight(
    x,
    z
) {

    const poleGeometry =
        new THREE.CylinderGeometry(
            0.15,
            0.2,
            7,
            8
        );


    const poleMaterial =
        material(
            0x333333,
            0.5
        );


    const pole =
        new THREE.Mesh(

            poleGeometry,

            poleMaterial

        );


    pole.position.set(
        x,
        3.5,
        z
    );


    pole.castShadow =
        true;


    scene.add(
        pole
    );


    const lampGeometry =
        new THREE.SphereGeometry(
            0.35,
            8,
            8
        );


    const lampMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffe6a3,

            emissive: 0xffaa33,

            emissiveIntensity: 0.8

        });


    const lamp =
        new THREE.Mesh(

            lampGeometry,

            lampMaterial

        );


    lamp.position.set(
        x,
        7,
        z
    );


    scene.add(
        lamp
    );


}


// ============================================================
// ROAD MARKINGS
// ============================================================

function createRoadMarkings() {

    const spacing = 120;

    const half = 1200;


    for (
        let x = -half;
        x <= half;
        x += spacing
    ) {

        for (
            let z = -half;
            z <= half;
            z += 30
        ) {

            createMarking(
                x,
                z,
                false
            );

        }

    }


    for (
        let z = -half;
        z <= half;
        z += spacing
    ) {

        for (
            let x = -half;
            x <= half;
            x += 30
        ) {

            createMarking(
                x,
                z,
                true
            );

        }

    }

}


// ============================================================
// MARKING
// ============================================================

function createMarking(
    x,
    z,
    horizontal
) {

    const geometry =
        new THREE.PlaneGeometry(
            horizontal ? 5 : 0.35,
            horizontal ? 0.35 : 5
        );


    const markingMaterial =
        material(
            0xd7c94a
        );


    const marking =
        new THREE.Mesh(
            geometry,
            markingMaterial
        );


    marking.rotation.x =
        -Math.PI / 2;


    marking.position.set(
        x,
        0.055,
        z
    );


    scene.add(
        marking
    );

}


// ============================================================
// WORLD BOUNDARY
// ============================================================

function createWorldBoundary() {

    const boundary =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3500,
                200,
                3500
            ),

            new THREE.MeshBasicMaterial({
                visible: false
            })

        );


    boundary.position.y =
        100;


    scene.add(
        boundary
    );

}


// ============================================================
// PLAYER
// ============================================================

function createPlayer() {

    const group =
        new THREE.Group();


    // Body

    const body =
        new THREE.Mesh(

            new THREE.CapsuleGeometry(
                0.65,
                1.6,
                8,
                16
            ),

            material(
                0x245b99,
                0.7
            )

        );


    body.position.y =
        1.8;


    body.castShadow =
        true;


    group.add(
        body
    );


    // Head

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.42,
                16,
                12
            ),

            material(
                0xc48a68
            )

        );


    head.position.y =
        3.15;


    head.castShadow =
        true;


    group.add(
        head
    );


    group.position.set(
        0,
        0,
        60
    );


    scene.add(
        group
    );


    GameState.player =
        group;


    GameState.playerController =
        new PlayerController(
            group,
            camera
        );


    GameState.playerController
        .updateHUD();

}


// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

    if (
        !GameState.player
    ) {

        return;

    }


    const player =
        GameState.player;


    const target =
        new THREE.Vector3(

            player.position.x,

            player.position.y +
            2.4,

            player.position.z

        );


    const backward =
        new THREE.Vector3(
            0,
            0,
            1
        );


    backward.applyQuaternion(
        player.quaternion
    );


    const desired =
        player.position
            .clone()
            .add(
                backward.multiplyScalar(
                    10
                )
            );


    desired.y +=
        5.5;


    camera.position.lerp(
        desired,
        0.08
    );


    camera.lookAt(
        target
    );

}


// ============================================================
// TIME SYSTEM
// ============================================================

function updateTime(
    delta
) {

    GameState.gameTime +=
        delta * 0.35;


    if (
        GameState.gameTime >=
        1440
    ) {

        GameState.gameTime -=
            1440;

    }


    updateLighting();

}


// ============================================================
// LIGHTING TIME
// ============================================================

function updateLighting() {

    const minutes =
        GameState.gameTime;


    const normalized =
        minutes / 1440;


    const sunAngle =
        normalized *
        Math.PI * 2;


    const height =
        Math.sin(
            sunAngle
        );


    sun.position.set(

        Math.cos(
            sunAngle
        ) * 500,

        Math.max(
            30,
            height * 500
        ),

        Math.sin(
            sunAngle
        ) * 500

    );


    const night =
        height < 0;


    if (night) {

        scene.background.set(
            0x10182b
        );

        scene.fog.color.set(
            0x10182b
        );

        sun.intensity =
            0.35;

        hemisphere.intensity =
            0.45;

    }

    else {

        scene.background.set(
            0x86b7df
        );

        scene.fog.color.set(
            0x86b7df
        );

        sun.intensity =
            2.5;

        hemisphere.intensity =
            1.5;

    }

}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

    const playerController =
        GameState.playerController;


    if (
        !playerController
    ) {

        return;

    }


    const health =
        document.getElementById(
            "healthValue"
        );


    const stamina =
        document.getElementById(
            "staminaValue"
        );


    const armor =
        document.getElementById(
            "armorValue"
        );


    const money =
        document.getElementById(
            "moneyValue"
        );


    if (health) {

        health.textContent =
            Math.round(
                PlayerState.health
            );

    }


    if (stamina) {

        stamina.textContent =
            Math.round(
                PlayerState.stamina
            );

    }


    if (armor) {

        armor.textContent =
            Math.round(
                PlayerState.armor
            );

    }


    if (money) {

        money.textContent =
            GameState.money
                .toLocaleString();

    }


    const missionTitle =
        document.getElementById(
            "missionTitle"
        );


    const missionObjective =
        document.getElementById(
            "missionObjective"
        );


    if (missionTitle) {

        missionTitle.textContent =
            GameState.currentMission
                .title
                .toUpperCase();

    }


    if (missionObjective) {

        missionObjective.textContent =
            GameState.currentMission
                .objective;

    }


    updateWantedStars();

}


// ============================================================
// WANTED SYSTEM DISPLAY
// ============================================================

function updateWantedStars() {

    const container =
        document.getElementById(
            "wantedStars"
        );


    if (
        !container
    ) {

        return;

    }


    const stars =
        container.querySelectorAll(
            "span"
        );


    stars.forEach(
        (star, index) => {

            star.textContent =
                index <
                GameState.wantedLevel

                    ? "★"

                    : "☆";

        }
    );

}


// ============================================================
// MINIMAP
// ============================================================

function updateMinimap() {

    const canvas =
        document.getElementById(
            "minimapCanvas"
        );


    if (
        !canvas ||
        !GameState.player
    ) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    const width =
        canvas.width;

    const height =
        canvas.height;


    context.clearRect(
        0,
        0,
        width,
        height
    );


    context.fillStyle =
        "#2d5b31";


    context.fillRect(
        0,
        0,
        width,
        height
    );


    context.fillStyle =
        "#333";


    const scale =
        0.11;


    for (
        const road
        of GameState.roads
    ) {

        const x =
            width / 2 +
            road.position.x *
            scale;


        const y =
            height / 2 +
            road.position.z *
            scale;


        if (
            road.geometry
                .parameters
                .width >
            100
        ) {

            context.fillRect(
                x - 2,
                0,
                4,
                height
            );

        }

    }


    context.fillStyle =
        "#ffffff";


    context.beginPath();

    context.arc(
        width / 2,
        height / 2,
        6,
        0,
        Math.PI * 2
    );

    context.fill();

}


// ============================================================
// FPS
// ============================================================

function updateFPS(
    delta
) {

    GameState.frameCount++;

    GameState.fpsTimer +=
        delta;


    if (
        GameState.fpsTimer >=
        1
    ) {

        GameState.fps =
            GameState.frameCount /
            GameState.fpsTimer;

        GameState.frameCount =
            0;

        GameState.fpsTimer =
            0;


        const fps =
            document.getElementById(
                "debugFPS"
            );


        if (fps) {

            fps.textContent =
                Math.round(
                    GameState.fps
                );

        }

    }

}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            GameState.clock
                .getDelta(),
            0.05
        );


    if (
        GameState.running &&
        !GameState.paused
    ) {

        if (
            GameState.playerController
        ) {

            GameState
                .playerController
                .update(delta);

        }


        updateCamera();

        updateTime(delta);

        updateMinimap();

        updateHUD();

        updateFPS(delta);

    }


    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ============================================================
// KEYBOARD PAUSE
// ============================================================

window.addEventListener(
    "keydown",
    event => {

        if (
            event.code ===
            "Escape"
        ) {

            togglePause();

        }

    }
);


// ============================================================
// PAUSE
// ============================================================

function togglePause() {

    GameState.paused =
        !GameState.paused;


    const pauseMenu =
        document.getElementById(
            "pauseMenu"
        );


    if (
        !pauseMenu
    ) {

        return;

    }


    pauseMenu.classList.toggle(
        "hidden",
        !GameState.paused
    );

}


// ============================================================
// BUTTONS
// ============================================================

function setupButtons() {

    const resume =
        document.getElementById(
            "resumeButton"
        );


    if (resume) {

        resume.addEventListener(
            "click",
            () => {

                GameState.paused =
                    false;

                document
                    .getElementById(
                        "pauseMenu"
                    )
                    ?.classList.add(
                        "hidden"
                    );

            }
        );

    }


    const mapButton =
        document.getElementById(
            "pauseMapButton"
        );


    if (mapButton) {

        mapButton.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "fullMap"
                    )
                    ?.classList.remove(
                        "hidden"
                    );

            }
        );

    }

}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    createWorld();

    createPlayer();


    GameState.running =
        true;


    GameState.paused =
        false;


    document
        .getElementById(
            "loadingScreen"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "hud"
        )
        ?.classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "touchControls"
        )
        ?.classList.remove(
            "hidden"
        );


    setupButtons();

}


// ============================================================
// LOADING
// ============================================================

function loadingSequence() {

    const progress =
        document.getElementById(
            "loadingProgress"
        );


    const status =
        document.getElementById(
            "loadingStatus"
        );


    let value = 0;


    const interval =
        setInterval(
            () => {

                value += 5;


                if (progress) {

                    progress.style.width =
                        `${value}%`;

                }


                if (status) {

                    if (
                        value < 20
                    ) {

                        status.textContent =
                            "INITIALIZING 3D ENGINE...";

                    }

                    else if (
                        value < 40
                    ) {

                        status.textContent =
                            "CREATING TERRAIN...";

                    }

                    else if (
                        value < 60
                    ) {

                        status.textContent =
                            "BUILDING CITY...";

                    }

                    else if (
                        value < 80
                    ) {

                        status.textContent =
                            "ADDING WORLD DETAILS...";

                    }

                    else if (
                        value < 100
                    ) {

                        status.textContent =
                            "INITIALIZING PLAYER...";

                    }

                    else {

                        status.textContent =
                            "CITY READY";

                    }

                }


                if (
                    value >= 100
                ) {

                    clearInterval(
                        interval
                    );


                    setTimeout(
                        startGame,
                        300
                    );

                }

            },

            60
        );

}


// ============================================================
// INITIALIZATION
// ============================================================

loadingSequence();

gameLoop();


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.CityLegends =
    {

        GameState,

        PlayerState,

        renderer,

        scene,

        camera,

        startGame,

        togglePause

    };
