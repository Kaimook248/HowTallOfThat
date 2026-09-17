let cameraStream = null;

let currentAngle = null;

let isMeasuring = false;

let isLocked = false;

function calculateHeight() {

    const distance =
        Number(
            document.getElementById("distance").value
        );


    const instrumentHeight =
        Number(
            document.getElementById("instrumentHeight").value
        );


    const angle =
        Number(
            document.getElementById("angle").value
        );

    if (
        distance <= 0 ||
        instrumentHeight < 0 ||
        angle <= 0 ||
        angle >= 90
    ) {

        alert(
            "กรุณากรอกข้อมูลให้ถูกต้อง\n" +
            "มุมต้องอยู่ระหว่าง 0 ถึง 90 องศา"
        );

        return;
    }

    const radians =
        angle * Math.PI / 180;

    const height =
        distance *
        Math.tan(radians) +
        instrumentHeight;

    document.getElementById("result").textContent =
        height.toFixed(2) + " m";
}

async function startMeasurement() {

    try {

        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {

            const permission =
                await DeviceOrientationEvent.requestPermission();


            if (permission !== "granted") {

                alert(
                    "ไม่ได้รับอนุญาตให้ใช้เซนเซอร์วัดมุม"
                );

                return;
            }
        }

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "environment"
                    }

                },

                audio: false
            });

        const video =
            document.getElementById("camera");


        video.srcObject =
            cameraStream;

        isMeasuring = true;

        isLocked = false;


        window.addEventListener(
            "deviceorientation",
            handleOrientation
        );

        document.getElementById("lockButton")
            .disabled = false;

        document.getElementById("cameraStatus")
            .textContent =
            "🟢 กำลังวัดมุม — เล็งจุดกึ่งกลางไปที่ยอดอาคาร";


    } catch (error) {

        console.error(error);


        alert(
            "ไม่สามารถเปิดกล้องหรือเซนเซอร์ได้\n\n" +
            "กรุณาตรวจสอบว่า:\n" +
            "1. อนุญาตการใช้กล้อง\n" +
            "2. อนุญาตการใช้เซนเซอร์\n" +
            "3. เปิดเว็บไซต์ผ่าน HTTPS หรือ localhost"
        );
    }
}

function handleOrientation(event) {
    
    if (!isMeasuring || isLocked) {
        return;
    }

    
    if (event.beta === null) {
        return;
    }

    let angle =
       event.beta - 90;

    if (angle < 0) {
        angle = 0;
    }

    if (angle > 89.9) {
        angle = 89.9;
    }


    currentAngle = angle;

    document.getElementById("liveAngle")
        .textContent =
        angle.toFixed(1) + "°";

    document.getElementById("angle")
        .value =
        angle.toFixed(1);
}

function lockAngle() {

    if (
        currentAngle === null ||
        !isMeasuring
    ) {

        return;
    }


    isLocked = true;

    isMeasuring = false;

    const lockedAngle =
        currentAngle;


    document.getElementById("angle")
        .value =
        lockedAngle.toFixed(1);


    document.getElementById("liveAngle")
        .textContent =
        lockedAngle.toFixed(1) + "°";

    document.getElementById("cameraStatus")
        .textContent =
        "🔒 ล็อกมุมแล้ว — " +
        lockedAngle.toFixed(1) +
        "°";


    document.getElementById("lockButton")
        .disabled = true;

    window.removeEventListener(
        "deviceorientation",
        handleOrientation
    );
}