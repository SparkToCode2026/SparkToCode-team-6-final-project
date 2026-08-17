const api = {

    async request(url, options = {}) {

        const token =
            localStorage.getItem('token');


        const headers = {

            'Content-Type':
                'application/json',

            ...(options.headers || {})

        };


        // Add JWT token if the user is logged in
        if (token) {

            headers['Authorization'] =
                'Bearer ' + token;

        }


        const response =
            await fetch(
                '/api' + url,
                {
                    ...options,
                    headers: headers
                }
            );


        /*
         * If the user is not authorized
         */
        if (response.status === 401) {

            localStorage.removeItem('token');

            localStorage.removeItem('userId');

            localStorage.removeItem('userName');

            localStorage.removeItem('role');


            window.location.href =
                '/login.html';


            throw new Error(
                'Unauthorized. Please login again.'
            );

        }


        /*
         * Handle other HTTP errors
         */
        if (!response.ok) {

            let errorMessage =
                'Request failed.';


            try {

                const errorData =
                    await response.json();


                if (errorData.message) {

                    errorMessage =
                        errorData.message;

                }

                else if (errorData.title) {

                    errorMessage =
                        errorData.title;

                }

            }

            catch {

                /*
                 * Response wasn't JSON.
                 * Keep the default error.
                 */

            }


            throw new Error(
                errorMessage
            );

        }


        /*
         * DELETE requests can return 204 No Content.
         */

        if (response.status === 204) {

            return null;

        }


        /*
         * Return JSON response.
         */

        return await response.json();

    },


    async get(url) {

        return await this.request(
            url,
            {
                method: 'GET'
            }
        );

    },


    async post(url, data) {

        return await this.request(
            url,
            {
                method: 'POST',

                body:
                    JSON.stringify(data)
            }
        );

    },


    async put(url, data) {

        return await this.request(
            url,
            {
                method: 'PUT',

                body:
                    JSON.stringify(data)
            }
        );

    },


    async delete(url) {

        return await this.request(
            url,
            {
                method: 'DELETE'
            }
        );

    }


};

function showToast(message) {
    alert(message);
}