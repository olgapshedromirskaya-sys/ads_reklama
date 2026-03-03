INSERT INTO bot_users (telegram_id, username, full_name, role, is_active, added_at)
VALUES (545972485, 'owner', 'Руководитель', 'owner', true, NOW())
ON CONFLICT (telegram_id) DO UPDATE SET role = 'owner', is_active = true;
