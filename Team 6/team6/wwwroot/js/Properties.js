let citiesById = {};
let typesById = {};

async function init() {

    try {

        const cities = await api.get("/City");
        const types = await api.get("/PropertyType");

        cities.forEach(function (city) {
            citiesById[city.cityId] = city;
        });

        types.forEach(function (type) {
            typesById[type.propertyTypeId] = type;
        });

        const citySelect = document.getElementById("filter-city");

        cities.forEach(function (city) {

            const option = document.createElement("option");

            option.value = city.cityId;
            option.textContent = city.cityName + ", " + city.state;

            citySelect.appendChild(option);
        });

        const typeSelect = document.getElementById("filter-type");

        types.forEach(function (type) {

            const option = document.createElement("option");

            option.value = type.propertyTypeId;
            option.textContent = type.typeName;

            typeSelect.appendChild(option);
        });

    } catch (error) {

        console.error("Error loading filters:", error);

    }

    loadProperties();
}


async function loadProperties() {

    const grid = document.getElementById("property-grid");

    grid.innerHTML = "";

    const cityId =
        document.getElementById("filter-city").value;

    const propertyTypeId =
        document.getElementById("filter-type").value;

    const minBedrooms =
        document.getElementById("filter-bedrooms").value;

    try {

        let properties;

        if (cityId || propertyTypeId || minBedrooms) {

            properties = await api.get(
                "/Property/Filter",
                {
                    cityId: cityId,
                    propertyTypeId: propertyTypeId,
                    minBedrooms: minBedrooms
                }
            );

        } else {

            properties = await api.get("/Property");

        }

        renderProperties(properties);

    } catch (error) {

        console.error(error);

        grid.innerHTML =
            '<div class="col-12">' +
            '<div class="alert alert-danger">' +
            'Unable to load properties.' +
            '</div>' +
            '</div>';

    }
}


function renderProperties(properties) {

    const grid =
        document.getElementById("property-grid");

    const count =
        document.getElementById("property-count");

    const emptyState =
        document.getElementById("empty-state");


    count.textContent =
        properties.length +
        (properties.length === 1
            ? " property"
            : " properties");


    if (!properties || properties.length === 0) {

        emptyState.classList.remove("d-none");

        return;
    }


    emptyState.classList.add("d-none");


    let html = "";


    properties.forEach(function (property) {

        let cityLabel = "Unknown location";

        if (property.city) {

            cityLabel =
                property.city.cityName +
                ", " +
                property.city.state;

        } else if (citiesById[property.cityId]) {

            cityLabel =
                citiesById[property.cityId].cityName +
                ", " +
                citiesById[property.cityId].state;
        }


        let typeLabel = "Property";

        if (property.propertyType) {

            typeLabel =
                property.propertyType.typeName;

        } else if (typesById[property.propertyTypeId]) {

            typeLabel =
                typesById[property.propertyTypeId].typeName;
        }


        html +=

            '<div class="col-md-6 col-lg-4">' +

            '<div class="stub-card h-100">' +

            '<div class="stub-top">' +

            '<div class="d-flex justify-content-between">' +

            '<span class="stamp stamp-active">' +
            escapeHtml(typeLabel) +
            '</span>' +

            '<span class="text-muted">' +
            "#" + property.propertyId +
            '</span>' +

            '</div>' +

            '<h5 class="mt-3 mb-1">' +
            escapeHtml(property.address || "No address") +
            '</h5>' +

            '<div class="stub-meta">' +
            escapeHtml(cityLabel) +
            '</div>' +

            '</div>' +


            '<div class="stub-body">' +

            '<div class="row text-center mb-4">' +

            '<div class="col-4">' +

            '<strong>' +
            (property.bedrooms || 0) +
            '</strong>' +

            '<div class="small text-muted">' +
            'Bedrooms' +
            '</div>' +

            '</div>' +


            '<div class="col-4">' +

            '<strong>' +
            (property.bathrooms || 0) +
            '</strong>' +

            '<div class="small text-muted">' +
            'Bathrooms' +
            '</div>' +

            '</div>' +


            '<div class="col-4">' +

            '<strong>' +
            (property.squareFootage || 0) +
            '</strong>' +

            '<div class="small text-muted">' +
            'Sqft' +
            '</div>' +

            '</div>' +

            '</div>' +


            '<div class="d-flex gap-2">' +

            '<a href="/property-form.html?id=' +
            property.propertyId +
            '" class="btn btn-outline-ink btn-sm flex-fill">' +
            'Edit' +
            '</a>' +

            '<button ' +
            'class="btn btn-ghost-danger btn-sm flex-fill" ' +
            'onclick="deleteProperty(' +
            property.propertyId +
            ')">' +
            'Delete' +
            '</button>' +

            '</div>' +

            '</div>' +

            '</div>' +

            '</div>';
    });


    grid.innerHTML = html;
}


async function deleteProperty(id) {

    const confirmed =
        confirm(
            "Delete this property? This action cannot be undone."
        );

    if (!confirmed) {
        return;
    }


    try {

        await api.delete(
            "/Property",
            {
                propertyId: id
            }
        );


        showToast(
            "Property deleted."
        );


        loadProperties();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Could not delete property.",
            "error"
        );
    }
}


function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document
    .getElementById("filter-form")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            loadProperties();
        }
    );


document
    .getElementById("clear-filters")
    .addEventListener(
        "click",
        function () {

            document.getElementById(
                "filter-city"
            ).value = "";

            document.getElementById(
                "filter-type"
            ).value = "";

            document.getElementById(
                "filter-bedrooms"
            ).value = "";

            loadProperties();
        }
    );


init();