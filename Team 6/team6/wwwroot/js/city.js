let editingCityId = null;


// Display cities in table
function displayCities(cities) {

    const tableBody = document.getElementById('citiesTableBody');

    tableBody.innerHTML = '';

    cities.forEach(city => {

        const row = `
            <tr>
                <td>${city.cityId}</td>
                <td>${city.cityName}</td>
                <td>${city.state}</td>
                <td>

                    <button class="btn btn-warning btn-sm"
                            onclick="editCity(${city.cityId})">
                        Edit
                    </button>

                    <button class="btn btn-primary btn-sm"
                            onclick="changeState(${city.cityId})">
                        Change State
                    </button>

                    <button class="btn btn-danger btn-sm"
                            onclick="deleteCity(${city.cityId})">
                        Delete
                    </button>

                </td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });
}


// Get all cities
function loadCities() {

    fetch('/api/City')
        .then(response => response.json())
        .then(cities => {
            displayCities(cities);
        })
        .catch(error => {
            console.error('Error loading cities:', error);
        });
}


// Add or Update City
document.getElementById('cityForm').addEventListener('submit', function (event) {

    event.preventDefault();

    const cityName = document.getElementById('cityName').value;
    const state = document.getElementById('state').value;


    // UPDATE
    if (editingCityId !== null) {

        const city = {
            cityId: editingCityId,
            cityName: cityName,
            state: state
        };

        fetch('/api/City', {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(city)

        })
            .then(response => {

                if (!response.ok) {
                    throw new Error('Failed to update city');
                }

                return response.json();
            })

            .then(data => {

                alert('City updated successfully!');

                cancelEdit();

                loadCities();
            })

            .catch(error => {
                console.error('Error updating city:', error);
            });
    }


    // ADD
    else {

        const city = {
            cityName: cityName,
            state: state
        };

        fetch('/api/City', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(city)

        })
            .then(response => {

                if (!response.ok) {
                    throw new Error('Failed to add city');
                }

                return response.json();
            })

            .then(data => {

                alert('City added successfully!');

                document.getElementById('cityForm').reset();

                loadCities();
            })

            .catch(error => {
                console.error('Error adding city:', error);
            });
    }

});


// Edit City
function editCity(cityId) {

    fetch(`/api/City/Find?cityId=${cityId}`)

        .then(response => response.json())

        .then(city => {

            editingCityId = city.cityId;

            document.getElementById('cityName').value = city.cityName;
            document.getElementById('state').value = city.state;

            document.getElementById('submitButton').innerText = 'Update City';

            document.getElementById('cancelButton').style.display = 'inline-block';

            window.scrollTo(0, 0);
        })

        .catch(error => {
            console.error('Error loading city:', error);
        });
}


// Cancel Edit
function cancelEdit() {

    editingCityId = null;

    document.getElementById('cityForm').reset();

    document.getElementById('submitButton').innerText = 'Add City';

    document.getElementById('cancelButton').style.display = 'none';
}


// Change State only
function changeState(cityId) {

    const newState = prompt('Enter the new state:');

    if (newState === null || newState.trim() === '') {
        return;
    }

    fetch(`/api/City/ChangeState?cityId=${cityId}&newState=${encodeURIComponent(newState)}`, {
        method: 'PATCH'
    })
        .then(response => {

            if (!response.ok) {
                throw new Error('Failed to change state');
            }

            return response.json();
        })

        .then(data => {

            alert('State changed successfully!');

            loadCities();
        })

        .catch(error => {
            console.error('Error changing state:', error);
        });
}


// Delete City
function deleteCity(cityId) {

    if (confirm('Are you sure you want to delete this city?')) {

        fetch(`/api/City?cityId=${cityId}`, {
            method: 'DELETE'
        })

            .then(response => {

                if (!response.ok) {
                    throw new Error('Failed to delete city');
                }

                alert('City deleted successfully!');

                loadCities();
            })

            .catch(error => {
                console.error('Error deleting city:', error);
            });
    }
}


// Filter Cities by State
function filterCities() {

    const state = document.getElementById('filterState').value;

    if (state.trim() === '') {
        alert('Please enter a state.');
        return;
    }

    fetch(`/api/City/FilterByState?state=${encodeURIComponent(state)}`)

        .then(response => {

            if (!response.ok) {
                throw new Error('No cities found');
            }

            return response.json();
        })

        .then(cities => {
            displayCities(cities);
        })

        .catch(error => {

            alert('No cities found in this state.');

            console.error(error);
        });
}


// Sort Cities by Name
function sortCities() {

    fetch('/api/City/SortByName')

        .then(response => response.json())

        .then(cities => {
            displayCities(cities);
        })

        .catch(error => {
            console.error('Error sorting cities:', error);
        });
}


// Load cities when page opens
loadCities();