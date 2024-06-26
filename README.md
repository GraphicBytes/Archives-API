# ARCHIVES API #

### MANDATORY HEADERS ###
User-Token needs to be specified as a header and it's mandatory.

### API ENDPOINTS ###

#### GET METHODS ####
* GET `/api/forms/title/:title/submissions/:submissionId`: Retrieves a specific submission of a specific form by form title and submission id
* GET `/api/forms/id/:id/submissions/:submissionId`: Retrieves a specific submission of a specific form by form id and submission id
* GET `/api/forms/title/:title/submissions/`: Retrieves a list of form submissions by form title
* GET `/api/forms/id/:id/submissions/`: Retrieves a list of form submissions by form id
* GET `/api/forms/id/:id/admin-data/`: Retrieves the admin data of a form by form id
* GET `/api/forms/id/:id/embed-data/`: Retrieves the embed data of a form by form id
* GET `/api/forms/users/id/:id`: Retrieves all forms including all form's data of specific user
* GET `/api/forms/title/:title`: Retrieves all the data of a form by form title
* GET `/api/forms/id/:id`: Retrieves all the data of a form by form id
* GET `/api/forms`: Retrieves all forms including all form's data

#### POST METHODS ####
* POST `/api/forms/title/:title/submissions`: Creates a submission on a form by form title
* POST `/api/forms/id/:id/submissions`: Creates a submission on a form by form id
* POST `/api/forms`: Creates a new form 

#### PUT METHODS ####
* PUT `/api/forms/title/:title/submissions/:submissionId`: Updates a specific submission on a form by form title and submission id
* PUT `/api/forms/id/:id/submissions/:submissionId`: Updates a specific submission on a form by form id and submission id
* PUT `/api/forms/id/:id/admin-data`: Updates the admin data of a form by form id
* PUT `/api/forms/id/:id/embed-data`: Updates the embed data of a form by form id
* PUT `/api/forms/title/:title`: Updates any data of a form by form title
* PUT `/api/forms/id/:id`: Updates any data of a form by form id

#### DELETE METHODS ####
* DELETE `/api/forms/title/:title/submissions/:submissionId`: Deletes a specific submission of a form by form title and submission id
* DELETE `/api/forms/id/:id/submissions/:submissionId`: Deletes a specific submission of a form by form id and submission id
* DELETE `/api/forms/title/:title`: Deletes a form and it's data by form title
* DELETE `/api/forms/id/:id`: Deletes a form and it's data by form id