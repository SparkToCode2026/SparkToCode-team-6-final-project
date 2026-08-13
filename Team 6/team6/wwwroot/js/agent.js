let editingAgentId = null;
let editingAgentUserId = null;


// Display Agent Profiles
function displayAgents(agents) {

    const tableBody =
        document.getElementById('agentsTableBody');

    tableBody.innerHTML = '';


    agents.forEach(agent => {

        const agentName =
            agent.user
                ? agent.user.name
                : 'N/A';


        const row = `
            <tr>

                <td>${agent.agentProfileId}</td>

                <td>${agentName}</td>

                <td>${agent.userId}</td>

                <td>${agent.licenseNumber}</td>

                <td>${agent.phone}</td>

                <td>${agent.bio || ''}</td>

                <td>

                    <button class="btn btn-warning btn-sm"
                            onclick="editAgent(${agent.agentProfileId})">
                        Edit
                    </button>

                    <button class="btn btn-primary btn-sm"
                            onclick="changeBio(${agent.agentProfileId})">
                        Change Bio
                    </button>

                    <button class="btn btn-danger btn-sm"
                            onclick="deleteAgent(${agent.agentProfileId})">
                        Delete
                    </button>

                </td>

            </tr>
        `;

        tableBody.innerHTML += row;
    });
}


// CASE 5 - Get All Agent Profiles
function loadAgents() {

    fetch('/api/AgentProfile')

        .then(response => response.json())

        .then(agents => {

            displayAgents(agents);

            document.getElementById(
                'totalAgents'
            ).innerText = '';

        })

        .catch(error => {

            console.error(
                'Error loading agents:',
                error
            );

        });
}


// CASE 1 and CASE 2
// Add or Update Agent Profile
document.getElementById('agentForm')
    .addEventListener('submit', function (event) {

        event.preventDefault();


        const userId =
            document.getElementById('userId').value;

        const licenseNumber =
            document.getElementById('licenseNumber').value;

        const phone =
            document.getElementById('phone').value;

        const bio =
            document.getElementById('bio').value;


        // CASE 2 - UPDATE
        if (editingAgentId !== null) {

            const agent = {

                agentProfileId:
                    editingAgentId,

                licenseNumber:
                    licenseNumber,

                bio:
                    bio,

                phone:
                    phone,

                userId:
                    editingAgentUserId
            };


            fetch(`/api/AgentProfile/${editingAgentId}`, {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(agent)

            })

                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            'Failed to update agent'
                        );
                    }

                    alert(
                        'Agent profile updated successfully!'
                    );

                    cancelEdit();

                    loadAgents();

                })

                .catch(error => {

                    console.error(
                        'Error updating agent:',
                        error
                    );

                });

        }


        // CASE 1 - ADD
        else {

            const agent = {

                licenseNumber:
                    licenseNumber,

                bio:
                    bio,

                phone:
                    phone,

                userId:
                    parseInt(userId)
            };


            fetch('/api/AgentProfile', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(agent)

            })

                .then(async response => {

                    if (!response.ok) {

                        const message =
                            await response.text();

                        throw new Error(message);
                    }

                    return response.json();

                })

                .then(data => {

                    alert(
                        'Agent profile added successfully!'
                    );

                    document.getElementById(
                        'agentForm'
                    ).reset();

                    loadAgents();

                })

                .catch(error => {

                    console.error(
                        'Error adding agent:',
                        error
                    );

                    alert(error.message);

                });

        }

    });


// CASE 6 - Find Agent Profile
function findAgent() {

    const agentId =
        document.getElementById(
            'findAgentId'
        ).value;


    if (agentId === '') {

        alert(
            'Please enter an Agent Profile ID.'
        );

        return;
    }


    fetch(`/api/AgentProfile/${agentId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Agent profile not found'
                );
            }

            return response.json();

        })

        .then(agent => {

            displayAgents([agent]);

        })

        .catch(error => {

            alert(
                'Agent profile not found.'
            );

            console.error(error);

        });
}


// Edit Agent
function editAgent(agentId) {

    fetch(`/api/AgentProfile/${agentId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Agent profile not found'
                );
            }

            return response.json();

        })

        .then(agent => {

            editingAgentId =
                agent.agentProfileId;

            editingAgentUserId =
                agent.userId;


            document.getElementById(
                'userId'
            ).value = agent.userId;

            document.getElementById(
                'licenseNumber'
            ).value = agent.licenseNumber;

            document.getElementById(
                'phone'
            ).value = agent.phone;

            document.getElementById(
                'bio'
            ).value = agent.bio || '';


            // User cannot be changed during edit
            document.getElementById(
                'userId'
            ).disabled = true;


            document.getElementById(
                'formTitle'
            ).innerText =
                'Update Agent Profile';

            document.getElementById(
                'submitButton'
            ).innerText =
                'Update Agent Profile';

            document.getElementById(
                'cancelButton'
            ).style.display =
                'inline-block';


            window.scrollTo(0, 0);

        })

        .catch(error => {

            console.error(
                'Error loading agent:',
                error
            );

        });
}


// Cancel Edit
function cancelEdit() {

    editingAgentId = null;

    editingAgentUserId = null;


    document.getElementById(
        'agentForm'
    ).reset();


    document.getElementById(
        'userId'
    ).disabled = false;


    document.getElementById(
        'formTitle'
    ).innerText =
        'Add New Agent Profile';

    document.getElementById(
        'submitButton'
    ).innerText =
        'Add Agent Profile';

    document.getElementById(
        'cancelButton'
    ).style.display =
        'none';
}


// CASE 3 - Change Bio Only
function changeBio(agentId) {

    const newBio =
        prompt('Enter the new Bio:');


    if (newBio === null) {
        return;
    }


    fetch(
        `/api/AgentProfile/${agentId}/bio`,
        {

            method: 'PATCH',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body:
                JSON.stringify(newBio)

        }
    )

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Failed to update Bio'
                );
            }

            return response.json();

        })

        .then(data => {

            alert(
                'Bio updated successfully!'
            );

            loadAgents();

        })

        .catch(error => {

            console.error(
                'Error updating Bio:',
                error
            );

        });
}


// CASE 4 - Delete Agent Profile
function deleteAgent(agentId) {

    if (confirm(
        'Are you sure you want to delete this Agent Profile?'
    )) {

        fetch(
            `/api/AgentProfile/${agentId}`,
            {
                method: 'DELETE'
            }
        )

            .then(response => {

                if (!response.ok) {
                    throw new Error(
                        'Failed to delete Agent Profile'
                    );
                }

                alert(
                    'Agent Profile deleted successfully!'
                );

                loadAgents();

            })

            .catch(error => {

                console.error(
                    'Error deleting Agent Profile:',
                    error
                );

            });

    }
}


// CASE 7 - Filter by Agent Name
function filterAgents() {

    const name =
        document.getElementById(
            'filterName'
        ).value;


    if (name.trim() === '') {

        alert(
            'Please enter an Agent Name.'
        );

        return;
    }


    fetch(
        `/api/AgentProfile/filter?name=${encodeURIComponent(name)}`
    )

        .then(response => response.json())

        .then(agents => {

            displayAgents(agents);

        })

        .catch(error => {

            console.error(
                'Error filtering agents:',
                error
            );

        });
}


// CASE 8 - Sort and Statistics
function showStats() {

    fetch('/api/AgentProfile/stats')

        .then(response => response.json())

        .then(result => {

            displayAgents(
                result.sortedProfiles
            );


            document.getElementById(
                'totalAgents'
            ).innerText =
                'Total Agents: ' +
                result.totalAgents;

        })

        .catch(error => {

            console.error(
                'Error loading Agent statistics:',
                error
            );

        });
}


// Load all Agents when page opens
loadAgents();