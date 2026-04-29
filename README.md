## REST API build in class:
 >> start with a copy of /express-photogallery-cloudinary-REST-build-in-class and add to it oauth with goodgle and user accounts.

### Running the Application
 
- clone project to your local workspace
- run `npm install` to install dependencies
- insert your cloudinary credentials in a .env file in the root of the project 
    - You'll need to add values for CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
- insert your mongodb credentials in the .env file as well, as DB_USER and DB_PWD. You may have to update the connection string in app.js to match your cluster and database name as well. (We ought to move the whole connection string into .env, really.) 
- run `npm start` or `npm run start-dev` to start the application

