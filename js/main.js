// ============================================================
// CITY LEGENDS
// MAIN GAME ENGINE
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


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

    time: 8 * 60,

    player: null,

    scene: null,
    camera: null,
    renderer: null,

    clock: new THREE.Clock(),

    objects: [],

    vehicle: null,

    currentMission: {
        title: "Explore the City",
        objective: "Explore the surrounding area."
    }

};


// ============================================================
// RENDERER
// ============================================================

const canvas =
    document.getElementById("gameCanvas");

const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance"
    });

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
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


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87b8e8);

GameState.scene = scene;


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
    8,
    14
);

GameState.camera = camera;


// ============================================================
// LIGHTING
// ============================================================

const ambientLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x445566,
        1.5
    );

scene.add(ambientLight);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.5
    );

sun.position.set(
    200,
    400,
    100
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -500;
sun.shadow.camera.right = 500;
sun.shadow.camera.top = 500;
sun.shadow.camera.bottom = -500;

scene.add(sun);


// ============================================================
// WORLD
// ============================================================

function createWorld() {

    // Ground

    const groundGeometry =
        new THREE.PlaneGeometry(
            4000,
            4000
        );

    const groundMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x3c6b3c,
            roughness: 1
        });

    const ground =
        new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);


    // Main roads

    createRoad(
        0,
        0,
        4000,
        30,
        "vertical"
    );

    createRoad(
        0,
        0,
        4000,
        30,
        "horizontal"
    );


    // City blocks

    for (
        let x = -600;
        x <= 600;
        x += 100
    ) {

        for (
            let z = -600;
            z <= 600;
            z += 100
        ) {

            if (
                Math.abs(x) < 50 ||
                Math.abs(z) < 50
            ) {
                continue;
            }

            createBuildingBlock(
                x,
                z
            );

        }

    }

}


// ============================================================
// ROAD CREATION
// ============================================================

function createRoad(
    x,
    z,
    length,
    width,
    direction
) {

    const geometry =
        direction === "horizontal"

            ? new THREE.PlaneGeometry(
                length,
                width
            )

            : new THREE.PlaneGeometry(
                width,
                length
            );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x202124,
            roughness: 0.9
        });


    const road =
        new THREE.Mesh(
            geometry,
            material
        );


    road.rotation.x =
        -Math.PI / 2;

    road.position.set(
        x,
        0.02,
        z
    );

    road.receiveShadow = true;

    scene.add(road);

    GameState.objects.push(road);

}


// ============================================================
// BUILDING BLOCK
// ============================================================

function createBuildingBlock(
    centerX,
    centerZ
) {

    const numberOfBuildings =
        3 +
        Math.floor(
            Math.random() * 5
        );


    for (
        let i = 0;
        i < numberOfBuildings;
        i++
    ) {

        const width =
            25 +
            Math.random() * 25;

        const depth =
            25 +
            Math.random() * 25;

        const height =
            20 +
            Math.random() * 100;


        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );


        const colorOptions = [
            0x777777,
            0x888888,
            0x996f55,
            0x666b73,
            0x927d68,
            0x50565c
        ];


        const material =
            new THREE.MeshStandardMaterial({
                color:
                    colorOptions[
                        Math.floor(
                            Math.random() *
                            colorOptions.length
                        )
                    ],
                roughness: 0.8
            });


        const building =
            new THREE.Mesh(
                geometry,
                material
            );


        building.position.set(

            centerX +
            (Math.random() - 0.5) * 65,

            height / 2,

            centerZ +
            (Math.random() - 0.5) * 65

        );


        building.castShadow = true;
        building.receiveShadow = true;


        scene.add(building);

        GameState.objects.push(
            building
        );

    }

}


// ============================================================
// PLAYER PLACEHOLDER
// ============================================================

function createPlayer() {

    const geometry =
        new THREE.CapsuleGeometry(
            0.7,
            1.8,
            8,
            16
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x3366aa
        });


    const player =
        new THREE.Mesh(
            geometry,
            material
        );


    player.position.set(
        0,
        2,
        10
    );


    player.castShadow = true;

    scene.add(player);

    GameState.player = player;

}


// ============================================================
// CAMERA FOLLOW
// ============================================================

function updateCamera() {

    if (!GameState.player) {
        return;
    }


    const target =
        GameState.player.position;


    const desiredPosition =
        new THREE.Vector3(
            target.x,
            target.y + 7,
            target.z + 12
        );


    camera.position.lerp(
        desiredPosition,
        0.08
    );


    camera.lookAt(
        target.x,
        target.y + 1,
        target.z
    );

}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

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


    if (health)
        health.textContent =
            Math.round(
                GameState.health
            );


    if (stamina)
        stamina.textContent =
            Math.round(
                GameState.stamina
            );


    if (armor)
        armor.textContent =
            Math.round(
                GameState.armor
            );


    if (money)
        money.textContent =
            GameState.money.toLocaleString();

}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    if (
        !GameState.running ||
        GameState.paused
    ) {
        return;
    }


    const delta =
        GameState.clock.getDelta();


    updatePlayer(
        delta
    );


    updateCamera();

    updateHUD();


    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// PLAYER MOVEMENT
// ============================================================

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[
            event.code
        ] = true;

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.code
        ] = false;

    }
);


function updatePlayer(
    delta
) {

    if (!GameState.player) {
        return;
    }


    const speed =
        keys.ShiftLeft ||
        keys.ShiftRight

            ? 12

            : 6;


    if (keys.KeyW) {

        GameState.player.position.z
            -= speed * delta;

    }


    if (keys.KeyS) {

        GameState.player.position.z
            += speed * delta;

    }


    if (keys.KeyA) {

        GameState.player.position.x
            -= speed * delta;

    }


    if (keys.KeyD) {

        GameState.player.position.x
            += speed * delta;

    }


    // Prevent falling below ground

    if (
        GameState.player.position.y
        < 1.8
    ) {

        GameState.player.position.y =
            1.8;

    }

}


// ============================================================
// WINDOW RESIZE
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
// START GAME
// ============================================================

function startGame() {

    createWorld();

    createPlayer();


    GameState.running =
        true;


    document
        .getElementById("loadingScreen")
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById("hud")
        ?.classList.remove(
            "hidden"
        );


    document
        .getElementById("touchControls")
        ?.classList.remove(
            "hidden"
        );

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

                value += 10;

                if (progress) {
                    progress.style.width =
                        `${value}%`;
                }


                if (status) {

                    if (value < 30)
                        status.textContent =
                            "LOADING ENGINE...";

                    else if (value < 60)
                        status.textContent =
                            "BUILDING CITY...";

                    else if (value < 90)
                        status.textContent =
                            "INITIALIZING PLAYER...";

                    else
                        status.textContent =
                            "READY";

                }


                if (value >= 100) {

                    clearInterval(
                        interval
                    );

                    startGame();

                }

            },

            100
        );

}


// ============================================================
// INITIALIZE
// ============================================================

loadingSequence();

gameLoop();
