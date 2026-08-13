let editingUserId = null;


// Display Users
function displayUsers(users) {

    const tableBody =
        document.getElementById('usersTableBody');

    tableBody.innerHTML = '';

    users.forEach(user => {

        const row = `
            <tr>

                <td>${user.userId}</td>

                <td>${user.name}</td>

                <td>${user.email}</td>

                <td>${user.role}</td>

                <td>

                    <button class="btn btn-warning btn-sm"
                            onclick="editUser(${user.userId})">
                        Edit
                    </button>

                    <button class="btn btn-primary btn-sm"
                            onclick="changeRole(${user.userId})">
                        Change Role
                    </button>

                    <button class="btn btn-danger btn-sm"
                            onclick="deleteUser(${user.userId})">
                        Delete
                    </button>

                </td>

            </tr>
        `;

        tableBody.innerHTML += row;
    });
}


// CASE 5 - Get All Users
function loadUsers() {

    fetch('/api/User')

        .then(response => response.json())

        .then(users => {

            displayUsers(users);

            document.getElementById(
                'statistics'
            ).innerHTML = '';

        })

        .catch(error => {

            console.error(
                'Error loading users:',
                error
            );

        });
}


// CASE 1 and CASE 2
// Add or Update User
document.getElementById('userForm')
    .addEventListener('submit', function (event) {

        event.preventDefault();

        const name =
            document.getElementById('userName').value;

        const email =
            document.getElementById('userEmail').value;


        // CASE 2 - UPDATE USER
        if (editingUserId !== null) {

            const user = {

                userId: editingUserId,

                name: name,

                email: email,

                // Required by User model,
                // but UpdateUser does not change them.
                passwordHash: 'NotChanged',

                role: 'Client'
            };


            fetch(`/api/User/${editingUserId}`, {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(user)

            })

                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            'Failed to update user'
                        );
                    }

                    alert(
                        'User updated successfully!'
                    );

                    cancelEdit();

                    loadUsers();

                })

                .catch(error => {

                    console.error(
                        'Error updating user:',
                        error
                    );

                });

        }


        // CASE 1 - ADD USER
        else {

            const password =
                document.getElementById(
                    'userPassword'
                ).value;

            const role =
                document.getElementById(
                    'userRole'
                ).value;


            const user = {

                name: name,

                email: email,

                passwordHash: password,

                role: role
            };


            fetch('/api/User', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(user)

            })

                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            'Failed to add user'
                        );
                    }

                    return response.json();

                })

                .then(data => {

                    alert(
                        'User added successfully!'
                    );

                    document.getElementById(
                        'userForm'
                    ).reset();

                    loadUsers();

                })

                .catch(error => {

                    console.error(
                        'Error adding user:',
                        error
                    );

                    alert(
                        'Failed to add user.'
                    );

                });

        }

    });


// CASE 6 - Find User by ID
function findUser() {

    const userId =
        document.getElementById(
            'findUserId'
        ).value;


    if (userId === '') {

        alert('Please enter a User ID.');

        return;
    }


    fetch(`/api/User/${userId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'User not found'
                );
            }

            return response.json();

        })

        .then(user => {

            displayUsers([user]);

        })

        .catch(error => {

            alert('User not found.');

            console.error(error);

        });
}


// Edit User
function editUser(userId) {

    fetch(`/api/User/${userId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'User not found'
                );
            }

            return response.json();

        })

        .then(user => {

            editingUserId =
                user.userId;

            document.getElementById(
                'userName'
            ).value = user.name;

            document.getElementById(
                'userEmail'
            ).value = user.email;


            // Hide Password and Role during normal edit
            document.getElementById(
                'passwordSection'
            ).style.display = 'none';

            document.getElementById(
                'roleSection'
            ).style.display = 'none';


            document.getElementById(
                'userPassword'
            ).required = false;

            document.getElementById(
                'userRole'
            ).required = false;


            document.getElementById(
                'formTitle'
            ).innerText = 'Update User';

            document.getElementById(
                'submitButton'
            ).innerText = 'Update User';

            document.getElementById(
                'cancelButton'
            ).style.display = 'inline-block';


            window.scrollTo(0, 0);

        })

        .catch(error => {

            console.error(
                'Error loading user:',
                error
            );

        });

}


// Cancel Edit
function cancelEdit() {

    editingUserId = null;

    document.getElementById(
        'userForm'
    ).reset();


    document.getElementById(
        'passwordSection'
    ).style.display = 'block';

    document.getElementById(
        'roleSection'
    ).style.display = 'block';


    document.getElementById(
        'userPassword'
    ).required = true;

    document.getElementById(
        'userRole'
    ).required = true;


    document.getElementById(
        'formTitle'
    ).innerText = 'Add New User';

    document.getElementById(
        'submitButton'
    ).innerText = 'Add User';

    document.getElementById(
        'cancelButton'
    ).style.display = 'none';
}


// CASE 3 - Change Role
function changeRole(userId) {

    const newRole =
        prompt(
            'Enter new role: Client, Agent or Admin'
        );


    if (newRole === null ||
        newRole.trim() === '') {

        return;
    }


    fetch(`/api/User/${userId}/role`, {

        method: 'PATCH',

        headers: {
            'Content-Type': 'application/json'
        },

        // Backend expects a string in the body
        body: JSON.stringify(newRole)

    })

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    'Failed to change role'
                );
            }

            return response.json();

        })

        .then(data => {

            alert(
                'User role changed successfully!'
            );

            loadUsers();

        })

        .catch(error => {

            alert(
                'Role must be Client, Agent or Admin.'
            );

            console.error(error);

        });

}


// CASE 4 - DELETE with JWT
function deleteUser(userId) {

    const token =
        localStorage.getItem('token');


    if (!token) {

        alert(
            'You must login before deleting a user.'
        );

        window.location.href =
            'login.html';

        return;
    }


    if (confirm(
        'Are you sure you want to delete this user?'
    )) {

        fetch(`/api/User/${userId}`, {

            method: 'DELETE',

            headers: {

                'Authorization':
                    'Bearer ' + token
            }

        })

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        'Failed to delete user'
                    );
                }

                alert(
                    'User deleted successfully!'
                );

                loadUsers();

            })

            .catch(error => {

                alert(
                    'Delete failed. Please check your login.'
                );

                console.error(error);

            });

    }

}


// CASE 7 - Filter Users by Role
function filterUsers() {

    const role =
        document.getElementById(
            'filterRole'
        ).value;


    if (role === '') {

        alert('Please select a role.');

        return;
    }


    fetch(
        `/api/User/filter?role=${encodeURIComponent(role)}`
    )

        .then(response => response.json())

        .then(users => {

            displayUsers(users);

        })

        .catch(error => {

            console.error(
                'Error filtering users:',
                error
            );

        });

}


// CASE 8 - Sort and Statistics
function showStats() {

    fetch('/api/User/stats')

        .then(response => response.json())

        .then(result => {

            // Sorted users
            displayUsers(
                result.sortedUsers
            );


            // Count users by role
            let statsHtml =
                '<h6>User Count by Role:</h6>';


            result.countByRole.forEach(item => {

                statsHtml +=
                    `<p>${item.role}: ${item.count}</p>`;

            });


            document.getElementById(
                'statistics'
            ).innerHTML = statsHtml;

        })

        .catch(error => {

            console.error(
                'Error loading statistics:',
                error
            );

        });
}


// Load all users when page opens
loadUsers();