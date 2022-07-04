const container = document.querySelector("#postContainer")
const template = document.querySelector("template")

Object.keys(localStorage).sort((a, b) => {
    if(a === b) return 0
    else if(a < b) return 1
    else return -1
}).forEach((key) => {
    try {
        const post = JSON.parse(localStorage[key])
        const card = template.content.cloneNode(true)

        if(post.type === "image"){
            const image = document.createElement("img")
            image.classList.add("card-img-top", "img-fluid")
            image.src = post.mediaFile
            image.alt = `Picture by ${post.author}`
            card.querySelector("div").prepend(image)
        }
        else if(post.type === "video"){
            const vid = document.createElement("video")
            vid.classList.add("card-img-top", "img-fluid")
            vid.controls = true
            vid.width = "100%"
            vid.height = "auto"
            card.querySelector("div").prepend(vid)
        }

        card.querySelector("h5").innerText = post.author
        card.querySelector("h6").innerText = `Time: ${post.time} * Location: ${post.location}`
        card.querySelector("p").innerText = post.postText

        container.appendChild(card)
    }
    catch (err) {
        console.log(err.message)
    }
})
