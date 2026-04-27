# Todo Application (Full Stack)

Full-Stack Todo Application built with Spring Boot, Spring Security (JWT), Angular and MySQL.

## Tech Stack
- Backend: Spring Boot, Spring Security, JWT, Maven
- Frontend: Angular
- Database: MySQL

## Project Structure
backend/todo → Spring Boot API
frontend/todo-frontend → Angular App


## Run Backend
1. Set Environment Variables:
   - JWT_SECRET
   - PASSWORD
2. Run:

mvn spring-boot:run

## Run Frontend

npm install
ng serve

App runs at:
- Backend → http://localhost:8080
- Frontend → http://localhost:4200
##===============================================

jwt.secret = your_base64_secret_here
USER_NAME = your_secret_here
PASSWORD = your_db_password_here
