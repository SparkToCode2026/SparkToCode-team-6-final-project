// Register User
const registerForm = document.getElementById('registerForm');

if (registerForm) {

    registerForm.addEventListener('submit', function (event) {

        event.preventDefault();

        const name =
            document.getElementById('name').value;

        const email =
            document.getElementById('email').value;

        const password =
            document.getElementById('password').value;

        const role =
            document.getElementById('role').value;


        const user = {
            name: name,
            email: email,
            passwordHash: password,
            role: role
        };


        fetch('/api/Auth/register', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(user)

        })

            .then(response => {

                if (!response.ok) {
                    throw new Error('Registration failed');
                }

                return response.json();

            })

            .then(data => {

                alert('Registration successful!');

                registerForm.reset();

                window.location.href = 'login.html';

            })

            .catch(error => {

                console.error(
                    'Registration error:',
                    error
                );

                alert('Registration failed.');

            });

    });

}

// Login User
const loginForm = document.getElementById('loginForm');

if (loginForm) {

    loginForm.addEventListener('submit', function (event) {

        event.preventDefault();

        const email =
            document.getElementById('loginEmail').value;

        const password =
            document.getElementById('loginPassword').value;


        const loginData = {
            email: email,
            password: password
        };


        fetch('/api/Auth/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(loginData)

        })

            .then(response => {

                if (!response.ok) {
                    throw new Error('Invalid email or password');
                }

                return response.json();

            })

            .then(data => {

                // Save JWT and user information
                localStorage.setItem('token', data.token);

                localStorage.setItem('userId', data.userId);

                localStorage.setItem('userName', data.name);

                localStorage.setItem('role', data.role);


                alert('Login successful!');

                window.location.href = 'index.html';

            })

            .catch(error => {

                console.error(
                    'Login error:',
                    error
                );

                alert('Invalid email or password.');

            });

    });

}


// Logout User
function logout() {

    localStorage.removeItem('token');

    localStorage.removeItem('userId');

    localStorage.removeItem('userName');

    localStorage.removeItem('role');

    alert('Logged out successfully!');

    window.location.href = 'login.html';
}

// Update Navbar
function updateNavbar() {

    const token = localStorage.getItem('token');

    const userName = localStorage.getItem('userName');

    const guestLinks = document.getElementById('guestLinks');

    const userLinks = document.getElementById('userLinks');

    const welcomeUser = document.getElementById('welcomeUser');


    if (guestLinks && userLinks) {

        if (token) {

            guestLinks.style.display = 'none';

            userLinks.style.display = 'block';

            if (welcomeUser) {
                welcomeUser.innerText =
                    'Welcome, ' + userName;
            }

        }

        else {

            guestLinks.style.display = 'block';

            userLinks.style.display = 'none';

        }
    }
}


updateNavbar();