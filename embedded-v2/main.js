$(document).on("click", "#pop-car-route-1", (event) => {
        
});

class Controller {

    constructor() {

    }

    start() {

    }
}

class Sensors {
    constructor() {
        this.idFunctionInterval = null;
        this.free = [true, true, true];
    }

    

}

class TrafficGround {
    constructor() {

    }

    start() {

    }
}

class TrafficLightGround {
    constructor() {

    }

    start() {

    }
}

class TrafficLightSky {
    constructor() {

    }

    start() {

    }
}

class System {
    constructor() {

        // initialization
        this.controller = new Controller();
        this.sensors = new Sensors();
        this.trafficGround = new TrafficGround();
        this.trafficLightGround = new TrafficLightGround();
        this.trafficLightSky = new TrafficLightSky();

        // start everything
        this.controller.start();
        this.trafficGround.start();
        this.trafficLightGround.start();
        this.trafficLightSky.start();

    }
}

System.frequency = 1000;