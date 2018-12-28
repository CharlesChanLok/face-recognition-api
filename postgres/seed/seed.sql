BEGIN TRANSACTION;

INSERT into users (name, email, entries) values ('Tester', 'tester@gmail.com', 5);
INSERT into logins (hash, user_id) values ('$2a$10$ozfp7XRezlV2fZyJ5Ay0xOpFDDEDyeiooYi5dvOw.36t6K0FT/L4C', '1');
COMMIT;