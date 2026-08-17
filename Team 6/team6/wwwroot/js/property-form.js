let editingPropertyId = null;


/* =========================================
   PAGE INITIALIZATION
========================================= */

async function initPropertyForm() {

    try {

        await Promise.all([
            loadPropertyTypes(),
            loadCities(),
            loadAgents()
        ]);


        const params =
            new URLSearchParams(window.location.search);

        const id =
            params.get("id");


        if (id) {

            editingPropertyId =
                parseInt(id);

            await loadProperty(editingPropertyId);

        }

    } catch (error) {

        console.error(error);

        showError(
            "Unable to load the property form."
        );

    }

}


/* =========================================
   LOAD PROPERTY TYPES
========================================= */

async function loadPropertyTypes() {

    const select =
        document.getElementById(
            "propertyTypeId"
        );


    try {

        const types =
            await api.get("/PropertyType");


        types.forEach(function (type) {

            const option =
                document.createElement("option");

            option.value =
                type.propertyTypeId;

            option.textContent =
                type.typeName;

            select.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error loading property types:",
            error
        );

        throw error;

    }

}


/* =========================================
   LOAD CITIES
========================================= */

async function loadCities() {

    const select =
        document.getElementById(
            "cityId"
        );


    try {

        const cities =
            await api.get("/City");


        cities.forEach(function (city) {

            const option =
                document.createElement("option");

            option.value =
                city.cityId;

            option.textContent =
                city.cityName +
                ", " +
                city.state;

            select.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error loading cities:",
            error
        );

        throw error;

    }

}


/* =========================================
   LOAD AGENTS
========================================= */

async function loadAgents() {

    const select =
        document.getElementById(
            "agentId"
        );


    try {

        const users =
            await api.get("/User");


        const agents =
            users.filter(function (user) {

                return user.role &&
                    user.role.toLowerCase() === "agent";

            });


        agents.forEach(function (agent) {

            const option =
                document.createElement("option");


            option.value =
                agent.userId;


            /*
             * Use name if available.
             * Otherwise fall back to email.
             */

            if (agent.firstName ||
                agent.lastName) {

                option.textContent =
                    (agent.firstName || "") +
                    " " +
                    (agent.lastName || "");

            } else {

                option.textContent =
                    agent.email ||
                    "Agent #" + agent.userId;

            }


            select.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Error loading agents:",
            error
        );

        throw error;

    }

}


/* =========================================
   LOAD EXISTING PROPERTY
========================================= */

async function loadProperty(id) {

    try {

        const property =
            await api.get(
                "/Property/Find",
                {
                    propertyId: id
                }
            );


        /*
         * Change page title
         */

        document.getElementById(
            "page-title"
        ).textContent =
            "Edit Property";


        document.getElementById(
            "page-description"
        ).textContent =
            "Update the property information.";


        /*
         * Fill form
         */

        document.getElementById(
            "address"
        ).value =
            property.address || "";


        document.getElementById(
            "bedrooms"
        ).value =
            property.bedrooms;


        document.getElementById(
            "bathrooms"
        ).value =
            property.bathrooms;


        document.getElementById(
            "squareFootage"
        ).value =
            property.squareFootage;


        document.getElementById(
            "description"
        ).value =
            property.description || "";


        document.getElementById(
            "propertyTypeId"
        ).value =
            property.propertyTypeId;


        document.getElementById(
            "cityId"
        ).value =
            property.cityId;


        document.getElementById(
            "agentId"
        ).value =
            property.agentId;


        document.getElementById(
            "save-button"
        ).textContent =
            "Update Property";


    } catch (error) {

        console.error(error);

        showError(
            "Unable to load this property."
        );

    }

}


/* =========================================
   SAVE PROPERTY
========================================= */

async function saveProperty(event) {

    event.preventDefault();


    hideError();


    /*
     * Read values
     */

    const address =
        document.getElementById(
            "address"
        ).value.trim();


    const bedrooms =
        parseInt(
            document.getElementById(
                "bedrooms"
            ).value
        );


    const bathrooms =
        parseInt(
            document.getElementById(
                "bathrooms"
            ).value
        );


    const squareFootage =
        parseInt(
            document.getElementById(
                "squareFootage"
            ).value
        );


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    const propertyTypeId =
        parseInt(
            document.getElementById(
                "propertyTypeId"
            ).value
        );


    const cityId =
        parseInt(
            document.getElementById(
                "cityId"
            ).value
        );


    const agentId =
        parseInt(
            document.getElementById(
                "agentId"
            ).value
        );


    /*
     * Frontend validation
     */

    if (!address) {

        showError(
            "Property address is required."
        );

        return;
    }


    if (isNaN(bedrooms) ||
        bedrooms < 0) {

        showError(
            "Bedrooms must be 0 or greater."
        );

        return;
    }


    if (isNaN(bathrooms) ||
        bathrooms < 0) {

        showError(
            "Bathrooms must be 0 or greater."
        );

        return;
    }


    if (isNaN(squareFootage) ||
        squareFootage <= 0) {

        showError(
            "Square footage must be greater than 0."
        );

        return;
    }


    if (isNaN(propertyTypeId)) {

        showError(
            "Please select a property type."
        );

        return;
    }


    if (isNaN(cityId)) {

        showError(
            "Please select a city."
        );

        return;
    }


    if (isNaN(agentId)) {

        showError(
            "Please select an agent."
        );

        return;
    }


    /*
     * Create object matching
     * the C# Property model.
     */

    const property = {

        address: address,

        bedrooms: bedrooms,

        bathrooms: bathrooms,

        squareFootage: squareFootage,

        description:
            description || null,

        propertyTypeId:
            propertyTypeId,

        cityId:
            cityId,

        agentId:
            agentId

    };


    const button =
        document.getElementById(
            "save-button"
        );


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {

        /*
         * UPDATE
         */

        if (editingPropertyId !== null) {

            property.propertyId =
                editingPropertyId;


            await api.put(
                "/Property",
                property
            );


            showToast(
                "Property updated successfully."
            );

        }


        /*
         * CREATE
         */

        else {

            await api.post(
                "/Property",
                property
            );


            showToast(
                "Property created successfully."
            );

        }


        /*
         * Return to property list
         */

        setTimeout(
            function () {

                window.location.href =
                    "/Properties.html";

            },
            800
        );


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to save property."
        );


        button.disabled = false;

        button.textContent =
            editingPropertyId !== null
                ? "Update Property"
                : "Save Property";

    }

}


/* =========================================
   ERROR MESSAGE
========================================= */

function showError(message) {

    const errorBox =
        document.getElementById(
            "form-error"
        );


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "d-none"
    );

}


function hideError() {

    const errorBox =
        document.getElementById(
            "form-error"
        );


    errorBox.textContent =
        "";


    errorBox.classList.add(
        "d-none"
    );

}


/* =========================================
   FORM SUBMIT
========================================= */

document
    .getElementById("property-form")
    .addEventListener(
        "submit",
        saveProperty
    );


/* =========================================
   START PAGE
========================================= */

initPropertyForm();