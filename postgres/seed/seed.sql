BEGIN TRANSACTION;

INSERT into users (name, email, entries) values ('Tester', 'tester@gmail.com', 5);
/* password = p */ 
INSERT into logins (hash, user_id) values ('$2a$10$MoKh8Al5h30t/prWZxDfru5/F6xKfaryquQZ7Oq3mMs2PEKLHONSq', '1');
COMMIT;