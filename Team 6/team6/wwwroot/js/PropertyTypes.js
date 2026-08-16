let propertyTypes = [];

let selectedTypeId = null;


/* =========================================
   INITIALIZE
========================================= */

async function initPropertyTypes() {

    await loadPropertyTypes();

}


/* =========================================
   LOAD PROPERTY TYPES
========================================= */

async function loadPropertyTypes() {

    const loading =
        document.getElementById("loading");

    const tableContainer =
        document.getElementById("table-container");

    const emptyState =
        document.getElementById("empty-state");

    const tableBody =
        document.getElementById("type-table-body");


    loading.classList.remove("d-none");

    tableContainer.classList.add("d-none");

    emptyState.classList.add("d-none");

    tableBody.innerHTML = "";


    try {

        propertyTypes =
            await api.get("/PropertyType");


        updateCount();


        if (!propertyTypes ||
            propertyTypes.length === 0) {

            emptyState.classList.remove(
                "d-none"
            );

            return;
        }


        renderPropertyTypes();


        tableContainer.classList.remove(
            "d-none"
        );


    } catch (error) {

        console.error(
            "Error loading property types:",
            error
        );


        tableBody.innerHTML =

            '<tr>' +

            '<td colspan="3">' +

            '<div class="alert alert-danger mb-0">' +

            'Unable to load property types.' +

            '</div>' +

            '</td>' +

            '</tr>';


        tableContainer.classList.remove(
            "d-none"
        );


    } finally {

        loading.classList.add(
            "d-none"
        );

    }

}


/* =========================================
   RENDER
========================================= */

function renderPropertyTypes() {

    const tableBody =
        document.getElementById(
            "type-table-body"
        );


    let html = "";


    propertyTypes.forEach(
        function (type) {

            html +=

                '<tr>' +

                '<td>' +

                '<span class="text-muted">' +

                '#' +
                type.propertyTypeId +

                '</span>' +

                '</td>' +


                '<td>' +

                '<strong>' +

                escapeHtml(
                    type.typeName
                ) +

                '</strong>' +

                '</td>' +


                '<td class="text-end">' +

                '<button ' +

                'type="button" ' +

                'class="btn btn-sm btn-outline-ink me-2" ' +

                'onclick="editPropertyType(' +

                type.propertyTypeId +

                ')">' +

                'Edit' +

                '</button>' +


                '<button ' +

                'type="button" ' +

                'class="btn btn-sm btn-ghost-danger" ' +

                'onclick="openDeleteModal(' +

                type.propertyTypeId +

                ')">' +

                'Delete' +

                '</button>' +

                '</td>' +

                '</tr>';

        }
    );


    tableBody.innerHTML = html;

}


/* =========================================
   UPDATE COUNT
========================================= */

function updateCount() {

    const count =
        document.getElementById(
            "type-count"
        );


    const number =
        propertyTypes.length;


    count.textContent =
        number +
        (number === 1
            ? " type"
            : " types");

}


/* =========================================
   OPEN ADD MODAL
========================================= */

function openAddModal() {

    selectedTypeId = null;


    document.getElementById(
        "modal-title"
    ).textContent =
        "Add Property Type";


    document.getElementById(
        "type-id"
    ).value = "";


    document.getElementById(
        "type-name"
    ).value = "";


    document.getElementById(
        "save-type-button"
    ).textContent =
        "Save";


    hideFormError();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "typeModal"
            )
        );


    modal.show();

}


/* =========================================
   EDIT
========================================= */

async function editPropertyType(id) {

    selectedTypeId = id;


    try {

        const type =
            await api.get(
                "/PropertyType/Find",
                {
                    propertyTypeId: id
                }
            );


        document.getElementById(
            "modal-title"
        ).textContent =
            "Edit Property Type";


        document.getElementById(
            "type-id"
        ).value =
            type.propertyTypeId;


        document.getElementById(
            "type-name"
        ).value =
            type.typeName;


        document.getElementById(
            "save-type-button"
        ).textContent =
            "Update";


        hideFormError();


        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "typeModal"
                )
            );


        modal.show();


    } catch (error) {

        console.error(error);


        showToast(
            error.message ||
            "Unable to load property type.",
            "error"
        );

    }

}


/* =========================================
   SAVE
========================================= */

async function savePropertyType(event) {

    event.preventDefault();


    hideFormError();


    const name =
        document.getElementById(
            "type-name"
        ).value.trim();


    if (!name) {

        showFormError(
            "Property type name is required."
        );

        return;

    }


    const button =
        document.getElementById(
            "save-type-button"
        );


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {

        /* UPDATE */

        if (selectedTypeId !== null) {

            const data = {

                propertyTypeId:
                    selectedTypeId,

                typeName:
                    name

            };


            await api.put(
                "/PropertyType",
                data
            );


            showToast(
                "Property type updated successfully."
            );

        }


        /* CREATE */

        else {

            const data = {

                typeName:
                    name

            };


            await api.post(
                "/PropertyType",
                data
            );


            showToast(
                "Property type created successfully."
            );

        }


        const modalElement =
            document.getElementById(
                "typeModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        modal.hide();


        await loadPropertyTypes();


    } catch (error) {

        console.error(error);


        showFormError(
            error.message ||
            "Unable to save property type."
        );


    } finally {

        button.disabled = false;


        button.textContent =
            selectedTypeId !== null
                ? "Update"
                : "Save";

    }

}


/* =========================================
   DELETE MODAL
========================================= */

function openDeleteModal(id) {

    selectedTypeId = id;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "deleteModal"
            )
        );


    modal.show();

}


/* =========================================
   DELETE
========================================= */

async function deletePropertyType() {

    if (selectedTypeId === null) {

        return;

    }


    const button =
        document.getElementById(
            "confirm-delete"
        );


    button.disabled = true;

    button.textContent =
        "Deleting...";


    try {

        await api.delete(
            "/PropertyType",
            {
                propertyTypeId:
                    selectedTypeId
            }
        );


        const modalElement =
            document.getElementById(
                "deleteModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        modal.hide();


        showToast(
            "Property type deleted successfully."
        );


        selectedTypeId = null;


        await loadPropertyTypes();


    } catch (error) {

        console.error(error);


        showToast(
            error.message ||
            "Unable to delete property type.",
            "error"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "Delete";

    }

}


/* =========================================
   FORM ERROR
========================================= */

function showFormError(message) {

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


function hideFormError() {

    const errorBox =
        document.getElementById(
            "form-error"
        );


    errorBox.textContent = "";


    errorBox.classList.add(
        "d-none"
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

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


/* =========================================
   BUTTON EVENTS
========================================= */

document
    .getElementById(
        "add-type-button"
    )
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById(
        "empty-add-button"
    )
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById(
        "type-form"
    )
    .addEventListener(
        "submit",
        savePropertyType
    );


document
    .getElementById(
        "confirm-delete"
    )
    .addEventListener(
        "click",
        deletePropertyType
    );


/* =========================================
   START
========================================= */

initPropertyTypes();