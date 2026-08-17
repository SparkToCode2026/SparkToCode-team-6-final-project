let viewings = [];

let listings = [];

let users = [];

let selectedViewingId = null;


/* =========================================
   API HELPER
========================================= */

async function apiRequest(url, options) {

    const response =
        await fetch(url, options);


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Request failed."
        );

    }


    if (response.status === 204) {

        return null;

    }


    return response.json();

}


/* =========================================
   INITIALIZE
========================================= */

async function initViewings() {

    try {

        await loadListings();

        await loadUsers();

        await loadViewings();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================
   LOAD LISTINGS
========================================= */

async function loadListings() {

    try {

        listings =
            await apiRequest(
                "/api/Listings"
            );


        const select =
            document.getElementById(
                "listing-id"
            );


        listings.forEach(
            function (listing) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    listing.listingId;


                option.textContent =
                    "#" +
                    listing.listingId +
                    " - " +
                    formatPrice(
                        listing.price
                    ) +
                    " - " +
                    (
                        listing.status ||
                        "Active"
                    );


                select.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading listings:",
            error
        );

        throw error;

    }

}


/* =========================================
   LOAD USERS
========================================= */

async function loadUsers() {

    try {

        users =
            await apiRequest(
                "/api/User"
            );


        const select =
            document.getElementById(
                "user-id"
            );


        users.forEach(
            function (user) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    user.userId;


                option.textContent =
                    user.name ||
                    user.email ||
                    "User #" +
                    user.userId;


                select.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading users:",
            error
        );

        throw error;

    }

}


/* =========================================
   LOAD VIEWINGS
========================================= */

async function loadViewings() {

    const loading =
        document.getElementById(
            "loading"
        );


    const grid =
        document.getElementById(
            "viewing-grid"
        );


    const emptyState =
        document.getElementById(
            "empty-state"
        );


    loading.classList.remove(
        "d-none"
    );


    emptyState.classList.add(
        "d-none"
    );


    grid.innerHTML = "";


    try {

        viewings =
            await apiRequest(
                "/api/Viewings"
            );


        updateViewingCount();


        if (!viewings ||
            viewings.length === 0) {

            emptyState.classList.remove(
                "d-none"
            );

            return;

        }


        renderViewings();


    } catch (error) {

        console.error(
            "Error loading viewings:",
            error
        );


        grid.innerHTML =

            '<div class="col-12">' +

            '<div class="alert alert-danger">' +

            'Unable to load viewings.' +

            '</div>' +

            '</div>';

    }


    finally {

        loading.classList.add(
            "d-none"
        );

    }

}


/* =========================================
   COUNT
========================================= */

function updateViewingCount() {

    const count =
        document.getElementById(
            "viewing-count"
        );


    const number =
        viewings.length;


    count.textContent =
        number +
        (
            number === 1
                ? " viewing"
                : " viewings"
        );

}


/* =========================================
   RENDER VIEWINGS
========================================= */

function renderViewings() {

    const grid =
        document.getElementById(
            "viewing-grid"
        );


    let html = "";


    viewings.forEach(
        function (viewing) {


            const listing =
                listings.find(
                    function (item) {

                        return item.listingId ===
                            viewing.listingId;

                    }
                );


            const user =
                users.find(
                    function (item) {

                        return item.userId ===
                            viewing.userId;

                    }
                );


            const propertyText =
                listing
                    ? (
                        listing.property &&
                            listing.property.address
                            ? listing.property.address
                            : "Listing #" +
                            listing.listingId
                    )
                    : "Listing #" +
                    viewing.listingId;


            const userText =
                user
                    ? (
                        user.name ||
                        user.email ||
                        "User #" +
                        user.userId
                    )
                    : "User #" +
                    viewing.userId;


            const status =
                viewing.status ||
                "Scheduled";


            const statusClass =
                getStatusClass(
                    status
                );


            html +=

                '<div class="col-md-6 col-lg-4">' +

                '<div class="stub-card h-100">' +


                '<div class="stub-top">' +

                '<div class="d-flex ' +
                'justify-content-between ' +
                'align-items-start">' +

                '<span class="' +
                statusClass +
                '">' +

                escapeHtml(
                    status
                ) +

                '</span>' +


                '<span class="text-muted">' +

                "#" +
                viewing.viewingId +

                '</span>' +

                '</div>' +


                '<h5 class="mt-3 mb-1">' +

                escapeHtml(
                    propertyText
                ) +

                '</h5>' +


                '<div class="stub-meta">' +

                'Listing #' +
                viewing.listingId +

                '</div>' +

                '</div>' +


                '<div class="stub-body">' +


                '<div class="mb-3">' +

                '<div class="small text-muted">' +

                'Customer' +

                '</div>' +

                '<strong>' +

                escapeHtml(
                    userText
                ) +

                '</strong>' +

                '</div>' +


                '<div class="mb-4">' +

                '<div class="small text-muted">' +

                'Viewing Date' +

                '</div>' +

                '<strong>' +

                formatDate(
                    viewing.viewingDate
                ) +

                '</strong>' +

                '</div>' +


                '<div class="d-flex gap-2">' +

                '<button ' +

                'type="button" ' +

                'class="btn btn-outline-ink btn-sm flex-fill" ' +

                'onclick="editViewing(' +

                viewing.viewingId +

                ')">' +

                'Edit' +

                '</button>' +


                '<button ' +

                'type="button" ' +

                'class="btn btn-ghost-danger btn-sm flex-fill" ' +

                'onclick="openDeleteModal(' +

                viewing.viewingId +

                ')">' +

                'Delete' +

                '</button>' +

                '</div>' +

                '</div>' +

                '</div>' +

                '</div>';

        }
    );


    grid.innerHTML =
        html;

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase();


    if (value === "completed") {

        return "stamp stamp-active";

    }


    if (value === "cancelled") {

        return "stamp stamp-danger";

    }


    return "stamp stamp-pending";

}


/* =========================================
   PRICE
========================================= */

function formatPrice(price) {

    if (price === null ||
        price === undefined) {

        return "OMR 0";

    }


    return "OMR " +
        Number(price).toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* =========================================
   DATE
========================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "No date";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "Invalid date";

    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* =========================================
   CONVERT DATE TO INPUT
========================================= */

function toDateTimeLocal(dateValue) {

    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hours +
        ":" +
        minutes
    );

}


/* =========================================
   ADD VIEWING
========================================= */

function openAddModal() {

    selectedViewingId =
        null;


    document.getElementById(
        "modal-title"
    ).textContent =
        "Book Viewing";


    document.getElementById(
        "viewing-form"
    ).reset();


    document.getElementById(
        "save-viewing-button"
    ).textContent =
        "Book Viewing";


    document.getElementById(
        "listing-id"
    ).disabled = false;


    document.getElementById(
        "user-id"
    ).disabled = false;


    document.getElementById(
        "status-container"
    ).classList.add(
        "d-none"
    );


    hideFormError();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "viewingModal"
            )
        );


    modal.show();

}


/* =========================================
   EDIT VIEWING
========================================= */

async function editViewing(id) {

    selectedViewingId =
        id;


    try {

        const viewing =
            await apiRequest(
                "/api/Viewings/" +
                id
            );


        document.getElementById(
            "modal-title"
        ).textContent =
            "Edit Viewing";


        document.getElementById(
            "listing-id"
        ).value =
            viewing.listingId;


        document.getElementById(
            "user-id"
        ).value =
            viewing.userId;


        document.getElementById(
            "viewing-date"
        ).value =
            toDateTimeLocal(
                viewing.viewingDate
            );


        document.getElementById(
            "viewing-status"
        ).value =
            viewing.status ||
            "Scheduled";


        document.getElementById(
            "listing-id"
        ).disabled = true;


        document.getElementById(
            "user-id"
        ).disabled = true;


        document.getElementById(
            "status-container"
        ).classList.remove(
            "d-none"
        );


        document.getElementById(
            "save-viewing-button"
        ).textContent =
            "Update";


        hideFormError();


        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "viewingModal"
                )
            );


        modal.show();


    } catch (error) {

        console.error(error);


        showToast(
            error.message ||
            "Unable to load viewing.",
            "error"
        );

    }

}


/* =========================================
   SAVE VIEWING
========================================= */

async function saveViewing(event) {

    event.preventDefault();


    hideFormError();


    const listingId =
        parseInt(
            document.getElementById(
                "listing-id"
            ).value
        );


    const userId =
        parseInt(
            document.getElementById(
                "user-id"
            ).value
        );


    const dateValue =
        document.getElementById(
            "viewing-date"
        ).value;


    const status =
        document.getElementById(
            "viewing-status"
        ).value;


    if (isNaN(listingId)) {

        showFormError(
            "Please select a listing."
        );

        return;

    }


    if (isNaN(userId)) {

        showFormError(
            "Please select a customer."
        );

        return;

    }


    if (!dateValue) {

        showFormError(
            "Please select a viewing date and time."
        );

        return;

    }


    const viewingDate =
        new Date(
            dateValue
        ).toISOString();


    const button =
        document.getElementById(
            "save-viewing-button"
        );


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {


        /* =================================
           CREATE
        ================================= */

        if (selectedViewingId === null) {

            const data = {

                viewingDate:
                    viewingDate,

                status:
                    "Scheduled",

                listingId:
                    listingId,

                userId:
                    userId

            };


            await apiRequest(
                "/api/Viewings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


            showToast(
                "Viewing booked successfully."
            );

        }


        /* =================================
           UPDATE
        ================================= */

        else {

            const data = {

                viewingId:
                    selectedViewingId,

                viewingDate:
                    viewingDate,

                status:
                    status,

                listingId:
                    listingId,

                userId:
                    userId

            };


            await apiRequest(
                "/api/Viewings/" +
                selectedViewingId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


            /*
             * Update status separately because
             * the backend PUT endpoint only
             * updates ViewingDate.
             */

            await apiRequest(
                "/api/Viewings/" +
                selectedViewingId +
                "/status",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            status
                        )
                }
            );


            showToast(
                "Viewing updated successfully."
            );

        }


        const modalElement =
            document.getElementById(
                "viewingModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        modal.hide();


        await loadViewings();


    } catch (error) {

        console.error(error);


        showFormError(
            error.message ||
            "Unable to save viewing."
        );


    } finally {

        button.disabled = false;


        button.textContent =
            selectedViewingId !== null
                ? "Update"
                : "Book Viewing";

    }

}


/* =========================================
   DELETE MODAL
========================================= */

function openDeleteModal(id) {

    selectedViewingId =
        id;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "deleteModal"
            )
        );


    modal.show();

}


/* =========================================
   DELETE VIEWING
========================================= */

async function deleteViewing() {

    if (selectedViewingId === null) {

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

        await apiRequest(
            "/api/Viewings/" +
            selectedViewingId,
            {
                method: "DELETE"
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
            "Viewing deleted successfully."
        );


        selectedViewingId =
            null;


        await loadViewings();


    } catch (error) {

        console.error(error);


        showToast(
            error.message ||
            "Unable to delete viewing.",
            "error"
        );

    }


    finally {

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


    errorBox.textContent =
        "";


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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   BUTTON EVENTS
========================================= */

document
    .getElementById(
        "add-viewing-button"
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
        "viewing-form"
    )
    .addEventListener(
        "submit",
        saveViewing
    );


document
    .getElementById(
        "confirm-delete"
    )
    .addEventListener(
        "click",
        deleteViewing
    );


/* =========================================
   START
========================================= */

initViewings();