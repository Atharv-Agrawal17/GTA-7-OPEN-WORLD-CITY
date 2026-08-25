// ============================================================
// CITY LEGENDS — WORLD SYSTEM
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// WORLD CONFIGURATION
// ============================================================

export const WorldConfig = {

    size: 4000,

    roadSpacing: 120,

    roadWidth: 28,

    cityRadius: 1300,

    maxBuildings: 700,

    maxTrees: 350,

    maxStreetLights: 500

};


// ============================================================
// WORLD STATE
// ============================================================

export const WorldState = {

    buildings: [],

    roads: [],

    trees: [],

    streetLights: [],

    parks: [],

    landmarks: [],

    props: [],

    intersections: []

};


// ============================================================
// MATERIAL CACHE
// ============================================================

const materials = {};


function getMaterial(
    name,
    color,
    roughness = 0.8,
    metalness = 0
) {

    if (materials[name]) {

        return materials[name];

    }


    materials[name] =
        new THREE.MeshStandardMaterial({

            color,

            roughness,

            metalness

        });


    return materials[name];

}


// ============================================================
// WORLD CLASS
// ============================================================

export class World {

    constructor(scene) {

        this.scene = scene;

        this.cityGroup =
            new THREE.Group();

        this.roadGroup =
            new THREE.Group();

        this.buildingGroup =
            new THREE.Group();

        this.propGroup =
            new THREE.Group();

        this.treeGroup =
            new THREE.Group();

        this.lightGroup =
            new THREE.Group();


        this.cityGroup.add(
            this.roadGroup
        );

        this.cityGroup.add(
            this.buildingGroup
        );

        this.cityGroup.add(
            this.propGroup
        );

        this.cityGroup.add(
            this.treeGroup
        );

        this.cityGroup.add(
            this.lightGroup
        );


        this.scene.add(
            this.cityGroup
        );

    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    generate() {

        this.createGround();

        this.generateRoadNetwork();

        this.generateBuildings();

        this.generateParks();

        this.generateTrees();

        this.generateStreetLights();

        this.generateRoadDetails();

        this.generateLandmarks();

        this.generateIntersections();

        return this;

    }


    // ========================================================
    // GROUND
    // ========================================================

    createGround() {

        const geometry =
            new THREE.PlaneGeometry(
                WorldConfig.size,
                WorldConfig.size
            );


        const ground =
            new THREE.Mesh(

                geometry,

                getMaterial(
                    "ground",
                    0x3f7544,
                    1
                )

            );


        ground.rotation.x =
            -Math.PI / 2;


        ground.receiveShadow =
            true;


        this.cityGroup.add(
            ground
        );


        WorldState.props.push(
            ground
        );

    }


    // ========================================================
    // ROAD NETWORK
    // ========================================================

    generateRoadNetwork() {

        const half =
            WorldConfig.cityRadius;


        const spacing =
            WorldConfig.roadSpacing;


        for (
            let x = -half;
            x <= half;
            x += spacing
        ) {

            this.createRoad(
                x,
                0,
                WorldConfig.size,
                WorldConfig.roadWidth,
                "vertical"
            );

        }


        for (
            let z = -half;
            z <= half;
            z += spacing
        ) {

            this.createRoad(
                0,
                z,
                WorldConfig.size,
                WorldConfig.roadWidth,
                "horizontal"
            );

        }

    }


    // ========================================================
    // ROAD
    // ========================================================

    createRoad(
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


        const road =
            new THREE.Mesh(

                geometry,

                getMaterial(
                    "road",
                    0x202326,
                    0.95
                )

            );


        road.rotation.x =
            -Math.PI / 2;


        road.position.set(
            x,
            0.025,
            z
        );


        road.receiveShadow =
            true;


        this.roadGroup.add(
            road
        );


        WorldState.roads.push(
            road
        );

    }


    // ========================================================
    // BUILDINGS
    // ========================================================

    generateBuildings() {

        const spacing =
            WorldConfig.roadSpacing;


        const half =
            WorldConfig.cityRadius;


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
                    this.isParkLocation(
                        x,
                        z
                    )
                ) {

                    continue;

                }


                this.createBuildingBlock(
                    x,
                    z
                );

            }

        }

    }


    // ========================================================
    // BUILDING BLOCK
    // ========================================================

    createBuildingBlock(
        x,
        z
    ) {

        const count =
            2 +
            Math.floor(
                Math.random() * 5
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            if (
                WorldState.buildings.length
                >=
                WorldConfig.maxBuildings
            ) {

                return;

            }


            const width =
                20 +
                Math.random() * 35;


            const depth =
                20 +
                Math.random() * 35;


            let height;


            const zone =
                this.getDistrict(
                    x,
                    z
                );


            if (
                zone === "DOWNTOWN"
            ) {

                height =
                    70 +
                    Math.random() *
                    180;

            }

            else if (
                zone === "INDUSTRIAL"
            ) {

                height =
                    15 +
                    Math.random() *
                    35;

            }

            else {

                height =
                    20 +
                    Math.random() *
                    100;

            }


            const geometry =
                new THREE.BoxGeometry(

                    width,
                    height,
                    depth

                );


            const colors = [

                0x73777a,
                0x88817a,
                0x6a7075,
                0x9a8977,
                0x5d646a,
                0x77736d,
                0x8b8b83

            ];


            const color =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];


            const building =
                new THREE.Mesh(

                    geometry,

                    getMaterial(
                        `building-${color}`,
                        color,
                        0.75
                    )

                );


            building.position.set(

                x +
                (Math.random() - 0.5) *
                70,

                height / 2,

                z +
                (Math.random() - 0.5) *
                70

            );


            building.castShadow =
                true;


            building.receiveShadow =
                true;


            this.buildingGroup.add(
                building
            );


            WorldState.buildings.push(
                building
            );


            this.addWindows(
                building,
                width,
                height,
                depth
            );

        }

    }


    // ========================================================
    // WINDOWS
    // ========================================================

    addWindows(
        building,
        width,
        height,
        depth
    ) {

        if (
            height < 25
        ) {

            return;

        }


        const windowMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x8bbbd4
            });


        const floors =
            Math.min(
                12,
                Math.floor(
                    height / 8
                )
            );


        const columns =
            Math.min(
                5,
                Math.floor(
                    width / 7
                )
            );


        for (
            let floor = 0;
            floor < floors;
            floor++
        ) {

            for (
                let column = 0;
                column < columns;
                column++
            ) {

                const windowGeometry =
                    new THREE.PlaneGeometry(
                        2.5,
                        3
                    );


                const window =
                    new THREE.Mesh(
                        windowGeometry,
                        windowMaterial
                    );


                const offsetX =
                    (
                        column -
                        (columns - 1) / 2
                    ) * 6;


                const offsetY =
                    floor * 7 +
                    5;


                window.position.set(

                    building.position.x +
                    offsetX,

                    offsetY,

                    building.position.z -
                    depth / 2 -
                    0.03

                );


                this.propGroup.add(
                    window
                );

            }

        }

    }


    // ========================================================
    // PARKS
    // ========================================================

    generateParks() {

        const parks = [

            [-600, -600],
            [600, -600],
            [-600, 600],
            [600, 600],
            [0, -600],
            [0, 600],
            [-600, 0],
            [600, 0]

        ];


        for (
            const [x, z]
            of parks
        ) {

            this.createPark(
                x,
                z
            );

        }

    }


    createPark(
        x,
        z
    ) {

        const geometry =
            new THREE.BoxGeometry(
                75,
                0.5,
                75
            );


        const park =
            new THREE.Mesh(

                geometry,

                getMaterial(
                    "park",
                    0x438048,
                    1
                )

            );


        park.position.set(
            x,
            0.25,
            z
        );


        park.receiveShadow =
            true;


        this.propGroup.add(
            park
        );


        WorldState.parks.push(
            park
        );


        for (
            let i = 0;
            i < 18;
            i++
        ) {

            this.createTree(

                x +
                (Math.random() - 0.5) *
                60,

                z +
                (Math.random() - 0.5) *
                60

            );

        }

    }


    // ========================================================
    // TREES
    // ========================================================

    generateTrees() {

        for (
            let i = 0;
            i < WorldConfig.maxTrees;
            i++
        ) {

            const x =
                (
                    Math.random() -
                    0.5
                ) *
                2600;


            const z =
                (
                    Math.random() -
                    0.5
                ) *
                2600;


            if (
                this.isNearRoad(
                    x,
                    z
                )
            ) {

                continue;

            }


            this.createTree(
                x,
                z
            );

        }

    }


    createTree(
        x,
        z
    ) {

        const trunk =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.5,
                    0.7,
                    5,
                    8
                ),

                getMaterial(
                    "tree-trunk",
                    0x62452f
                )

            );


        trunk.position.set(
            x,
            2.5,
            z
        );


        trunk.castShadow =
            true;


        this.treeGroup.add(
            trunk
        );


        const crown =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    3,
                    10,
                    8
                ),

                getMaterial(
                    "tree-leaves",
                    0x2f7138
                )

            );


        crown.position.set(
            x,
            6,
            z
        );


        crown.castShadow =
            true;


        this.treeGroup.add(
            crown
        );


        WorldState.trees.push(
            {
                trunk,
                crown
            }
        );

    }


    // ========================================================
    // STREET LIGHTS
    // ========================================================

    generateStreetLights() {

        const half =
            WorldConfig.cityRadius;


        const spacing =
            WorldConfig.roadSpacing;


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

                this.createStreetLight(
                    x + 18,
                    z + 18
                );


                this.createStreetLight(
                    x - 18,
                    z - 18
                );

            }

        }

    }


    createStreetLight(
        x,
        z
    ) {

        if (
            WorldState.streetLights.length
            >=
            WorldConfig.maxStreetLights
        ) {

            return;

        }


        const pole =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.13,
                    0.2,
                    7,
                    8
                ),

                getMaterial(
                    "lamp-pole",
                    0x303030,
                    0.5,
                    0.2
                )

            );


        pole.position.set(
            x,
            3.5,
            z
        );


        pole.castShadow =
            true;


        this.lightGroup.add(
            pole
        );


        const lamp =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.35,
                    8,
                    8
                ),

                new THREE.MeshStandardMaterial({

                    color: 0xffe5a0,

                    emissive: 0xffaa33,

                    emissiveIntensity: 1

                })

            );


        lamp.position.set(
            x,
            7,
            z
        );


        this.lightGroup.add(
            lamp
        );


        WorldState.streetLights.push(
            {
                pole,
                lamp
            }
        );

    }


    // ========================================================
    // ROAD DETAILS
    // ========================================================

    generateRoadDetails() {

        const half =
            WorldConfig.cityRadius;


        const spacing =
            WorldConfig.roadSpacing;


        for (
            let x = -half;
            x <= half;
            x += spacing
        ) {

            for (
                let z = -half;
                z <= half;
                z += 35
            ) {

                this.createLaneMarking(
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
                x += 35
            ) {

                this.createLaneMarking(
                    x,
                    z,
                    true
                );

            }

        }

    }


    createLaneMarking(
        x,
        z,
        horizontal
    ) {

        const geometry =

            horizontal

                ? new THREE.PlaneGeometry(
                    5,
                    0.3
                )

                : new THREE.PlaneGeometry(
                    0.3,
                    5
                );


        const marking =
            new THREE.Mesh(

                geometry,

                getMaterial(
                    "road-marking",
                    0xd7c74c
                )

            );


        marking.rotation.x =
            -Math.PI / 2;


        marking.position.set(
            x,
            0.055,
            z
        );


        this.roadGroup.add(
            marking
        );

    }


    // ========================================================
    // LANDMARKS
    // ========================================================

    generateLandmarks() {

        this.createTower(
            0,
            -300
        );


        this.createPlaza(
            300,
            300
        );


        this.createStadium(
            -500,
            300
        );

    }


    // ========================================================
    // TOWER
    // ========================================================

    createTower(
        x,
        z
    ) {

        const tower =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    25,
                    40,
                    260,
                    32
                ),

                getMaterial(
                    "landmark-tower",
                    0x536b78,
                    0.5,
                    0.2
                )

            );


        tower.position.set(
            x,
            130,
            z
        );


        tower.castShadow =
            true;


        this.buildingGroup.add(
            tower
        );


        WorldState.landmarks.push(
            tower
        );

    }


    // ========================================================
    // PLAZA
    // ========================================================

    createPlaza(
        x,
        z
    ) {

        const plaza =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    55,
                    55,
                    1,
                    32
                ),

                getMaterial(
                    "plaza",
                    0x858585,
                    0.7
                )

            );


        plaza.position.set(
            x,
            0.5,
            z
        );


        this.propGroup.add(
            plaza
        );


        WorldState.landmarks.push(
            plaza
        );

    }


    // ========================================================
    // STADIUM
    // ========================================================

    createStadium(
        x,
        z
    ) {

        const outer =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    75,
                    75,
                    15,
                    32,
                    1,
                    true
                ),

                getMaterial(
                    "stadium",
                    0x4c5963
                )

            );


        outer.position.set(
            x,
            7.5,
            z
        );


        outer.castShadow =
            true;


        this.buildingGroup.add(
            outer
        );


        const field =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    45,
                    45,
                    0.5,
                    32
                ),

                getMaterial(
                    "stadium-field",
                    0x3b803f
                )

            );


        field.position.set(
            x,
            0.5,
            z
        );


        this.propGroup.add(
            field
        );


        WorldState.landmarks.push(
            outer,
            field
        );

    }


    // ========================================================
    // INTERSECTIONS
    // ========================================================

    generateIntersections() {

        const spacing =
            WorldConfig.roadSpacing;


        const half =
            WorldConfig.cityRadius;


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

                WorldState.intersections.push(
                    {
                        x,
                        z
                    }
                );

            }

        }

    }


    // ========================================================
    // DISTRICTS
    // ========================================================

    getDistrict(
        x,
        z
    ) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );


        if (
            distance < 300
        ) {

            return "DOWNTOWN";

        }


        if (
            x > 500 &&
            z > 300
        ) {

            return "INDUSTRIAL";

        }


        if (
            x < -500 &&
            z < -300
        ) {

            return "SUBURBS";

        }


        return "MIDTOWN";

    }


    // ========================================================
    // PARK LOCATION CHECK
    // ========================================================

    isParkLocation(
        x,
        z
    ) {

        const parks = [

            [-600, -600],
            [600, -600],
            [-600, 600],
            [600, 600],
            [0, -600],
            [0, 600],
            [-600, 0],
            [600, 0]

        ];


        return parks.some(
            park =>

                Math.abs(
                    x - park[0]
                ) < 70 &&

                Math.abs(
                    z - park[1]
                ) < 70

        );

    }


    // ========================================================
    // ROAD CHECK
    // ========================================================

    isNearRoad(
        x,
        z
    ) {

        const spacing =
            WorldConfig.roadSpacing;


        const roadWidth =
            WorldConfig.roadWidth;


        const nearestX =
            Math.round(
                x / spacing
            ) *
            spacing;


        const nearestZ =
            Math.round(
                z / spacing
            ) *
            spacing;


        return (

            Math.abs(
                x - nearestX
            ) <
            roadWidth +

            5

            ||

            Math.abs(
                z - nearestZ
            ) <
            roadWidth +

            5

        );

    }


    // ========================================================
    // UPDATE
    // ========================================================

    update(
        delta,
        player
    ) {

        if (
            !player
        ) {

            return;

        }


        // Future systems:
        // traffic
        // pedestrians
        // weather
        // streaming
        // dynamic events

    }


    // ========================================================
    // GET NEAREST ROAD
    // ========================================================

    getNearestRoad(
        position
    ) {

        let closest = null;

        let closestDistance =
            Infinity;


        for (
            const road
            of WorldState.roads
        ) {

            const distance =
                road.position
                    .distanceTo(
                        position
                    );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closest =
                    road;

            }

        }


        return closest;

    }


    // ========================================================
    // GET WORLD DATA
    // ========================================================

    getData() {

        return {

            buildings:
                WorldState.buildings.length,

            roads:
                WorldState.roads.length,

            trees:
                WorldState.trees.length,

            streetLights:
                WorldState.streetLights.length,

            parks:
                WorldState.parks.length,

            landmarks:
                WorldState.landmarks.length,

            intersections:
                WorldState.intersections.length

        };

    }

}


// ============================================================
// FACTORY
// ============================================================

export function createWorld(
    scene
) {

    const world =
        new World(
            scene
        );


    world.generate();


    return world;

}
