$(function () {
    let fastCar = $("<img class='car fast-car car-top animated fadeInUp' src='img/fast-car-top.png'/>");
    let normalCar = $("<img class='car normal-car car-top animated fadeInUp' src='img/normal-car-top.png'/>");
    let slowCar = $("<img class='car slow-car car-top animated fadeInUp' src='img/slow-car-top.png'/>");

    let queueFastCar = [];
    let queueNormalCar = [];
    let queueSlowCar = [];

    let queueHighwayCars = [];

    let fastCarSide = $("<img class='car fast-car car-side animated fadeInLeft' src='img/fast-car-side.png'/>");
    let normalCarSide = $("<img class='car normal-car car-side animated fadeInLeft' src='img/normal-car-side.png'/>");
    let slowCarSide = $("<img class='car slow-car car-side animated fadeInLeft' src='img/slow-car-side.png'/>");

    let launchableFastCarSide = $("<img class='car   car-side' src='img/fast-car-side.png'/>");
    let launchableNormalCarSide = $("<img class='car car-side' src='img/normal-car-side.png'/>");
    let launchableSlowCarSide = $("<img class='car   car-side' src='img/slow-car-side.png'/>");

    let tlSlow = $("#tl-slow");
    let tlNormal = $("#tl-normal");
    let tlFast = $("#tl-fast");
    let tlSky = $("#tl-sky");

    let sensors = [$("#sensor-0"), $("#sensor-1"), $("#sensor-2")];

    document.addEventListener("car-created", (event) => {
        if (event.detail === 2) {
            let clone = fastCar.clone();
            queueFastCar.push(clone);
            $("#road-top").append(clone);
            setTimeout(() => {
                clone.animate({top: system.context.trafficGr[event.detail] * 115 }, 2000, "swing");
            }, 300);
        }
        else if (event.detail === 1) {
            let clone = normalCar.clone();
            queueNormalCar.push(clone);

            $("#road-top").append(clone);
            setTimeout(() => {
                clone.animate({top: system.context.trafficGr[event.detail] * 100 }, 2000, "swing");
            }, 300);
        }
        else if (event.detail === 0) {
            let clone = slowCar.clone();
            queueSlowCar.push(clone);

            $("#road-top").append(clone);
            setTimeout(() => {
                clone.animate({top: system.context.trafficGr[event.detail] * 95 }, 2000, "swing");
            }, 300);
        }
        else
            alert(event.detail);
    });

    document.addEventListener("car-launched", (event) => {
        let car;
        switch(event.detail) {
            case 0:
                car = queueSlowCar.shift();
                car.addClass("fadeOutUp");
                setTimeout(() => {
                    for(let i = 0; i < queueSlowCar.length; i++) {
                        queueSlowCar[i].animate({top: (system.context.trafficGr[0] - (queueSlowCar.length - 1 - i)) * 95 }, 2000, "swing");
                    }
                    car.remove();
                }, 300);
                break;
            case 1:
                car = queueNormalCar.shift();
                car.addClass("fadeOutUp");
                setTimeout(() => {
                    for(let i = 0; i < queueNormalCar.length; i++) {
                        queueNormalCar[i].animate({top: (system.context.trafficGr[1] - (queueNormalCar.length - 1 - i)) * 100 }, 2000, "swing");
                    }
                    car.remove();
                }, 300);
                break;
            case 2:
                car = queueFastCar.shift();
                car.addClass("fadeOutUp");
                setTimeout(() => {
                    for(let i = 0; i < queueFastCar.length; i++) {
                        queueFastCar[i].animate({top: (system.context.trafficGr[2] - (queueFastCar.length - 1 - i) ) * 115 }, 2000, "swing");
                    }
                    car.remove();
                }, 300);
                break;
        }

        // we launch the car
        setTimeout(() => {
            let roadSide = $("#road-side");
            switch(event.detail) {
                case 0:
                    car = launchableSlowCarSide.clone();
                    car.css("top", 450).css("left", 100);
                    car.addClass("animate-slow-car");
                    // -- after the animation, we fade out the car
                    roadSide.append(car);

                    setTimeout(() => {
                        car.css("top", 115).css("left", 768);
                        car.removeClass("animate-slow-car").addClass("animated fadeOutRight");
                    }, 4000);
                    break;
                case 1:
                    car = launchableNormalCarSide.clone();
                    car.css("top", 450).css("left", 100);
                    car.addClass("animate-normal-car");
                    // -- after the animation, we fade out the car
                    roadSide.append(car);
                    setTimeout(() => {
                        car.css("top", 150).css("left", 768);
                        car.removeClass("animate-normal-car").addClass("animated fadeOutRight");
                    }, 3000);
                    break;
                case 2:
                    car = launchableFastCarSide.clone();
                    car.css("top", 450).css("left", 100);
                    car.addClass("animate-fast-car");
                    // -- after the animation, we fade out the car
                    roadSide.append(car);
                    setTimeout(() => {
                        car.css("top", 150).css("left", 768);
                        car.removeClass("animate-fast-car").addClass("animated fadeOutRight");
                    }, 1500);
                    break;
            }
        }, 300);
    });

    document.addEventListener("sky-tl", (event) => {
        if (event.detail === "green") {
            tlSky.attr("src", "img/tl-sky-green.png");
        } else {
            tlSky.attr("src", "img/tl-sky-red.png");
        }
    });

    document.addEventListener("green-light", (event) => {
        switch (event.detail) {
            case "0": tlSlow.attr("src", "img/tl-green.png"); break;
            case "1": tlNormal.attr("src", "img/tl-green.png"); break;
            case "2": tlFast.attr("src", "img/tl-green.png"); break;
        }
    });

    document.addEventListener("red-light", (event) => {
        switch (event.detail) {
            case "0": tlSlow.attr("src", "img/tl-red.png"); break;
            case "1": tlNormal.attr("src", "img/tl-red.png"); break;
            case "2": tlFast.attr("src", "img/tl-red.png"); break;
        }
    });

    setInterval(() => {
        if (system.context.redSky === false) {
            // we flip a coin (prob 1/3 car present highway)
            let r = getRandomInt(0, 1);
            let car;
            // we add cars if the sky traffic light is green
            if (r === 1) {
                let r2 = getRandomInt(0, 2);
                let roadSide = $("#road-side");
                switch (r2) {
                    case 0:
                        car = slowCarSide.clone();
                        queueHighwayCars.push(car);
                        roadSide.append(car);
                        break;
                    case 1:
                        car = normalCarSide.clone();
                        queueHighwayCars.push(car);
                        roadSide.append(car);
                        break;
                    case 2:
                        car = fastCarSide.clone();
                        queueHighwayCars.push(car);
                        roadSide.append(car);
                        break;
                }
            }
        }

        // we move them by a certain amount of pixel
        for(let i = queueHighwayCars.length - 1; i >= 0; i--) {

            if (queueHighwayCars[i].offset().left > 650) {
                let currentCar = queueHighwayCars[i];
                currentCar.addClass("fadeOutRight");

                setTimeout(() => {
                    queueHighwayCars.splice(queueHighwayCars.indexOf(currentCar), 1 );
                    currentCar.remove();
                }, 300);
            }

            queueHighwayCars[i].animate({left: "+=64"}, 400, "linear");
        }
        // then, we update the sensors
        setTimeout(() => {
            let sensorMisARed = false;

            for(let i = 0; i < queueHighwayCars.length; i++) {
                // tu te comprends...
                if (155 <= queueHighwayCars[i].offset().left && queueHighwayCars[i].offset().left <= 220) {
                    system.context.free[0] = 0;
                    sensorMisARed = true;
                    sensors[0].attr("src", "img/sensor-red.png");
                    break;
                }
            }
            if (!sensorMisARed) {
                system.context.free[0] = 1;
                sensors[0].attr("src", "img/sensor-green.png");
            }
            sensorMisARed = false;

            for(let i = 0; i < queueHighwayCars.length; i++) {
                // if their pixel is between 200 and 250, then we set free[1] to 0
                if (280 <= queueHighwayCars[i].offset().left && queueHighwayCars[i].offset().left <= 350) {
                    system.context.free[1] = 0;
                    sensorMisARed = true;
                    sensors[1].attr("src", "img/sensor-red.png");
                    break;
                }
            }
            if (!sensorMisARed) {
                system.context.free[1] = 1;
                sensors[1].attr("src", "img/sensor-green.png");
            }
            sensorMisARed = false;

            for(let i = 0; i < queueHighwayCars.length; i++) {
                // if their pixel is between 200 and 250, then we set free[2] to 0
                if (495 <= queueHighwayCars[i].offset().left && queueHighwayCars[i].offset().left <= 550)
                {
                    system.context.free[2] = 0;
                    sensorMisARed = true;
                    sensors[2].attr("src", "img/sensor-red.png");
                    break;
                }
            }
            if (!sensorMisARed) {
                system.context.free[2] = 1;
                sensors[2].attr("src", "img/sensor-green.png");
            }
        }, 300);
    }, 500);

});