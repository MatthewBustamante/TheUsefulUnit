# Setting up the Docker SQL

### 1. Create the docker image

docker run -p 10005:3306 --name FriendFinderDb -e MYSQL_ROOT_PASSWORD=pass -d mysql:5.7

### 2. Log in to the db

mysql -u root -p

### 3. Enter the password

pass

### 4. Create the database

CREATE DATABASE FriendFinder;

CREATE TABLE Activities(
ActivityID INT,
Name VARCHAR(50),
Description VARCHAR(200),
StartTime DATETIME,
EndTime DATETIME,
OwnerID INT,
PRIMARY KEY (ActivityID),
FOREIGN KEY (OwnerID) REFERENCES Users(UserID),
);

CREATE TABLE UserActivity(
UserID INT, 
ActivityID INT,
PRIMARY KEY (UserID, ActivityID),
FOREIGN KEY (UserID) REFERENCES Users(UsersID),
FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
);

CREATE TABLE Comments(
CommentID INT,
UserID INT,
ActivityID INT,
Comment VARCHAR(200),
Date DATETIME,
PRIMARY KEY (CommentID),
FOREIGN KEY (UserID) REFERENCES Users(UsersID),
FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
);