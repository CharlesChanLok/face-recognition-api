# Setup
## Backend:
Create a .env in the root directory. 

### In the .env: 
NODE_ENV=

DB_HOST= \
DB_PORT= \
DB_NAME= \
DB_USERNAME=\
DB_PASSWORD=

CLARIFAI_API_KEY="Your clarifai api key"

### Migration:
```
knex migrate:latest
```

1. npm install 
2. Run the postgresql
3. npm start