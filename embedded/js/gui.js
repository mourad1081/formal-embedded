$(function () {
    let fastCar = $("<img class='car fast-car car-top animated bounceIn' src='img/fast-car-top.png'/>");
    let normalCar = $("<img class='car normal-car car-top animated bounceIn' src='img/normal-car-top.png'/>");
    let slowCar = $("<img class='car slow-car car-top animated bounceIn' src='img/slow-car-top.png'/>");

    let queueFastCar = [];
    let queueNormalCar = [];
    let queueSlowCar = [];

    let queueHighwayCars = [];

    let fastCarSide = $("<img class='car fast-car car-side animated fadeInLeft' src='img/fast-car-side.png'/>");
    let normalCarSide = $("<img class='car normal-car car-side animated fadeInLeft' src='img/normal-car-side.png'/>");
    let slowCarSide = $("<img class='car slow-car car-side animated fadeInLeft' src='img/slow-car-side.png'/>");

    let launchableFastCarSide = $("<img class='car car-side animated fadeInLeft' src='img/fast-car-side.png'/>");
    let launchableNormalCarSide = $("<img class='car car-side animated fadeInLeft' src='img/normal-car-side.png'/>");
    let launchableSlowCarSide = $("<img class='car car-side animated fadeInLeft' src='img/slow-car-side.png'/>");

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
                    break;
                case 1:
                    car = launchableNormalCarSide.clone();
                    car.css("top", 450).css("left", 100);
                    car.addClass("animate-normal-car");
                    // -- after the animation, we fade out the car
                    roadSide.append(car);
                    break;
                case 2:
                    car = launchableFastCarSide.clone();
                    car.css("top", 450).css("left", 100);
                    car.addClass("animate-fast-car");
                    // -- after the animation, we fade out the car
                    roadSide.append(car);
                    break;
            }
        }, 400);
    });

    document.addEventListener("sky-tl", (event) => {
        if (event.detail === "green") {
            $("#tl-sky").attr("src", "img/tl-sky-green.png");
        } else {
            $("#tl-sky").attr("src", "img/tl-sky-red.png");
        }
    });

    document.addEventListener("green-light", (event) => {
        switch (event.detail) {
            case "0": $("#tl-slow").attr("src", "img/tl-green.png"); break;
            case "1": $("#tl-normal").attr("src", "img/tl-green.png"); break;
            case "2": $("#tl-fast").attr("src", "img/tl-green.png"); break;
        }
    });

    document.addEventListener("red-light", (event) => {
        switch (event.detail) {
            case "0": $("#tl-slow").attr("src", "img/tl-red.png"); break;
            case "1": $("#tl-normal").attr("src", "img/tl-red.png"); break;
            case "2": $("#tl-fast").attr("src", "img/tl-red.png"); break;
        }
    });



    setInterval(() => {
        // we flip a coin
        if (system.context.redSky === false) {
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

        // for debug purpose
        document.onmousemove = function(e){
            var x = e.pageX - $('#road-side').offset().left;
            var y = e.pageY - $('#road-side').offset().top;
            e.target.title = "X is "+x+" and Y is "+y;
        };

        // we move them by a certain amount of pixel
        for(let i = queueHighwayCars.length - 1; i >= 0; i--) {
            queueHighwayCars[i].animate({left: "+=64"}, 300, "linear");

            // if their x pixel is between 360 and 250, then we set free[0] to 0

            // if their pixel is between 200 and 250, then we set free[1] to 0

            // if their pixel is between 200 and 250, then we set free[2] to 0


            if (queueHighwayCars[i].offset().left > 650) {
                let currentCar = queueHighwayCars[i];
                currentCar.addClass("fadeOutRight");
                setTimeout(() => {
                    queueHighwayCars.splice(queueHighwayCars.indexOf(currentCar), 1 );
                    currentCar.remove();
                }, 300);
            }

        }
    }, 1000);

});