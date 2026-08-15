const template = document.querySelector("#project-template");
const container = document.querySelector(".projects");

// Settings Ok?
const GITHUB_USERNAME = "Wraithina";
const GITHUB_REPOSITORY = "wraithina.github.io";

const PROJECTS_FOLDER = "Projects";


async function loadProjects() {

    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${PROJECTS_FOLDER}`
    );

    if (!response.ok) {
        console.error("Couldn't find the Projects folder.");
        return;
    }

    const folders = await response.json();

    const projects = [];


    // Get project data
    for (const folder of folders) {

        if (folder.type !== "dir") {
            continue;
        }

        if (folder.name === "Template") {
            continue;
        }


        const projectResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${PROJECTS_FOLDER}/${folder.name}/project.json`
        );

        if (!projectResponse.ok) {
            console.warn(`No project.json found for ${folder.name}`);
            continue;
        }


        const projectFile = await projectResponse.json();

        const jsonText = atob(projectFile.content);

        const project = JSON.parse(jsonText);


        // Remember the folder name
        project.folder = folder.name;

        projects.push(project);
    }


    // Sort projects by order
    projects.sort((a, b) => a.order - b.order);


    // Create the project cards
    for (const project of projects) {

        const clone = template.content.cloneNode(true);


        clone.querySelector(".title_element").textContent =
            project.title;

        clone.querySelector(".description_element").textContent =
            project.description;


        const mediaContainer =
            clone.querySelector(".media_container");


        const mediaPath =
            `${PROJECTS_FOLDER}/${project.folder}/${project.media}`;


        // IMAGE
        if (project.type === "image") {

            const image = document.createElement("img");

            image.src =
                `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/main/${mediaPath}`;

            image.alt = project.title;

            image.className = "media_element";


            image.onload = () => {

                const ratio =
                    image.naturalWidth / image.naturalHeight;

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

            video.src =
                `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/main/${mediaPath}`;

            video.className = "media_element";

            video.controls = true;


            video.addEventListener("loadedmetadata", () => {

                const ratio =
                    video.videoWidth / video.videoHeight;

                mediaContainer.style.setProperty(
                    "--media-ratio",
                    ratio
                );
            });


            mediaContainer.appendChild(video);
        }


        container.appendChild(clone);
    }
}


loadProjects();