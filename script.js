const projects = [
    {
        title: "Windhill",
        description: "Game development and visual design.",
        type: "image",
        media: "Assets/Placeholder.png"
    },

    {
        title: "Communications Tool",
        description: "UI and scripting.",
        type: "video",
        media: "Assets/Placeholder01.mp4"
    }
];


const template = document.querySelector("#project-template");
const container = document.querySelector(".projects");


projects.forEach(project => {

    const clone = template.content.cloneNode(true);

    // Set text
    clone.querySelector(".title_element").textContent = project.title;
    clone.querySelector(".description_element").textContent = project.description;

    // Find media container
    const mediaContainer = clone.querySelector(".media_container");


    // IMAGE
    if (project.type === "image") {

        const image = document.createElement("img");

        image.src = project.media;
        image.alt = project.title;
        image.className = "media_element";

        // Get the image's real aspect ratio
        image.onload = () => {

            const ratio = image.naturalWidth / image.naturalHeight;

            mediaContainer.style.setProperty(
                "--media-ratio",
                ratio
            );

        };

        mediaContainer.appendChild(image);
    }


    // VIDEO
    if (project.type === "video") {

        const video = document.createElement("video");

        video.src = project.media;
        video.className = "media_element";

        video.controls = true;

        // Get the video's real aspect ratio
        video.addEventListener("loadedmetadata", () => {

            const ratio = video.videoWidth / video.videoHeight;

            mediaContainer.style.setProperty(
                "--media-ratio",
                ratio
            );

        });

        mediaContainer.appendChild(video);
    }


    // Add the finished project to the page
    container.appendChild(clone);

});