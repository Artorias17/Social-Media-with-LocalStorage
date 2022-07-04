const video = document.getElementsByTagName("video")[0]
const cameraCanvas = document.querySelector("#cameraOption canvas")
const cameraCanvasContext = cameraCanvas.getContext("2d")
const fileCanvas = document.querySelector("#fileOption canvas")
const fileCanvasContext = fileCanvas.getContext("2d")
const snap = document.getElementById("snapPhoto")
const record = document.getElementById("recordVideo")
const mediaType = document.querySelectorAll("input[name=mediaType]")
const mediaSource = document.querySelectorAll("input[name=mediaSource]")
const form = document.querySelector("form")
const fileReader = new FileReader()
let loc = "somewhere"
let webcamStream = null

// Event Listener for getting location latitide and longitude
document.querySelector("#location").addEventListener("change", (evt) => {
    if(evt.target.checked)
        navigator.geolocation.getCurrentPosition((pos) => loc = `latitude: ${pos.coords.latitude}, longitude: ${pos.coords.longitude}`)
    else
        loc = "somewhere"
})

// Event Listener for drawing preview when a file is uploaded
document.querySelector("#fileOption input").addEventListener("change", (evt) => {
    if(evt.target.files[0].type.includes("image")){
        fileReader.onloadend = (base64file) => {
            const img = new Image()
            img.onload = () => {

                //Limiting resolution to a width of 640px
                const resizingFactor = Math.min(640/img.width, 1)
                fileCanvas.width = img.width * resizingFactor
                fileCanvas.height = img.height * resizingFactor
                fileCanvasContext.drawImage(img, 0, 0, fileCanvas.width, fileCanvas.height)
            }
            img.src = base64file.target.result.toString()
        }
        fileReader.readAsDataURL(evt.target.files[0])
    }
})

//Event listener for when the form is submitted and needs to be pushed to local storage
form.addEventListener("submit", (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    const post = {
        "author": evt.target.elements["author"].value,
        "type": evt.target.elements["mediaType"].value,
        "mediaFile": "",
        "location": loc,
        "postText": evt.target.elements["textArea"].value,
        "time": Date.now()
    }

    if(evt.target.elements["mediaSource"].value === "storage"){
        post.mediaFile = fileCanvas.toDataURL()
    }
    else if(evt.target.elements["mediaSource"].value === "camera"){
        post.mediaFile = cameraCanvas.toDataURL()
    }

    localStorage.setItem(post.time.toString(), JSON.stringify(post))

    location.href = "index.html"
})

// Event listener for mediaSource Radio options
mediaSource.forEach((element) => {
    element.addEventListener("change", (evt) => {
        if(evt.target.value === "storage"){
            cameraCanvasContext.resetTransform()
            cameraCanvasContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height)

            document.querySelector("#fileOption").style.display = "flex"
            document.querySelector("#cameraOption").style.display = "none"

            stopWebcam()

        }else if(evt.target.value === "camera") {
            document.querySelector("#fileOption").style.display = "none"
            document.querySelector("#cameraOption").style.display = "flex"

            startWebcam()
        }
    })
})

// Event listener for mediaType Radio options
mediaType.forEach((element) => {
    element.addEventListener("change", (evt) => {
        const source = document.querySelector("#mediaSource")
        const cam = document.querySelector("#cameraOption")
        const file = document.querySelector("#fileOption")

        source.querySelectorAll("input")[0].checked = true
        source.querySelectorAll("input")[0].dispatchEvent(new Event("change"))
        if(evt.target.value !== "none"){
            source.style.display = "flex"
            if(evt.target.value === "image") file.querySelector("input").accept = "image/*"
            else if(evt.target.value === "video") file.querySelector("input").accept = "video/*"
        }else{
            source.style.display = "none"
            cam.style.display = "none"
            file.style.display = "none"
        }
    })
})

// Event listener for taking a webcam picture
snap.addEventListener("click", (evt) => {
    evt.preventDefault()
    const {width, height} = webcamStream.getVideoTracks()[0].getSettings()

    //Limiting resolution to a width of 640px
    const resizingFactor = Math.min(640/width, 1)

    cameraCanvas.width = width * resizingFactor
    cameraCanvas.height = height  * resizingFactor
    cameraCanvasContext.scale(-1, 1)
    cameraCanvasContext.drawImage(video, 0, 0, cameraCanvas.width*-1, cameraCanvas.height)
    cameraCanvasContext.resetTransform()
})

// Function for starting the webcam
async function startWebcam() {
    document.querySelector("#videoStreamStatus").innerHTML = "Awaiting permission"
    document.querySelector("#videoStreamStatus").classList.remove("text-danger")
    document.querySelector("#videoStreamStatus").classList.add("text-warning")
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        video.srcObject = webcamStream
        video.style.transform = 'scaleX(-1)'
        document.querySelector("#videoStreamStatus").innerHTML = ""
    } catch (streamError) {
        document.querySelector("#videoStreamStatus").innerHTML = streamError.message
        document.querySelector("#videoStreamStatus").classList.add("text-danger")
        document.querySelector("#videoStreamStatus").classList.remove("text-warning")
    }
}

// Function for stopping the webcam
function stopWebcam() {
    if(webcamStream){
        webcamStream.getTracks().forEach((track) => {
            if(track.readyState === "live") track.stop()
        })
    }
}

// Initial values for setting up the options
mediaType[0].checked = true
mediaType[0].dispatchEvent(new Event("change"))
mediaSource[0].checked = true
mediaSource[0].dispatchEvent(new Event("change"))
cameraCanvas.width = 0
cameraCanvas.height = 0
fileCanvas.width = 0
fileCanvas.height = 0


//Only picture mode
mediaType[1].disabled = true
record.classList.add("disabled")