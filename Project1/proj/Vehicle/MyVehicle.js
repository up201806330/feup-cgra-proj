const ROTATION_PERIOD = 5000.0;

/**
 * MyVehicle
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyVehicle extends CGFobject {
    constructor(scene) {
		super(scene);
        
        this.triangleFig = new MyTriangle(this.scene);

        this.mainBody = new MySphere(this.scene, 24, 12);
        // this.bottomBody = new MySphere(this.scene, 16, 8);
        this.bottomBody = new MyCylinderClosed(this.scene, 16, 8);
        this.steering = new MyTrapeze(this.scene);
        this.steeringVert = new MyTrapeze(this.scene);
        this.propeller = new MyUnitCube(this.scene);
        this.flag = new MyFlag(this.scene);

        this.maxAnglePropeller = 20;
        this.rotationAngleIncCap = 1.2;


        this.vertWingRotation = 0;
        this.rotD = 0; // clock
        this.rotA = 0; // counter clock

        this.prevUpdate = 0;

        this.horizAngle = 0;
        this.speed = 0;
        this.propellerRotationAngle = 0;
        this.rotationAngleIncrement = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.reset();

        this.initMaterials();
        this.initShaders();
    }

    initMaterials(){

        this.materialBody = new CGFappearance(this.scene);
        this.materialBody.setAmbient(0.1, 0.1, 0.1, 1);
        this.materialBody.setDiffuse(0.9, 0.9, 0.9, 1);
        this.materialBody.setSpecular(0.1, 0.1, 0.1, 1);
        this.materialBody.setShininess(10.0);
        this.materialBody.loadTexture('images/blimp/body.png');
        this.materialBody.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

        this.materialWing = new CGFappearance(this.scene);
        this.materialWing.setAmbient(0.1, 0.1, 0.1, 1);
        this.materialWing.setDiffuse(0.9, 0.9, 0.9, 1);
        this.materialWing.setSpecular(0.1, 0.1, 0.1, 1);
        this.materialWing.setShininess(10.0);
        this.materialWing.loadTexture('images/blimp/wing.png');
        this.materialWing.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

        this.materialCabin = new CGFappearance(this.scene);
        this.materialCabin.setAmbient(0.1, 0.1, 0.1, 1);
        this.materialCabin.setDiffuse(0.9, 0.9, 0.9, 1);
        this.materialCabin.setSpecular(0.1, 0.1, 0.1, 1);
        this.materialCabin.setShininess(10.0);
        this.materialCabin.loadTexture('images/blimp/cabin.jpg');
        this.materialCabin.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

    }

    initShaders() {
        // Flag Sides' Shaders
        this.flagSide1 = new CGFshader(this.scene.gl, "shaders/flagSide1.vert", "shaders/flag.frag");
        this.flagSide1.setUniformsValues({ uSampler: 1 });
        this.flagSide1.setUniformsValues({ timeFactor: 0 });
        this.flagSide1.setUniformsValues({ speed: 0 });

        this.flagSide2 = new CGFshader(this.scene.gl, "shaders/flagSide2.vert", "shaders/flag.frag");
        this.flagSide2.setUniformsValues({ uSampler: 1 });
        this.flagSide2.setUniformsValues({ timeFactor: 0 });
        this.flagSide2.setUniformsValues({ speed: 0 });
    }

    display() {
        
        // Main Body (bigger section)
        // this.scene.translate(0, 10, 0);
        this.scene.pushMatrix();
        this.scene.scale(0.5, 0.5, 1);
        this.materialBody.apply();
        this.mainBody.display();
        this.scene.popMatrix();

        // Cabin
        this.scene.pushMatrix();
        this.scene.scale(0.2, 0.2, 0.4);
        this.scene.translate(0, -3, 0);
        this.materialCabin.apply();
        this.bottomBody.display();
        this.scene.popMatrix();

        // Left Propeller
        this.scene.pushMatrix();
        this.scene.scale(0.04, 0.04, 0.11);
        this.scene.translate(4.5, -13, -2.8);
        this.mainBody.display();
        this.scene.popMatrix();

        // Right Propeller
        this.scene.pushMatrix();
        this.scene.scale(0.04, 0.04, 0.11);
        this.scene.translate(-4.5, -13, -2.8);
        this.mainBody.display();
        this.scene.popMatrix();
        
        // Left Wing
        this.scene.pushMatrix();
        this.scene.scale(0.3, 0.3, 0.3);
        this.scene.translate(0.8, 0, -4);
        this.scene.rotate(-90 * Math.PI / 180, 1, 0, 0);
        this.scene.rotate(90 * Math.PI / 180, 0, 0, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.materialWing.apply();
        this.steering.display();
        this.scene.popMatrix();

        // Right Wing
        this.scene.pushMatrix();
        this.scene.scale(0.3, 0.3, 0.3);
        this.scene.translate(-0.8, 0, -4);
        this.scene.rotate(Math.PI, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.steering.display();
        this.scene.popMatrix();

        // Bottom Wing
        this.scene.pushMatrix();
        this.scene.translate(0, -0.15, -0.65);
        this.scene.rotate(-90*Math.PI / 180, 0, 1, 0);
        if (this.rotD != 0) { this.vertWingRotation = (Math.abs(this.vertWingRotation + this.rotD) > this.maxAnglePropeller) ? -this.maxAnglePropeller : this.vertWingRotation + this.rotD; }
        else if (this.rotA != 0) { this.vertWingRotation = (this.vertWingRotation + this.rotA > this.maxAnglePropeller) ? this.maxAnglePropeller : this.vertWingRotation + this.rotA; }
        this.scene.rotate( -this.vertWingRotation * Math.PI / 180, 0, 1, 0);
        this.scene.scale(0.3, 0.3, -0.3);
        this.scene.translate(-2, 0, 0);
        this.steeringVert.display();
        this.scene.popMatrix();

        // Top Wing
        this.scene.pushMatrix();
        this.scene.translate(0, 0.15, -0.65);
        this.scene.rotate(-90*Math.PI / 180, 0, 1, 0);
        if (this.rotD != 0) { this.vertWingRotation = (Math.abs(this.vertWingRotation + this.rotD) > this.maxAnglePropeller) ? -this.maxAnglePropeller : this.vertWingRotation + this.rotD; }
        else if (this.rotA != 0) { this.vertWingRotation = (this.vertWingRotation + this.rotA > this.maxAnglePropeller) ? this.maxAnglePropeller : this.vertWingRotation + this.rotA; }
        this.scene.rotate( -this.vertWingRotation * Math.PI / 180, 0, 1, 0);
        this.scene.scale(0.3, -0.3, -0.3);
        this.scene.translate(-2, 0, 0);
        this.steeringVert.display();
        this.scene.popMatrix();

        // Left Propeller
        this.scene.pushMatrix();
        this.scene.translate(0.17, -0.52, -0.42);
        this.scene.rotate(this.propellerRotationAngle * 1.1, 0, 0, 1);
        this.scene.scale(0.02, 0.12, 0.008);
        this.propeller.display();
        this.scene.popMatrix();

        // Right Propeller
        this.scene.pushMatrix();
        this.scene.translate(-0.17, -0.52, -0.42);
        this.scene.rotate(this.propellerRotationAngle * 1.1, 0, 0, 1);
        this.scene.scale(0.02, 0.12, 0.008);
        this.propeller.display();
        this.scene.popMatrix();
        
        // Flag
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -1.8);
        this.flag.display();
        this.scene.popMatrix();
        

        this.rotD = 0; this.rotA = 0; // reseting "deltas"
    }

    update(t) {

        if (this.prevUpdate == 0) {
            this.prevUpdate = t;
        }
        var elapsed = t - this.prevUpdate;
        this.prevUpdate = t;

        // console.log("Elapsed: " + elapsed);

        this.signSpeed = this.speed > 0 ? 0 : 1;
        this.rotationAngleIncrement = (-1)**(this.signSpeed) * ((Math.abs(60 * this.speed * Math.PI / 180) < this.rotationAngleIncCap) ? Math.abs(60 * this.speed * Math.PI / 180) : this.rotationAngleIncCap);
        this.propellerRotationAngle += this.rotationAngleIncrement;

        // console.log("Speed :" + this.speed);
        // console.log("RotAngInc :" + this.rotationAngleIncrement);
        // console.log("Angle :" + this.propellerRotationAngle);

        if (this.scene.onAutoPilot) {
            this.turn(360 * elapsed / ROTATION_PERIOD);
            this.x = -5 * Math.cos(this.horizAngle * Math.PI / 180) + this.xCenter;
            this.z = +5 * Math.sin(this.horizAngle * Math.PI / 180) + this.zCenter;
        }
        else if (this.scene.vehicleCanMove) {
            this.x += this.speed * Math.sin(this.horizAngle * Math.PI / 180);
            this.z += this.speed * Math.cos(this.horizAngle * Math.PI / 180);
        }

        if (this.vertWingRotation != 0 && this.rotD == 0 && this.rotA == 0) {
            this.vertWingRotation = (this.vertWingRotation > 0) ? this.vertWingRotation-1 : this.vertWingRotation+1;
        }

        // console.log("Speed: " + this.speed);
        // console.log("Time: " + elapsed);
        this.flag.update(t / 1000 % 1000, this.speed);
        
    }

    turn(val) {
        if (val > 0) {
            this.rotA = val;
            this.rotD = 0;
        }
        else if (val < 0) {
            this.rotA = 0;
            this.rotD = val;
        }
        else {
            this.rotA = 0;
            this.rotD = 0;
        }
        this.horizAngle += val;
    }

    accelerate(val) { this.speed += val * 0.01; }

    reset() {
        this.horizAngle = 0;
        this.speed = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.propellerRotationAngle = 0;
        this.rotD = 0;
        this.rotA = 0;
        this.vertWingRotation = 0;

        this.autoPilot();
    }

    autoPilot() {
        var startAngle = (this.horizAngle + 90) * Math.PI / 180;
        this.xCenter = this.x + 5 * Math.sin(startAngle);
        this.zCenter = this.z + 5 * Math.cos(startAngle);
    }

}