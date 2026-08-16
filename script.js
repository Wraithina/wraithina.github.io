const template = document.querySelector("#project-template");
const container = document.querySelector(".projects");
const loading = document.querySelector("#loading");


// =========================
// SETTINGSgg
// =========================

const GITHUB_USERNAME = "Wraithina";
const GITHUB_REPOSITORY = "wraithina.github.io";

const PROJECTS_FOLDER = "Projects";


// Cache settings

const CACHE_KEY = "wraithina_projects";

const CACHE_DURATION =
    10 * 60 * 1000; // 10 minutes


async function loadProjects() {

    try {

        const cached =
            localStorage.getItem(CACHE_KEY);


        if (cached) {

            const cacheData =
                JSON.parse(cached);


            const cacheAge =
                Date.now() - cacheData.timestamp;


            // Cache is still valid

            if (cacheAge < CACHE_DURATION) {

                console.log(
                    "Loading projects from cache."
                );


                renderProjects(
                    cacheData.projects
                );


                hideLoading();

                return;
            }


            // Cache expired

            console.log(
                "Project cache expired."
            );

        }


        // -------------------------
        // Get Projects folder
        // -------------------------

        console.log(
            "Fetching projects from GitHub."
        );


        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${PROJECTS_FOLDER}`
        );


        if (!response.ok) {

            throw new Error(
                `GitHub API returned ${response.status}`
            );

        }


        const folders =
            await response.json();


        const projects = [];


        // -------------------------
        // Get project data
        // -------------------------

        for (const folder of folders) {


            if (folder.type !== "dir") {
                continue;
            }


            if (folder.name === "Template") {
                continue;
            }


            const projectResponse =
                await fetch(
                    `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${PROJECTS_FOLDER}/${folder.name}/project.json`
                );


            if (!projectResponse.ok) {

                console.warn(
                    `No project.json found for ${folder.name}`
                );

                continue;
            }


            const projectFile =
                await projectResponse.json();


            const jsonText =
                atob(projectFile.content);


            const project =
                JSON.parse(jsonText);


            // Remember folder name

            project.folder =
                folder.name;


            projects.push(project);

        }


        // -------------------------
        // Save cache
        // -------------------------

        localStorage.setItem(

            CACHE_KEY,

            JSON.stringify({

                timestamp: Date.now(),

                projects: projects

            })

        );


        // -------------------------
        // Render
        // -------------------------

        renderProjects(projects);


        hideLoading();


    } catch (error) {


        console.error(
            "Failed to load projects:",
            error
        );


        // -------------------------
        // Try stale cache
        // -------------------------

        const cached =
            localStorage.getItem(CACHE_KEY);


        if (cached) {

            try {

                const cacheData =
                    JSON.parse(cached);


                console.warn(
                    "GitHub failed. Using stale project cache."
                );


                renderProjects(
                    cacheData.projects
                );


                hideLoading();


                return;

            } catch {

                console.warn(
                    "Cached project data is invalid."
                );

            }

        }


        // -------------------------
        // No cache → show error
        // -------------------------

        loading.innerHTML = `

            <div class="loading_error">

                <strong>
                    Unable to load projects.
                </strong>

                <span>
                    ${error.message}
                </span>

            </div>

        `;

    }

}


// =========================
// RENDER PROJECTS
// =========================

function renderProjects(projects) {


    // Sort projects

    projects.sort(
        (a, b) => b.order - a.order
    );


    console.log(
        projects.map(
            p => `${p.title}: ${p.order}`
        )
    );


    // Create cards

    for (const project of projects) {


        const clone =
            template.content.cloneNode(true);


        // -------------------------
        // Title
        // -------------------------

        clone.querySelector(
            ".title_element"
        ).innerHTML =

            project.title.replace(

                /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,

                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'

            );


        // -------------------------
        // Description
        // -------------------------

        clone.querySelector(
            ".description_element"
        ).innerHTML =

            project.description.replace(

                /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,

                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'

            );


        // -------------------------
        // Media container
        // -------------------------

        const mediaContainer =
            clone.querySelector(
                ".media_container"
            );


        const mediaPath =
            `${PROJECTS_FOLDER}/${project.folder}/${project.media}`;


        const mediaURL =
            `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/main/${mediaPath}`;


        // -------------------------
        // IMAGE
        // -------------------------

        if (project.type === "image") {


            const image =
                document.createElement("img");


            image.src = mediaURL;


            image.alt =
                project.title;


            image.className =
                "media_element";


            image.onload = () => {


                const ratio =
                    image.naturalWidth /
                    image.naturalHeight;


                mediaContainer.style.setProperty(
                    "--media-ratio",
                    ratio
                );

            };


            mediaContainer.appendChild(
                image
            );

        }


        // -------------------------
        // VIDEO
        // -------------------------

        if (project.type === "video") {


            const video =
                document.createElement("video");


            video.src = mediaURL;


            video.className =
                "media_element";


            video.controls = true;


            video.addEventListener(
                "loadedmetadata",
                () => {


                    const ratio =
                        video.videoWidth /
                        video.videoHeight;


                    mediaContainer.style.setProperty(
                        "--media-ratio",
                        ratio
                    );

                }
            );


            mediaContainer.appendChild(
                video
            );

        }


        // Add project

        container.appendChild(
            clone
        );

    }

}


// =========================
// HIDE LOADING
// =========================

function hideLoading() {

    loading.style.display =
        "none";

}


// =========================
// START
// =========================

loadProjects();