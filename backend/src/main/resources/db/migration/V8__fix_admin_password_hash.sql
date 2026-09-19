-- V8__fix_admin_password_hash.sql
UPDATE users
SET password_hash = '$2a$12$DBF/AQamvOMgKikrh10l0.EA3QiqoRJ3LqzlnWvi5Bz.iZ1M2s2SO'
WHERE email = 'admin@lms.com';