let listings = [];

let properties = [];

let selectedListingId = null;


/* =========================================
   INITIALIZE
========================================= */

async function initListings() {

    try {

        await loadProperties();

        await loadListings();

    } catch (error) {

        console.error(
            "Unable to initialize listings:",
            error
        );

    }

}


/* =========================================
   LOAD PROPERTIES
========================================= */

async function loadProperties() {

    try {

        properties =
            await api.get("/Property");


        const select =
            document.getElementById(
                "property-id"
            );


        if (!select) {

            return;

        }


        select.innerHTML =
            '<option value="">Select property</option>';


        if (!properties ||
            properties.length === 0) {

            return;

        }


        properties.forEach(
            function (property) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    property.propertyId;


                option.textContent =
                    "#" +
                    property.propertyId +
                    " - " +
                    (
                        property.address ||
                        "Property"
                    );


                select.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load properties:",
            error
        );

        throw error;

    }

}


/* =========================================
   LOAD LISTINGS
========================================= */

async function loadListings() {

    const loading =
        document.getElementById(
            "loading"
        );


    const grid =
        document.getElementById(
            "listing-grid"
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

        listings =
            await api.get("/Listings");


        /*
         * Make sure we always have an array.
         */

        if (!Array.isArray(listings)) {

            listings = [];

        }


        updateListingCount();


        if (listings.length === 0) {

            emptyState.classList.remove(
                "d-none"
            );

            return;

        }


        renderListings();


    } catch (error) {

        console.error(
            "Unable to load listings:",
            error
        );


        updateListingCount();


        grid.innerHTML =

            '<div class="col-12">' +

            '<div class="alert alert-danger">' +

            'Unable to load listings. ' +

            escapeHtml(
                error.message ||
                "Please try again."
            ) +

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

function updateListingCount() {

    const count =
        document.getElementById(
            "listing-count"
        );


    if (!count) {

        return;

    }


    const number =
        listings.length;


    count.textContent =
        number +
        (
            number === 1
                ? " listing"
                : " listings"
        );

}


/* =========================================
   RENDER LISTINGS
========================================= */

function renderListings() {

    const grid =
        document.getElementById(
            "listing-grid"
        );


    let html = "";


    listings.forEach(
        function (listing) {


            /*
             * Try to get the property directly
             * from the listing first.
             */

            let property =
                listing.property ||
                null;


            /*
             * If property is not included
             * in the API response, find it
             * from the properties array.
             */

            if (!property) {

                property =
                    properties.find(
                        function (item) {

                            return Number(
                                item.propertyId
                            ) === Number(
                                listing.propertyId
                            );

                        }
                    );

            }


            const address =
                property &&
                    property.address

                    ? property.address

                    : "Property #" +
                    listing.propertyId;


            const status =
                listing.status ||
                "Available";


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
                listing.listingId +

                '</span>' +

                '</div>' +


                '<h5 class="mt-3 mb-1">' +

                escapeHtml(
                    address
                ) +

                '</h5>' +


                '<div class="stub-meta">' +

                'Property #' +
                listing.propertyId +

                '</div>' +

                '</div>' +


                '<div class="stub-body">' +


                '<div class="mb-4">' +

                '<div class="small text-muted">' +

                'Listing Price' +

                '</div>' +


                '<div class="fs-4 fw-bold">' +

                formatPrice(
                    listing.price
                ) +

                '</div>' +

                '</div>' +


                '<div class="d-flex gap-2">' +

                '<button ' +

                'type="button" ' +

                'class="btn btn-outline-ink btn-sm flex-fill" ' +

                'onclick="editListing(' +

                listing.listingId +

                ')">' +

                'Edit' +

                '</button>' +


                '<button ' +

                'type="button" ' +

                'class="btn btn-ghost-danger btn-sm flex-fill" ' +

                'onclick="openDeleteModal(' +

                listing.listingId +

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

    const normalized =
        String(status)
            .toLowerCase();


    if (normalized === "sold") {

        return "stamp stamp-danger";

    }


    if (normalized === "pending") {

        return "stamp stamp-pending";

    }


    if (normalized === "rented") {

        return "stamp stamp-pending";

    }


    return "stamp stamp-active";

}


/* =========================================
   PRICE
========================================= */

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {

        return "OMR 0.00";

    }


    const numericPrice =
        Number(price);


    if (isNaN(numericPrice)) {

        return "OMR 0.00";

    }


    return "OMR " +
        numericPrice.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* =========================================
   ADD LISTING
========================================= */

function openAddModal() {

    selectedListingId =
        null;


    document.getElementById(
        "modal-title"
    ).textContent =
        "Add Listing";


    document.getElementById(
        "listing-form"
    ).reset();


    document.getElementById(
        "save-listing-button"
    ).textContent =
        "Save";


    hideFormError();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "listingModal"
            )
        );


    modal.show();

}


/* =========================================
   EDIT LISTING
========================================= */

async function editListing(id) {

    selectedListingId =
        id;


    try {

        /*
         * CORRECT ENDPOINT:
         *
         * GET /api/Listings/{id}
         *
         * There is no /Listings/Find endpoint.
         */

        const listing =
            await api.get(
                "/Listings/" + id
            );


        document.getElementById(
            "modal-title"
        ).textContent =
            "Edit Listing";


        document.getElementById(
            "listing-id"
        ).value =
            listing.listingId;


        document.getElementById(
            "property-id"
        ).value =
            listing.propertyId;


        document.getElementById(
            "price"
        ).value =
            listing.price;


        document.getElementById(
            "status"
        ).value =
            listing.status;


        document.getElementById(
            "save-listing-button"
        ).textContent =
            "Update";


        hideFormError();


        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "listingModal"
                )
            );


        modal.show();


    } catch (error) {

        console.error(
            "Unable to load listing:",
            error
        );


        selectedListingId =
            null;


        showToast(
            error.message ||
            "Unable to load listing.",
            "error"
        );

    }

}


/* =========================================
   SAVE LISTING
========================================= */

async function saveListing(event) {

    event.preventDefault();


    hideFormError();


    const propertyId =
        parseInt(
            document.getElementById(
                "property-id"
            ).value
        );


    const price =
        parseFloat(
            document.getElementById(
                "price"
            ).value
        );


    const status =
        document.getElementById(
            "status"
        ).value;


    /* -------------------------------------
       VALIDATION
    ------------------------------------- */

    if (isNaN(propertyId)) {

        showFormError(
            "Please select a property."
        );

        return;

    }


    if (
        isNaN(price) ||
        price < 0
    ) {

        showFormError(
            "Please enter a valid price."
        );

        return;

    }


    if (!status) {

        showFormError(
            "Please select a listing status."
        );

        return;

    }


    const button =
        document.getElementById(
            "save-listing-button"
        );


    button.disabled =
        true;


    button.textContent =
        "Saving...";


    try {

        const data = {

            propertyId:
                propertyId,

            price:
                price,

            status:
                status

        };


        /* =================================
           UPDATE EXISTING LISTING
        ================================= */

        if (
            selectedListingId !== null
        ) {

            data.listingId =
                selectedListingId;


            /*
             * CORRECT ENDPOINT:
             *
             * PUT /api/Listings/{id}
             */

            await api.put(
                "/Listings/" +
                selectedListingId,
                data
            );


            showToast(
                "Listing updated successfully."
            );

        }


        /* =================================
           CREATE NEW LISTING
        ================================= */

        else {

            /*
             * POST /api/Listings
             */

            await api.post(
                "/Listings",
                data
            );


            showToast(
                "Listing created successfully."
            );

        }


        /* ---------------------------------
           CLOSE MODAL
        --------------------------------- */

        const modalElement =
            document.getElementById(
                "listingModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }


        /*
         * Reload listings after
         * successful create/update.
         */

        await loadListings();


    } catch (error) {

        console.error(
            "Unable to save listing:",
            error
        );


        showFormError(
            error.message ||
            "Unable to save listing."
        );

    }


    finally {

        button.disabled =
            false;


        button.textContent =
            selectedListingId !== null
                ? "Update"
                : "Save";

    }

}


/* =========================================
   DELETE MODAL
========================================= */

function openDeleteModal(id) {

    selectedListingId =
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
   DELETE LISTING
========================================= */

async function deleteListing() {

    if (
        selectedListingId === null
    ) {

        return;

    }


    const button =
        document.getElementById(
            "confirm-delete"
        );


    button.disabled =
        true;


    button.textContent =
        "Deleting...";


    try {

        /*
         * CORRECT ENDPOINT:
         *
         * DELETE /api/Listings/{id}
         */

        await api.delete(
            "/Listings/" +
            selectedListingId
        );


        /* ---------------------------------
           CLOSE MODAL
        --------------------------------- */

        const modalElement =
            document.getElementById(
                "deleteModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }


        showToast(
            "Listing deleted successfully."
        );


        selectedListingId =
            null;


        /*
         * Reload the list.
         */

        await loadListings();


    } catch (error) {

        console.error(
            "Unable to delete listing:",
            error
        );


        showToast(
            error.message ||
            "Unable to delete listing.",
            "error"
        );

    }


    finally {

        button.disabled =
            false;


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

    if (
        value === null ||
        value === undefined
    ) {

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
        "add-listing-button"
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
        "listing-form"
    )
    .addEventListener(
        "submit",
        saveListing
    );


document
    .getElementById(
        "confirm-delete"
    )
    .addEventListener(
        "click",
        deleteListing
    );


/* =========================================
   START
========================================= */

initListings();