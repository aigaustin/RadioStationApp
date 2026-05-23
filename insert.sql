
    INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", disabled, "createdAt", "updatedAt") 
    VALUES (gen_random_uuid(), 'admin@streamo.ng', '$2b$12$QZYo/B6qO28tP519aydVc.tKLPxo6jrGCYRDQ/cghWpyJfmFZTmIO', 'Super', 'Admin', false, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
    