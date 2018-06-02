/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
let getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Cette classe représente un canal de communication.
 */
class Channel {

    /**
     * Construit un nouveau canal de communication avec un nom particulier
     * @param {string} name
     * @param {boolean} isBroadCast
     */
    constructor(name, isBroadCast) {
        this.nameChannel = name;
        this.isBoadcast = isBroadCast;
        this.listeners = [];
    }

    /**
     *
     * @param {Sensors|Controller|SkyTrafficLight|GroundTrafficLight} listener
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Send a message trough this channel. It will update all the listeners.
     * @param sender
     */
    sendMessage(sender) {
        if (this.isBoadcast) {
            sender.messageSent(this.nameChannel);
            this.listeners.forEach(listener => listener.receiveMessage(this.nameChannel));
        }
        else {
            sender.messageSent(this.nameChannel);

            let nonDeterministicListener = Math.floor(Math.random() * this.listeners.length);
            this.listeners[nonDeterministicListener].receiveMessage(this.nameChannel);
        }
    }
}

class Clock {
    constructor(name) {
        this.nameClock = name;
        this.value = 0;
    }
}
// Static variable period
Clock.period = 500;
// each time a transition is taken (or something happen),
// the clock increases by the value below
Clock.interval = 1;


class Controller {
    constructor(context) {
        this.context = context;
        this.currentState = "RRR";
        this.timer = new Clock("timer");
        this.delay = new Clock("delay");
    }

    doAction() {
        let possibleTransitions = [];
        switch(true) {
            case this.currentState === "RRR":
                if (this.context.x.value >= 30 &&
                    this.context.redSky === false &&
                    this.timer.value >= 5 &&
                    this.context.noGroundTraffic() === false &&
                    this.context.skyTrafficLight.canReceiveMessage("red_sky_tl"))
                {
                    possibleTransitions.push(() => {
                        this.context.redSkyTL.sendMessage(this);
                    });
                }

                if (this.context.noGroundTraffic())
                {
                    possibleTransitions.push(() => {
                        this.context.x.value = 0;
                        this.timer = 0;
                    });
                }

                if ((this.context.x.value <= 30 ||
                    this.context.redSky === true) &&
                    this.timer.value >= 5 &&
                    this.context.noGroundTraffic() === false &&
                    this.context.sensors.canReceiveMessage("consult"))
                {
                    possibleTransitions.push(() => {
                        this.context.consult.sendMessage(this);
                    });
                }
                try {
                    if (possibleTransitions.length > 0)
                        possibleTransitions[getRandomInt(0, possibleTransitions.length - 1)]();
                } catch(e) {
                    debugger;
                }

                break;
            case this.currentState === "Consulted":
                let fromConsultedToGRR =    this.context.trafficGr[0] > 0 &&
                                            this.context.free[0] &&
                                            this.context.turn === 0 &&
                                            (this.context.groundTrafficLights[0].canReceiveMessage("green_light_0") ||
                                                this.context.trafficGround.canReceiveMessage("green_light_0"));

                let fromConsultedToRGR =    this.context.trafficGr[1] > 0 &&
                                            this.context.free[1] &&
                                            this.context.turn === 1 &&
                                            (this.context.groundTrafficLights[1].canReceiveMessage("green_light_1") ||
                                                this.context.trafficGround.canReceiveMessage("green_light_1"));

                let fromConsultedToRRG =    this.context.trafficGr[2] > 0 &&
                                            this.context.free[2] &&
                                            this.context.turn === 2 &&
                                            (this.context.groundTrafficLights[2].canReceiveMessage("green_light_2") ||
                                                this.context.trafficGround.canReceiveMessage("green_light_2"));

                let fromConsultedToRRR =    this.context.launchPossible() === false &&
                                            this.timer.value >= 5;



                if (fromConsultedToRRG) {
                    possibleTransitions.push(() => {
                        this.context.greenLight[2].sendMessage(this);
                    });
                }

                if (fromConsultedToRGR) {
                    possibleTransitions.push(() => {
                        this.context.greenLight[1].sendMessage(this);
                    });
                }

                if (fromConsultedToGRR) {
                    possibleTransitions.push(() => {
                        this.context.greenLight[0].sendMessage(this);
                    });
                }

                if (fromConsultedToRRR) {
                    possibleTransitions.push(() => {
                        this.timer.value = 0;
                        this.currentState = "RRR";
                    });
                }
                if (possibleTransitions.length > 0)
                    possibleTransitions[getRandomInt(0, possibleTransitions.length - 1)]();
                break;
            default:
                throw "Current state undefined";
        }
    }

    messageSent(nameChannel) {
        if (this.currentState === "RRR") {
            if (nameChannel === "consult") {
                this.timer.value = 0;
                this.context.updateTurn();
                this.currentState = "Consulted";
            }
            else if (nameChannel === "red_sky_tl") {
                this.currentState = "RRR";
            }
            else
                throw "ehhhhh";
        }
        else if (this.currentState === "Consulted") {
            if (nameChannel === "green_light_0") {
                this.currentState = "GRR";
            }
            else if (nameChannel === "green_light_1") {
                this.currentState = "RGR";
            }
            else if (nameChannel === "green_light_2") {
                this.currentState = "RRG";
            }
        }
        else
            throw "Message envoyé mais je suis atteri dans un truc non géré";
    }

    receiveMessage(nameChannel) {
        if ((this.currentState === "GRR" && nameChannel === "red_light_0") ||
            (this.currentState === "RGR" && nameChannel === "red_light_1") ||
            (this.currentState === "RRG" && nameChannel === "red_light_2"))
        {
            this.context.x.value = 0;
            this.timer.value = 0;
            this.context.launched = true;
            this.currentState = "RRR";
        }
        else {
            throw "message received but not handlable ! (receiveMessage)";
        }
    }

    mustQuitCurrentStateNow() {
        return (this.currentState === "Consulted" && this.timer.value >= 5) ||
               (this.currentState === "RRR" && (this.context.x.value >= this.context.WAIT_TIME || this.timer >= 5));
    }

    canSendMessage() {
        let fromConsultedToGRR =    this.currentState === "Consulted" &&
                                    this.context.trafficGr[0] > 0 &&
                                    this.context.free[0] &&
                                    this.context.turn === 0 &&
                                    (this.context.groundTrafficLights[0].canReceiveMessage("green_light_0") ||
                                        this.context.trafficGround.canReceiveMessage("green_light_0"));

        let fromConsultedToRGR =    this.currentState === "Consulted" &&
                                    this.context.trafficGr[1] > 0 &&
                                    this.context.free[1] &&
                                    this.context.turn === 1 &&
                                    (this.context.groundTrafficLights[1].canReceiveMessage("green_light_1") ||
                                        this.context.trafficGround.canReceiveMessage("green_light_1"));

        let fromConsultedToRRG =    this.currentState === "Consulted" &&
                                    this.context.trafficGr[2] > 0 &&
                                    this.context.free[2] &&
                                    this.context.turn === 2 &&
                                    (this.context.groundTrafficLights[2].canReceiveMessage("green_light_2") ||
                                        this.context.trafficGround.canReceiveMessage("green_light_2"));

        let fromRRRToConsulted   =  this.currentState === "RRR" &&
                                    this.context.x.value <= 30 &&
                                    this.context.redSky === true &&
                                    this.timer.value >= 5 &&
                                    this.context.noGroundTraffic() === false &&
                                    this.context.sensors.canReceiveMessage("consult");

        let fromRRRToRRR      =     this.currentState === "RRR" &&
                                    this.context.x.value >= 30  &&
                                    this.context.redSky === false &&
                                    this.timer.value >= 5 &&
                                    this.context.noGroundTraffic() === false &&
                                    this.context.skyTrafficLight.canReceiveMessage("red_sky_tl");

        return fromConsultedToGRR || fromConsultedToRGR || fromConsultedToRRG ||fromRRRToRRR || fromRRRToConsulted;
    }

    canReceiveMessage(nameChannel) {
        let fromGRRToRRR = this.currentState === "GRR" && nameChannel === "red_light_0";
        let fromRGRToRRR = this.currentState === "RGR" && nameChannel === "red_light_1";
        let fromRRGToRRR = this.currentState === "RRG" && nameChannel === "red_light_2";
        return fromGRRToRRR || fromRGRToRRR || fromRRGToRRR;
    }

    /**
     *
     * @returns {boolean}
     */
    canMove() {
        return (this.currentState === "Consulted" && this.context.launchPossible() === false && this.timer.value >= 5)
            || (this.currentState === "RRR" && this.context.noGroundTraffic() === false);
    }
}

class Sensors {
    constructor(context) {
        this.context = context;
        this.currentState = "initialState";
    }

    doAction() {
        return false;
    }

    receiveMessage(nameChannel) {
        if (nameChannel === "consult") {
            if(this.context.redSky === false) {
                // this.context.free[0] = getRandomInt(0, 1); -- we get the states of the sensor from the gui
                // this.context.free[1] = getRandomInt(0, 1); -- we get the states of the sensor from the gui
                // this.context.free[2] = getRandomInt(0, 1); -- we get the states of the sensor from the gui
            }
            else {
                this.context.free[2] = this.context.free[1];
                this.context.free[1] = this.context.free[0];
                this.context.free[0] = 1;
            }
        } else {
            throw "receiveMessage error: Sensors does not listen to " + nameChannel;
        }
    }

    mustQuitCurrentStateNow() {
        return false;
    }

    canSendMessage() {
        return false;
    }

    canReceiveMessage(nameChannel) {
        return nameChannel === "consult";
    }

    canMove() {
        return false;
    }
}

class SkyTrafficLight {
    constructor(context) {
        this.context = context;
        this.timer = new Clock("timer");
        this.currentState = "Green";
    }

    doAction() { return false; }

    receiveMessage(nameChannel) {
        if (this.currentState === "Green" && nameChannel === "red_sky_tl") {
            this.context.redSky = true;
            this.timer.value = 0;
            this.currentState = "Red";
            document.dispatchEvent(new CustomEvent("sky-tl", {detail: "red"}));
        }
        else if (this.currentState === "Red" && nameChannel === "red_light_0") {
            this.context.redSky = false;
            this.currentState = "Green";
            document.dispatchEvent(new CustomEvent("sky-tl", {detail: "green"}));

        }
        else if (this.currentState === "Red" && nameChannel === "red_light_1") {
            this.context.redSky = false;
            this.currentState = "Green";
            document.dispatchEvent(new CustomEvent("sky-tl", {detail: "green"}));
        }
        else if (this.currentState === "Red" && nameChannel === "red_light_2") {
            this.context.redSky = false;
            this.currentState = "Green";
            document.dispatchEvent(new CustomEvent("sky-tl", {detail: "green"}));
        }
    }

    mustQuitCurrentStateNow() {
        return this.currentState === "Red" && this.timer.value >= 30;
    }

    canReceiveMessage(nameChannel) {
        return (this.currentState === "Green" && nameChannel === "red_sky_tl") ||
               (this.currentState === "Red" && nameChannel.startsWith("red_light_"));
    }

    canSendMessage() {
        return false;
    }

    canMove() {
        return false;
    }

}

class GroundTrafficLight {
    constructor(context, index) {
        this.context = context;
        this.currentState = "Red";
        this.timer = new Clock("timer");
        this.index = index;
    }

    /**
     * @warning: When we call doAction(), we must prealably verify
     *              whether there is a receiver if this automaton is going to send one.
     */
    doAction() {
        if (this.currentState === "Green" && this.timer.value >= 15) {
            this.context.redLight[this.index].sendMessage(this);
        }
    }

    receiveMessage(nameChannel) {
        if (this.currentState === "Red" && nameChannel === "green_light_" + this.index) {
            this.timer.value = 0;
            this.context.trafficLight[this.index] = true;
            this.currentState = "Green";

            document.dispatchEvent(new CustomEvent("green-light", {detail: this.index}));
        }
    }

    messageSent(nameChannel) {
        if (this.currentState === "Green"
            && nameChannel === "red_light_" + this.index
            && this.timer.value >= 15)
        {
            this.context.trafficLight[this.index] = false;
            this.currentState = "Red";

            document.dispatchEvent(new CustomEvent("red-light", {detail: this.index}));
        }
    }

    mustQuitCurrentStateNow() {
        return this.currentState === "Green" && this.timer.value >= 15;
    }

    canMove() {
        return false;
    }

    canSendMessage() {
        // check if there is any listener
        return this.currentState === "Green" && this.timer.value >= 15
            && (this.context.controller.canReceiveMessage("red_light_" + this.index) ||
                this.context.skyTrafficLight.canReceiveMessage("red_light_" + this.index));
    }

    canReceiveMessage(nameChannel) {
        return this.currentState === "Red" && nameChannel === "green_light_" + this.index;
    }
}

class TrafficGround {
    constructor(context) {
        this.context = context;
        this.currentState = "initialState";
    }

    doAction() {
        // Si on est dans l'état initial, on rajoute des voitures
        // si c'est possible
        if (this.currentState === "initialState") {
            let action = getRandomInt(0, 2);
            let nbCars = getRandomInt(0, 1);

            if (this.context.trafficGr[action] < this.context.MAX_CARS) {
                this.addCars(action, nbCars);
            }
        }
    }

    receiveMessage(nameChanel) {
        // messages received from initial state
        if (this.currentState === "initialState" && nameChanel === "green_light_2") {
            this.reduceCars(2);
            this.currentState = "topLeftState";
        }
        else if (this.currentState === "initialState" && nameChanel === "green_light_1") {
            this.reduceCars(1);
            this.currentState = "topRightState";
        }
        else if (this.currentState === "initialState" && nameChanel === "green_light_0") {
            this.reduceCars(0);
            this.currentState = "bottomState";
        }
        // messages received from other states
        else if (this.currentState === "topLeftState" && nameChanel === "red_light_2") {
            this.currentState = "initialState";
        }
        else if (this.currentState === "topRightState" && nameChanel === "red_light_1") {
            this.currentState = "initialState";
        }
        else if (this.currentState === "bottomState" && nameChanel === "red_light_0") {
            this.currentState = "initialState";
        }
    }

    reduceCars(num) {
        if (this.context.trafficGr[num] > 0)
            this.context.trafficGr[num]--;

        // trigger custom event
        document.dispatchEvent(new CustomEvent("car-launched", {detail: num}));
    }

    addCars(num, nbcars) {
        if(this.context.trafficGr[num] + nbcars < this.context.MAX_CARS)
            this.context.trafficGr[num] += parseInt(nbcars);
        else
            this.context.trafficGr[num] = this.context.MAX_CARS;

        // trigger custom event
        if (nbcars === 1)
            document.dispatchEvent(new CustomEvent("car-created", {detail: num}));

    }

    mustQuitCurrentStateNow() {
        return false;
    }

    canMove() {
        return (this.currentState === "initialState" && this.context.trafficGr[0] < this.context.MAX_CARS)
            || (this.currentState === "initialState" && this.context.trafficGr[1] < this.context.MAX_CARS)
            || (this.currentState === "initialState" && this.context.trafficGr[2] < this.context.MAX_CARS);
    }

    canSendMessage() {
        return false;
    }

    canReceiveMessage(nameChannel) {
        return (this.currentState === "topLeftState"  && nameChannel === "red_light_2") ||
               (this.currentState === "topRightState" && nameChannel === "red_light_1") ||
               (this.currentState === "bottomState"   && nameChannel === "red_light_0")
    }
}

class System {
    constructor() {
        // initialisation du contexte
        this.context = {
            x: new Clock("x"),
            timer: new Clock("timer"),
            MAX_CARS: 5,
            WAIT_TIME: 80,
            turn: 0,
            launched: false,
            free: [1, 1, 1],
            trafficGr: [0, 0, 0],
            trafficLight: [false, false, false],
            consult: new Channel("consult", false),
            greenLight: [
                new Channel("green_light_0", true),
                new Channel("green_light_1", true),
                new Channel("green_light_2", true)
            ],
            redLight: [
                new Channel("red_light_0", true),
                new Channel("red_light_1", true),
                new Channel("red_light_2", true)
            ],
            redSkyTL: new Channel("red_sky_tl", true),
            redSky: false,
            noGroundTraffic: () => {
                return (this.context.trafficGr[0] + this.context.trafficGr[1] + this.context.trafficGr[2]) === 0;
            },
            launchPossible: () => {
                return this.context.free[this.context.turn] === 1 && this.context.trafficGr[this.context.turn] !== 0;
            },
            updateTurn: () => {
                if(this.context.trafficGr[0] + this.context.trafficGr[1] + this.context.trafficGr[2] > 0) {
                    if(this.context.launched || this.context.trafficGr[this.context.turn] === 0) {
                        this.context.launched = false;
                        this.context.turn = (this.context.turn + 1) % 3;
                        while(this.context.trafficGr[this.context.turn] === 0){
                            this.context.turn = (this.context.turn + 1) % 3;
                        }
                    }
                }
            },
        };

        this.context.sensors = new Sensors(this.context);

        this.context.controller = new Controller(this.context);
        this.context.trafficGround = new TrafficGround(this.context);
        this.context.skyTrafficLight = new SkyTrafficLight(this.context);

        this.context.groundTrafficLights = [
            new GroundTrafficLight(this.context, "0"),
            new GroundTrafficLight(this.context, "1"),
            new GroundTrafficLight(this.context, "2")
        ];

        this.context.consult.addListener(this.context.sensors);
        this.context.redSkyTL.addListener(this.context.skyTrafficLight);

        for(let i = 0; i < 3; i++) {
            this.context.greenLight[i].addListener(this.context.groundTrafficLights[i]);
            this.context.greenLight[i].addListener(this.context.trafficGround);
            this.context.redLight[i].addListener(this.context.trafficGround);
            this.context.redLight[i].addListener(this.context.skyTrafficLight);
            this.context.redLight[i].addListener(this.context.controller);
        }

        this.periodicFunctionId = 0;
    }

    start() {
        this.periodicFunctionId = setInterval(() =>
        {
            // get the list of automata that can take a transition now.
            let automataThatCanTakeATransition = this.getMoveableAutomata();
            // if there is an automaton that MUST quit its state (invariant false) now,
            // we pick that one.
            let urgentAutomata = this.anyInvariantIsGoingToFail();
            if (urgentAutomata.length > 0) {
                // handle those automata now
                for(let i = 0; i < urgentAutomata.length; i++) {
                    console.log("ON EXECUTE UN AUTOMATE QUI DOIT QUITTER NOW", urgentAutomata[i], " i = ", i);
                    urgentAutomata[i].doAction();
                }
            } else {
                if (automataThatCanTakeATransition.length > 0) {
                    let randomIndex = getRandomInt(0, automataThatCanTakeATransition.length - 1);
                    automataThatCanTakeATransition[randomIndex].doAction();
                }
            }
            this.updateClocks();
            this.printCurrentState();
        }, Clock.period);
    }

    stop() {
        clearInterval(this.periodicFunctionId);
    }

    updateClocks() {
        this.context.x.value += Clock.interval;
        for(let i = 0; i < 3; i++) {
            this.context.groundTrafficLights[i].timer.value += Clock.interval;
        }
        this.context.skyTrafficLight.timer.value += Clock.interval;
        this.context.controller.timer.value += Clock.interval;
        this.context.controller.delay.value += Clock.interval;
    }

    printCurrentState() {
        let elementHTML = document.getElementById("state");
        elementHTML.innerHTML = "<ul>";
            elementHTML.innerHTML += "<strong>Clocks</strong>";
            elementHTML.innerHTML += "<li>x: " + this.context.x.value + "</li>";
            elementHTML.innerHTML += "<li>controller.timer: " + this.context.controller.timer.value + "</li>";
            elementHTML.innerHTML += "<li>skyLight.timer: "   + this.context.skyTrafficLight.timer.value   + "</li>";
            elementHTML.innerHTML += "<li>groundTrafficLights[0].timer: " + this.context.groundTrafficLights[0].timer.value + "</li>";
            elementHTML.innerHTML += "<li>groundTrafficLights[1].timer: " + this.context.groundTrafficLights[1].timer.value + "</li>";
            elementHTML.innerHTML += "<li>groundTrafficLights[2].timer: " + this.context.groundTrafficLights[2].timer.value + "</li>";

            elementHTML.innerHTML += "<strong>Integers</strong>";
            elementHTML.innerHTML += "<li>free[0]: " + this.context.free[0] + "</li>";
            elementHTML.innerHTML += "<li>free[1]: " + this.context.free[1] + "</li>";
            elementHTML.innerHTML += "<li>free[2]: " + this.context.free[2] + "</li>";
            elementHTML.innerHTML += "<li>trafficGr[0]: " + this.context.trafficGr[0] + "</li>";
            elementHTML.innerHTML += "<li>trafficGr[1]: " + this.context.trafficGr[1] + "</li>";
            elementHTML.innerHTML += "<li>trafficGr[2]: " + this.context.trafficGr[2] + "</li>";
            elementHTML.innerHTML += "<li>MAX_CARS: "  + this.context.MAX_CARS + "</li>";
            elementHTML.innerHTML += "<li>WAIT_TIME: " + this.context.WAIT_TIME + "</li>";
            elementHTML.innerHTML += "<li>turn: " + this.context.turn + "</li>";

            elementHTML.innerHTML += "<strong>Bools</strong>";
            elementHTML.innerHTML += "<li>launched: " + this.context.launched + "</li>";
            elementHTML.innerHTML += "<li>redSky: "   + this.context.redSky + "</li>";
            elementHTML.innerHTML += "<li>trafficLightGround[0]: " + this.context.trafficLight[0] + "</li>";
            elementHTML.innerHTML += "<li>trafficLightGround[1]: " + this.context.trafficLight[1] + "</li>";
            elementHTML.innerHTML += "<li>trafficLightGround[2]: " + this.context.trafficLight[2] + "</li>";

            elementHTML.innerHTML += "<strong>Automates</strong>";
            elementHTML.innerHTML += "<li>controller: " + this.context.controller.currentState + "</li>";
            elementHTML.innerHTML += "<li>sensors: "    + this.context.sensors.currentState + "</li>";
            elementHTML.innerHTML += "<li>trafficGround: "   + this.context.trafficGround.currentState + "</li>";
            elementHTML.innerHTML += "<li>skyTrafficLight: " + this.context.skyTrafficLight.currentState + "</li>";
            elementHTML.innerHTML += "<li>groundTrafficLight[0]: " + this.context.groundTrafficLights[0].currentState + "</li>";
            elementHTML.innerHTML += "<li>groundTrafficLight[1]: " + this.context.groundTrafficLights[1].currentState + "</li>";
            elementHTML.innerHTML += "<li>groundTrafficLight[2]: " + this.context.groundTrafficLights[2].currentState + "</li>";
        elementHTML.innerHTML += "</ul>";

    }

    anyInvariantIsGoingToFail() {
        let urgentAutomata = [];

        if (this.context.controller.mustQuitCurrentStateNow())
            urgentAutomata.push(this.context.controller);

        if (this.context.skyTrafficLight.mustQuitCurrentStateNow())
            urgentAutomata.push(this.context.skyTrafficLight);

        for(let i = 0; i < 3; i++)
            if (this.context.groundTrafficLights[i].mustQuitCurrentStateNow())
                urgentAutomata.push(this.context.groundTrafficLights[i]);

        return urgentAutomata;
    }

    getMoveableAutomata() {
        let automata = [];

        if (this.context.trafficGround.canMove())
            automata.push(this.context.trafficGround);

        for(let i = 0; i < 3; i++) {
            if (this.context.groundTrafficLights[i].canSendMessage())
                automata.push(this.context.groundTrafficLights[i]);
        }

        if (this.context.controller.canMove() || this.context.controller.canSendMessage())
            automata.push(this.context.controller);

        return automata;
    }
}

let system = new System();
system.start();
