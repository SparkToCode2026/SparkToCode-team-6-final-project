let editingAmenityId = null;


// Display amenities in table
function displayAmenities(amenities) {

    const tableBody =
        document.getElementById('amenitiesTableBody');

    tableBody.innerHTML = '';

    amenities.forEach(amenity => {

        const row = `
            <tr>

                <td>${amenity.amenityId}</td>

                <td>${amenity.name}</td>

                <td>

                    <button class="btn btn-warning btn-sm"
                            onclick="editAmenity(${amenity.amenityId})">
                        Edit
                    </button>

                    <button class="btn btn-primary btn-sm"
                            onclick="changeName(${amenity.amenityId})">
                        Change Name
                    </button>

                    <button class="btn btn-danger btn-sm"
                            onclick="deleteAmenity(${amenity.amenityId})">
                        Delete
                    </button>

                </td>

            </tr>
        `;

        tableBody.innerHTML += row;
    });
}


// Get all amenities
function loadAmenities() {

    fetch('/api/Amenity')

        .then(response => response.json())

        .then(amenities => {

            displayAmenities(amenities);

            document.getElementById('totalAmenities').innerText = '';

        })

        .catch(error => {

            console.error(
                'Error loading amenities:',
                error
            );

        });
}


// Add or Update Amenity
document.getElementById('amenityForm')
    .addEventListener('submit', function (event) {

        event.preventDefault();

        const amenityName =
            document.getElementById('amenityName').value;


        // UPDATE
        if (editingAmenityId !== null) {

            const amenity = {

                amenityId: editingAmenityId,

                name: amenityName
            };


            fetch('/api/Amenity', {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(amenity)

            })

                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            'Failed to update amenity'
                        );
                    }

                    return response.json();

                })

                .then(data => {

                    alert(
                        'Amenity updated successfully!'
                    );

                    cancelEdit();

                    loadAmenities();

                })

                .catch(error => {

                    console.error(
                        'Error updating amenity:',
                        error
                    );

                });

        }


        // ADD
        else {

            const amenity = {

                name: amenityName
            };


            fetch('/api/Amenity', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(amenity)

            })

                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            'Failed to add amenity'
                        );
                    }

                    return response.json();

                })

                .then(data => {

                    alert(
                        'Amenity added successfully!'
                    );

                    document.getElementById(
                        'amenityForm'
                    ).reset();

                    loadAmenities();

                })

                .catch(error => {

                    console.error(
                        'Error adding amenity:',
                        error
                    );

                });

        }

    });


// Edit Amenity
function editAmenity(amenityId) {

    fetch(`/api/Amenity/Find?amenityId=${amenityId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Amenity not found'
                );
            }

            return response.json();

        })

        .then(amenity => {

            editingAmenityId =
                amenity.amenityId;

            document.getElementById(
                'amenityName'
            ).value = amenity.name;

            document.getElementById(
                'submitButton'
            ).innerText = 'Update Amenity';

            document.getElementById(
                'cancelButton'
            ).style.display = 'inline-block';

            window.scrollTo(0, 0);

        })

        .catch(error => {

            console.error(
                'Error loading amenity:',
                error
            );

        });

}


// Cancel Edit
function cancelEdit() {

    editingAmenityId = null;

    document.getElementById(
        'amenityForm'
    ).reset();

    document.getElementById(
        'submitButton'
    ).innerText = 'Add Amenity';

    document.getElementById(
        'cancelButton'
    ).style.display = 'none';

}


// Change Name only
function changeName(amenityId) {

    const newName =
        prompt('Enter the new amenity name:');


    if (newName === null ||
        newName.trim() === '') {

        return;
    }


    fetch(
        `/api/Amenity/ChangeName?amenityId=${amenityId}&newName=${encodeURIComponent(newName)}`,
        {
            method: 'PATCH'
        }
    )

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Failed to change amenity name'
                );
            }

            return response.json();

        })

        .then(data => {

            alert(
                'Amenity name changed successfully!'
            );

            loadAmenities();

        })

        .catch(error => {

            console.error(
                'Error changing amenity name:',
                error
            );

        });

}


// Delete Amenity
function deleteAmenity(amenityId) {

    if (confirm(
        'Are you sure you want to delete this amenity?'
    )) {

        fetch(
            `/api/Amenity?amenityId=${amenityId}`,
            {
                method: 'DELETE'
            }
        )

            .then(response => {

                if (!response.ok) {
                    throw new Error(
                        'Failed to delete amenity'
                    );
                }

                alert(
                    'Amenity deleted successfully!'
                );

                loadAmenities();

            })

            .catch(error => {

                console.error(
                    'Error deleting amenity:',
                    error
                );

            });

    }

}


// Filter by Name
function filterAmenities() {

    const name =
        document.getElementById(
            'filterName'
        ).value;


    if (name.trim() === '') {

        alert(
            'Please enter an amenity name.'
        );

        return;
    }


    fetch(
        `/api/Amenity/FilterByName?name=${encodeURIComponent(name)}`
    )

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'No amenities found'
                );
            }

            return response.json();

        })

        .then(amenities => {

            displayAmenities(amenities);

        })

        .catch(error => {

            alert(
                'No amenities found with this name.'
            );

            console.error(error);

        });

}


// Sort Amenities by Name
function sortAmenities() {

    fetch('/api/Amenity/SortByName')

        .then(response => response.json())

        .then(result => {

            displayAmenities(
                result.amenities
            );

            document.getElementById(
                'totalAmenities'
            ).innerText =
                'Total Amenities: ' +
                result.totalAmenities;

        })

        .catch(error => {

            console.error(
                'Error sorting amenities:',
                error
            );

        });

}


// Load amenities when page opens
loadAmenities();