INSERT INTO "User" (
    "email", "firstName", "lastName", "passwordHash", "passwordSalt"
) VALUES ('test@testament.de', 'Max', 'Power', '123456', '654321') 
RETURNING "identifier";