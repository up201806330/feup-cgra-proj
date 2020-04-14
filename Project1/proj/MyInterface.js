/**
* MyInterface
* @constructor
*/
class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);
        // init GUI. For more information on the methods, check:
        // http://workshop.chromeexperiments.com/examples/gui
        this.gui = new dat.GUI();
        
        var obj = this;

        // Checkbox element in GUI
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');

        // Checkbox element in GUI for Sphere Displaying
        this.gui.add(this.scene, 'displaySphere').name('Display Sphere');

        // Checkbox element in GUI for Cylinder Displaying
        this.gui.add(this.scene, 'displayCylinder').name('Display Cylinder');

        this.gui.add(this.scene, 'displayCubeMap').name('Display Cube Map');

        // Slider element in GUI for number of sides of cylinder
        this.gui.add(this.scene, 'numberOfSides', 4, 12, 1).name('Number of sides').onChange(this.scene.updateNumberSides.bind(this.scene));

        // Checkox element in GUI to toggle normals' display
        this.gui.add(this.scene, 'displayNormals').name("Display normals");

        // Dropdown for textures
        // this.gui.add(this.scene, 'selectedTexture', this.scene.textureIds).name('Selected Texture').onChange(this.scene.updateAppliedTexture.bind(this.scene));

        // Slider element in GUI for the vehicle's scaleFactor
        this.gui.add(this.scene, 'scaleFactor', 0.5, 3).name('Scale Factor');

        return true;
    }
}