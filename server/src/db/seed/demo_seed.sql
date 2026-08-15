-- DEMO SEED DATA ONLY
-- Static reference/catalog rows for development. Does NOT include:
--   - fake crowd levels, wait times, confidence, or hourly statistics
--   - demo crowd_reports or crowd_history rows
--
-- Live crowd data must come from real user submissions (crowd_reports).

-- Fixed UUIDs for idempotent seeding
-- Demo user
INSERT INTO users (
  id,
  email,
  name,
  avatar_url,
  level_label,
  total_points,
  weekly_points,
  reports_this_week,
  total_reports,
  time_saved_minutes,
  people_helped,
  impact_score,
  community_rank_label,
  saved_hours_number,
  is_demo
) VALUES (
  'a0000001-0000-4000-8000-000000000001',
  'demo.alex@waitless.local',
  'Alex Rivera',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBASuhrxIQiJVaG9kupDlWIQBkpO64G82MtF0Ek9yaSGUw5MvxFI--_N92mftJgpKCsqG5hcKNfKG01wzjBI9f0LzfQBbjvcvETe7HfKFZtpFRVyMag7WqvXZcy_Hh-eHFH739ROPXSpgT0cQpp0jqAi88aV5SI4bIAAXiUiDz_fRfF4OKRZQom1X-U7iOWMNU0wQPtHlGl-wxiN-dQgGFBqK9ulkllZfsA9JSaQMTL0dU7sUMek82CgQ',
  'Time Saver Level 4',
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  NULL,
  0,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Sectors (reference data)
INSERT INTO sectors (id, slug, name, icon_name) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'hospitality', 'Hospitality', 'restaurant'),
  ('b0000001-0000-4000-8000-000000000002', 'finance', 'Finance', 'account_balance'),
  ('b0000001-0000-4000-8000-000000000003', 'retail', 'Retail', 'storefront'),
  ('b0000001-0000-4000-8000-000000000004', 'entertainment', 'Entertainment', 'movie')
ON CONFLICT (slug) DO NOTHING;

-- Demo place catalog (static venue metadata from initialData.js)
INSERT INTO places (
  legacy_id, sector_id, name, category, address,
  latitude, longitude, image_url, map_x_percent, map_y_percent, is_demo
) VALUES
  (
    'place-1',
    (SELECT id FROM sectors WHERE slug = 'hospitality'),
    'The Roasted Bean',
    'Coffee Shop • Hospitality',
    '142 Metro Boulevard',
    28.614500, 77.209200,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBTDQPgKNtEl20kc7u5PlWV2Xu9XoLWiaWqssmU5rUCnLej8scT-d-1M6eVhUaQWLcJBIj2iRSerA_Jgwv3H6HnWUeEOFh4B-KMGZzGJkkNCsix_oAu0850aXDysSQFlygrIUOHp4_8PjzOz4ca3YHieFhI-nkDH-OAk_rYoh7St2P-0jSsnqkyjRN1P5FrVGQWVyXzh6uZ42zcNSsEYwRitIbAZpoN-sHbkkBxksi6P724UIR5dVO9Pg',
    28, 35, TRUE
  ),
  (
    'place-2',
    (SELECT id FROM sectors WHERE slug = 'retail'),
    'Market Fresh',
    'Grocery Store • Retail',
    '88 Grand Avenue',
    28.612800, 77.229500,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAKL32uzT6-kYVuFrIJuzm0KjnW3qcK6nessKkgeJyjQvOvIva7QegBccOZDbMj0mwmfS5wY22zj59-M03yPFGRsQc1AOUaZaLaefalu7o_HMl8ZeBNpG1G9nSyZ9WDV6s_38MZFL5B7SkpCAwfEhJ813Bf5Hb796dwU4hxWKPDZY8jtVabAf92NM9WWA-H1mQQU8n7JooV1xnN_Gjmfq-0LOSDu4pqr7TDhBHnfIko_9wZxQ_hFIQPuQ',
    72, 48, TRUE
  ),
  (
    'place-3',
    (SELECT id FROM sectors WHERE slug = 'finance'),
    'Metro Bank Main Branch',
    'Bank • Finance',
    '500 Financial Center',
    28.615900, 77.212500,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBk0YsgEILvwhJW3aJgM1LmZZ2aDPLohkGzikWr21O-hRx4c-ftPdnHftvzcvIBz-YzSxq9VbxK9MFOIYdBsyVizjT7GSfqOkLRTOIyQ1T6VPi4eye1mCQxID_jXGQys0_2M6lCs6icId3q43Rud2Dfq0D2IjeY0HiYCnoX8CZF4NxpjOb1O0V_C77xGEiQ_p9PqC0O82CUWsgef5wp7wwLYFyVyXS6K8OhmWAPFyye5Afody3Mq3jk8g',
    50, 65, TRUE
  ),
  (
    'place-4',
    (SELECT id FROM sectors WHERE slug = 'retail'),
    'TechStore City Center',
    'Retail • Electronics',
    '210 Shopping Square',
    28.617200, 77.208100,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAt6e2oFtHWCeEX2SwANKMi34wDfNGLtqPj_x4ZWylP2KhVHVmexCxSpDZtscqX4iBBeXuhwvUHXrdqj_6tuSfwYmzWzqQSGaLD0uGy982jod6T55PfNPI70uxZYd-brF8ll4RtvncdqsnNVHT8rY-2PQGDomjI7HMa6EGa0Vy-fuln14W7ulGmfRy_XcXdpMvCVQ6n47nbbxPyqUlAiloPbACJrQ4iOV0EP4YshHsLQYf1nT9lkC80Lw',
    82, 30, TRUE
  ),
  (
    'place-5',
    (SELECT id FROM sectors WHERE slug = 'hospitality'),
    'The Continental Hotel',
    'Hotel & Lounge • Hospitality',
    '1 Continental Plaza',
    28.616100, 77.210800,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBTDQPgKNtEl20kc7u5PlWV2Xu9XoLWiaWqssmU5rUCnLej8scT-d-1M6eVhUaQWLcJBIj2iRSerA_Jgwv3H6HnWUeEOFh4B-KMGZzGJkkNCsix_oAu0850aXDysSQFlygrIUOHp4_8PjzOz4ca3YHieFhI-nkDH-OAk_rYoh7St2P-0jSsnqkyjRN1P5FrVGQWVyXzh6uZ42zcNSsEYwRitIbAZpoN-sHbkkBxksi6P724UIR5dVO9Pg',
    40, 25, TRUE
  ),
  (
    'place-6',
    (SELECT id FROM sectors WHERE slug = 'entertainment'),
    'Oceanview Resort & Spa',
    'Resort • Entertainment',
    '500 Shoreline Drive',
    28.610500, 77.231000,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAKL32uzT6-kYVuFrIJuzm0KjnW3qcK6nessKkgeJyjQvOvIva7QegBccOZDbMj0mwmfS5wY22zj59-M03yPFGRsQc1AOUaZaLaefalu7o_HMl8ZeBNpG1G9nSyZ9WDV6s_38MZFL5B7SkpCAwfEhJ813Bf5Hb796dwU4hxWKPDZY8jtVabAf92NM9WWA-H1mQQU8n7JooV1xnN_Gjmfq-0LOSDu4pqr7TDhBHnfIko_9wZxQ_hFIQPuQ',
    15, 75, TRUE
  ),
  (
    'place-7',
    (SELECT id FROM sectors WHERE slug = 'hospitality'),
    'Sunrise Motel',
    'Lodging • Hospitality',
    '99 Sunrise Hwy',
    28.605800, 77.234500,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBTDQPgKNtEl20kc7u5PlWV2Xu9XoLWiaWqssmU5rUCnLej8scT-d-1M6eVhUaQWLcJBIj2iRSerA_Jgwv3H6HnWUeEOFh4B-KMGZzGJkkNCsix_oAu0850aXDysSQFlygrIUOHp4_8PjzOz4ca3YHieFhI-nkDH-OAk_rYoh7St2P-0jSsnqkyjRN1P5FrVGQWVyXzh6uZ42zcNSsEYwRitIbAZpoN-sHbkkBxksi6P724UIR5dVO9Pg',
    85, 80, TRUE
  ),
  (
    'place-8',
    (SELECT id FROM sectors WHERE slug = 'hospitality'),
    'City Health Clinic',
    'Healthcare • Hospitality',
    '33 Medical Park',
    28.613200, 77.215600,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBk0YsgEILvwhJW3aJgM1LmZZ2aDPLohkGzikWr21O-hRx4c-ftPdnHftvzcvIBz-YzSxq9VbxK9MFOIYdBsyVizjT7GSfqOkLRTOIyQ1T6VPi4eye1mCQxID_jXGQys0_2M6lCs6icId3q43Rud2Dfq0D2IjeY0HiYCnoX8CZF4NxpjOb1O0V_C77xGEiQ_p9PqC0O82CUWsgef5wp7wwLYFyVyXS6K8OhmWAPFyye5Afody3Mq3jk8g',
    35, 55, TRUE
  )
ON CONFLICT (legacy_id) DO NOTHING;
