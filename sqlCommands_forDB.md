# Setting up the Docker SQL

### 1. Create the docker image

docker run -p 10005:3306 --name FriendFinderDb -e MYSQL_ROOT_PASSWORD=pass -d mysql:5.7

### 2. Log in to the container

docker container exec -it FriendFinder bash

### 3. Log in to the db

mysql -u root -p

### 4. Enter the password

pass

### 5. Create the database

CREATE DATABASE FriendFinder_DB;

### 6. Create the test database

CREATE DATABASE FriendFinder_Test_DB;
