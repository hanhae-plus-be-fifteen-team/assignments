create table if not exists "special_lectures" (
  id serial primary key,
  user_id int unique,
  applied boolean not null,
  created_at timestamp default now()
);
