-- ═══════════════════════════════════════════════════════════════════════════════
-- Madrid Cricket Club — Seed Data
-- Run via: supabase db push (or SQL Editor in Supabase dashboard)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Real 2026 ECCL Results ──────────────────────────────────────────────────
-- NOTE: Events are seeded here. Profiles are created when members sign up via Auth.
-- To make Jon Woodward admin after he signs up, run the admin promotion below.

-- Insert real ECCL events (linked to venues by name lookup)
do $$
declare
  v_laelipa   uuid;
  v_alfaz     uuid;
  v_lamanga   uuid;

  e_eccl40_jul19   uuid := gen_random_uuid();
  e_eccl40_jun21   uuid := gen_random_uuid();
  e_t20_jun20_1    uuid := gen_random_uuid();
  e_t20_jun20_2    uuid := gen_random_uuid();
  e_t20_may30_1    uuid := gen_random_uuid();
  e_t20_may30_2    uuid := gen_random_uuid();

  e_barca_t20_1    uuid := gen_random_uuid();
  e_barca_t20_2    uuid := gen_random_uuid();
  e_barca_40       uuid := gen_random_uuid();
  e_ecs            uuid := gen_random_uuid();
  e_m20            uuid := gen_random_uuid();
  e_net_6sep       uuid := gen_random_uuid();
  e_net_9sep       uuid := gen_random_uuid();
  e_junior_18sep   uuid := gen_random_uuid();
begin
  select id into v_laelipa from public.venues where short_name = 'La Elipa' limit 1;
  select id into v_alfaz   from public.venues where short_name = 'Sporting Alfaz' limit 1;
  select id into v_lamanga from public.venues where short_name = 'La Manga' limit 1;

  -- ── Completed Results ───────────────────────────────────────────────────────

  insert into public.events (id, type, title, opponent, competition, date, start_time, venue_id, is_home, format, team, status) values
    (e_eccl40_jul19, 'match', 'MCC vs La Manga Torrevieja CC', 'La Manga Torrevieja CC', 'ECCL 40 Overs 2026', '2026-07-19', '10:00', v_alfaz, false, '40_over', 'seniors', 'completed'),
    (e_eccl40_jun21, 'match', 'MCC vs Sporting Alfas CC',     'Sporting Alfas Cricket Club', 'ECCL 40 Overs 2026', '2026-06-21', '10:00', v_alfaz, false, '40_over', 'seniors', 'completed'),
    (e_t20_jun20_1,  'match', 'Sporting Alfas CC vs MCC (1)', 'Sporting Alfas Cricket Club', 'ECCL T20 2026', '2026-06-20', '10:00', v_alfaz, false, 't20', 'seniors', 'completed'),
    (e_t20_jun20_2,  'match', 'Sporting Alfas CC vs MCC (2)', 'Sporting Alfas Cricket Club', 'ECCL T20 2026', '2026-06-20', '14:00', v_alfaz, false, 't20', 'seniors', 'completed'),
    (e_t20_may30_1,  'match', 'La Manga Torrevieja CC vs MCC (1)', 'La Manga Torrevieja CC', 'ECCL T20 2026', '2026-05-30', '10:00', v_lamanga, false, 't20', 'seniors', 'completed'),
    (e_t20_may30_2,  'match', 'MCC vs La Manga Torrevieja CC (2)', 'La Manga Torrevieja CC', 'ECCL T20 2026', '2026-05-30', '14:00', v_lamanga, false, 't20', 'seniors', 'completed');

  insert into public.results (event_id, our_score, opposition_score, overs, result, margin, summary) values
    (e_eccl40_jul19, '272/10', '246/9',  '37.4/40', 'won',  '26 runs',    'MCC posted 272 all out and defended it to win by 26 runs. A commanding performance.'),
    (e_eccl40_jun21, '246/10', '247/2',  '39/40',   'lost', '8 wickets',  'Sporting Alfas chased 246 with ease in 26.2 overs.'),
    (e_t20_jun20_1,  '191/9',  '252/4',  '20/20',   'lost', '61 runs',    'Sporting Alfas posted 252/4; MCC restricted to 191/9.'),
    (e_t20_jun20_2,  '137/6',  '178/4',  '20/20',   'lost', '41 runs',    'Sporting Alfas won the second T20 by 41 runs.'),
    (e_t20_may30_1,  '148/10', '214/1',  '20/20',   'lost', '66 runs',    'La Manga posted 214/1 and bowled MCC out for 148.'),
    (e_t20_may30_2,  '216/8',  '144/6',  '20/20',   'won',  '72 runs',    'MCC bounced back to win the second T20 by 72 runs.');

  -- ── Upcoming Fixtures ───────────────────────────────────────────────────────

  insert into public.events (id, type, title, opponent, competition, date, start_time, meet_time, venue_id, is_home, format, team, status, notes, is_livestreamed) values
    (e_barca_t20_1, 'match', 'MCC vs Barcelona International CC — T20 (1)', 'Barcelona International CC', 'ECCL T20 2026',     '2026-09-05', '10:00', '08:30', v_lamanga, false, 't20',    'seniors', 'scheduled', 'Weekend at La Manga 5-6 Sep. 2x T20 + 40-over vs Barcelona ICC.', false),
    (e_barca_t20_2, 'match', 'MCC vs Barcelona International CC — T20 (2)', 'Barcelona International CC', 'ECCL T20 2026',     '2026-09-05', '14:00', '13:30', v_lamanga, false, 't20',    'seniors', 'scheduled', null, false),
    (e_barca_40,    'match', 'MCC vs Barcelona International CC — 40 Overs','Barcelona International CC', 'ECCL 40 Overs 2026','2026-09-06', '10:00', '08:30', v_lamanga, false, '40_over','seniors', 'scheduled', null, false),
    (e_net_6sep,    'nets',  'Senior Net Practice', null, null, '2026-09-06', '10:00', '09:45', v_laelipa, true, null, 'seniors', 'scheduled', '10am–1pm.', false),
    (e_net_9sep,    'nets',  'Net Practice',        null, null, '2026-09-09', '18:00', '17:45', v_laelipa, true, null, 'seniors', 'scheduled', '6pm–8pm.', false),
    (e_junior_18sep,'nets',  'Junior Cricket',      null, null, '2026-09-18', '18:00', '17:45', v_laelipa, true, null, 'juniors', 'scheduled', '6pm–8pm at La Elipa.', false),
    (e_ecs,  'match', 'ECS T10 Madrid — Tournament', null, 'European Cricket Series T10 Madrid', '2026-10-19', '08:30', '07:30', v_laelipa, true,  't10', 'seniors', 'scheduled',
      'MCC + 4 other teams (TBC). Games 08:30–17:00. All matches streamed live on ECN. Players must consent to recording. Arrive 07:30–08:00 to set up.', true),
    (e_m20,  'match', 'Madrid 20-Over League', null, 'Madrid 20-Over League', '2026-10-01', '10:00', '09:30', v_laelipa, true, 't20', 'seniors', 'scheduled',
      'Madrid 20-over league at La Elipa. Dates and opponents TBC.', false);

end $$;

-- ─── Promote Jon Woodward to Admin ───────────────────────────────────────────
-- Run this AFTER Jon has signed up via the website:
--
-- update public.profiles
-- set is_admin = true,
--     member_role = 'president',
--     full_name = 'Jon Woodward'
-- where id = (select id from auth.users where email = 'jonwoodward1975@gmail.com');
