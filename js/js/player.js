// ============================================================
// CITY LEGENDS — PLAYER SYSTEM
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// PLAYER CONFIGURATION
// ============================================================

export const PlayerConfig = {

    walkSpeed: 5,
    runSpeed: 10,

    acceleration: 30,
    deceleration: 25,

    jumpForce: 9,

    gravity: 24,

    rotationSpeed: 10,

    maxHealth: 100,
    maxStamina: 100

};


// ============================================================
// PLAYER STATE
// ============================================================

export const PlayerState = {

    health: 100,
    stamina: 100,
    armor: 0,

    isGrounded: true,
    isRunning: false,
    isJumping: false,

    velocity: new THREE.Vector3(),

    direction: new THREE.Vector3(),

    position: new THREE.Vector3(),

    rotation: 0

};


// ============================================================
// PLAYER CONTROLLER
// ============================================================

export class PlayerController {

    constructor(object, camera) {

        this.object = object;

        this.camera = camera;

        this.keys = {};

        this.velocity =
            new THREE.Vector3();

        this.moveDirection =
            new THREE.Vector3();

        this.cameraDirection =
            new THREE.Vector3();

        this.lastPosition =
            object.position.clone();

        this.distanceTravelled = 0;

        this.setupKeyboard();

    }


    // ========================================================
    // KEYBOARD
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                this.keys[
                    event.code
                ] = true;


                if (
                    event.code ===
                    "Space"
                ) {

                    this.jump();

                }

            }
        );


        window.addEventListener(
            "keyup",
            event => {

                this.keys[
                    event.code
                ] = false;

            }
        );

    }


    // ========================================================
    // MOVEMENT INPUT
    // ========================================================

    getInput() {

        let x = 0;
        let z = 0;


        if (
            this.keys.KeyA ||
            this.keys.ArrowLeft
        ) {

            x -= 1;

        }


        if (
            this.keys.KeyD ||
            this.keys.ArrowRight
        ) {

            x += 1;

        }


        if (
            this.keys.KeyW ||
            this.keys.ArrowUp
        ) {

            z -= 1;

        }


        if (
            this.keys.KeyS ||
            this.keys.ArrowDown
        ) {

            z += 1;

        }


        this.moveDirection.set(
            x,
            0,
            z
        );


        if (
            this.moveDirection.lengthSq()
            > 0
        ) {

            this.moveDirection
                .normalize();

        }

    }


    // ========================================================
    // CAMERA-RELATIVE MOVEMENT
    // ========================================================

    calculateDirection() {

        if (
            this.moveDirection.lengthSq()
            === 0
        ) {

            return;

        }


        this.camera.getWorldDirection(
            this.cameraDirection
        );


        this.cameraDirection.y =
            0;

        this.cameraDirection.normalize();


        const forward =
            this.cameraDirection.clone();


        const right =
            new THREE.Vector3(
                forward.z,
                0,
                -forward.x
            );


        const movement =
            new THREE.Vector3();


        movement.addScaledVector(
            right,
            this.moveDirection.x
        );


        movement.addScaledVector(
            forward,
            -this.moveDirection.z
        );


        if (
            movement.lengthSq() > 0
        ) {

            movement.normalize();

        }


        this.moveDirection.copy(
            movement
        );

    }


    // ========================================================
    // JUMP
    // ========================================================

    jump() {

        if (
            !PlayerState.isGrounded
        ) {

            return;

        }


        PlayerState.velocity.y =
            PlayerConfig.jumpForce;


        PlayerState.isGrounded =
            false;

        PlayerState.isJumping =
            true;

    }


    // ========================================================
    // MOVEMENT
    // ========================================================

    updateMovement(delta) {

        const hasInput =
            this.moveDirection.lengthSq()
            > 0;


        const running =
            (
                this.keys.ShiftLeft ||
                this.keys.ShiftRight
            ) &&
            PlayerState.stamina > 0 &&
            hasInput;


        PlayerState.isRunning =
            running;


        const targetSpeed =
            running

                ? PlayerConfig.runSpeed

                : PlayerConfig.walkSpeed;


        if (hasInput) {

            const targetVelocity =
                this.moveDirection
                    .clone()
                    .multiplyScalar(
                        targetSpeed
                    );


            this.velocity.x =
                THREE.MathUtils.damp(
                    this.velocity.x,
                    targetVelocity.x,
                    PlayerConfig.acceleration,
                    delta
                );


            this.velocity.z =
                THREE.MathUtils.damp(
                    this.velocity.z,
                    targetVelocity.z,
                    PlayerConfig.acceleration,
                    delta
                );

        }

        else {

            this.velocity.x =
                THREE.MathUtils.damp(
                    this.velocity.x,
                    0,
                    PlayerConfig.deceleration,
                    delta
                );


            this.velocity.z =
                THREE.MathUtils.damp(
                    this.velocity.z,
                    0,
                    PlayerConfig.deceleration,
                    delta
                );

        }

    }


    // ========================================================
    // STAMINA
    // ========================================================

    updateStamina(delta) {

        if (
            PlayerState.isRunning
        ) {

            PlayerState.stamina -=
                25 * delta;

        }

        else {

            PlayerState.stamina +=
                15 * delta;

        }


        PlayerState.stamina =
            THREE.MathUtils.clamp(
                PlayerState.stamina,
                0,
                PlayerConfig.maxStamina
            );

    }


    // ========================================================
    // GRAVITY
    // ========================================================

    updateGravity(delta) {

        if (
            PlayerState.isGrounded
        ) {

            return;

        }


        PlayerState.velocity.y -=
            PlayerConfig.gravity *
            delta;


        this.object.position.y +=
            PlayerState.velocity.y *
            delta;


        const groundHeight = 1.8;


        if (
            this.object.position.y
            <= groundHeight
        ) {

            this.object.position.y =
                groundHeight;


            PlayerState.velocity.y =
                0;


            PlayerState.isGrounded =
                true;

            PlayerState.isJumping =
                false;

        }

    }


    // ========================================================
    // ROTATION
    // ========================================================

    updateRotation(delta) {

        const horizontalSpeed =
            Math.sqrt(
                this.velocity.x *
                this.velocity.x +

                this.velocity.z *
                this.velocity.z
            );


        if (
            horizontalSpeed < 0.1
        ) {

            return;

        }


        const targetRotation =
            Math.atan2(
                this.velocity.x,
                this.velocity.z
            );


        let difference =
            targetRotation -
            this.object.rotation.y;


        difference =
            Math.atan2(
                Math.sin(difference),
                Math.cos(difference)
            );


        this.object.rotation.y +=
            difference *
            Math.min(
                1,
                PlayerConfig.rotationSpeed *
                delta
            );

    }


    // ========================================================
    // DISTANCE
    // ========================================================

    updateDistance() {

        const current =
            this.object.position;


        const distance =
            current.distanceTo(
                this.lastPosition
            );


        this.distanceTravelled +=
            distance;


        this.lastPosition.copy(
            current
        );

    }


    // ========================================================
    // MAIN UPDATE
    // ========================================================

    update(delta) {

        this.getInput();

        this.calculateDirection();

        this.updateMovement(
            delta
        );

        this.updateStamina(
            delta
        );

        this.updateGravity(
            delta
        );


        this.object.position.x +=
            this.velocity.x *
            delta;


        this.object.position.z +=
            this.velocity.z *
            delta;


        this.updateRotation(
            delta
        );


        this.updateDistance();

    }


    // ========================================================
    // DAMAGE
    // ========================================================

    damage(amount) {

        let remaining =
            amount;


        if (
            PlayerState.armor > 0
        ) {

            const armorDamage =
                Math.min(
                    PlayerState.armor,
                    remaining
                );


            PlayerState.armor -=
                armorDamage;


            remaining -=
                armorDamage;

        }


        PlayerState.health -=
            remaining;


        PlayerState.health =
            Math.max(
                0,
                PlayerState.health
            );


        this.updateHUD();

    }


    // ========================================================
    // HEAL
    // ========================================================

    heal(amount) {

        PlayerState.health +=
            amount;


        PlayerState.health =
            Math.min(
                PlayerConfig.maxHealth,
                PlayerState.health
            );


        this.updateHUD();

    }


    // ========================================================
    // ARMOR
    // ========================================================

    setArmor(amount) {

        PlayerState.armor =
            THREE.MathUtils.clamp(
                amount,
                0,
                100
            );


        this.updateHUD();

    }


    // ========================================================
    // HUD
    // ========================================================

    updateHUD() {

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


        const healthBar =
            document.getElementById(
                "healthBar"
            );

        const staminaBar =
            document.getElementById(
                "staminaBar"
            );

        const armorBar =
            document.getElementById(
                "armorBar"
            );


        if (healthBar) {

            healthBar.style.width =
                `${PlayerState.health}%`;

        }


        if (staminaBar) {

            staminaBar.style.width =
                `${PlayerState.stamina}%`;

        }


        if (armorBar) {

            armorBar.style.width =
                `${PlayerState.armor}%`;

        }

    }

}
