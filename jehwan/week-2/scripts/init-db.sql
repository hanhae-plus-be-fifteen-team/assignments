create table if not exists "special_lectures" (
  id uuid primary key,
  title varchar(255) not null,
  opening_date timestamp not null
);

create table if not exists "special_lectures_count" (
  id uuid primary key,
  lecture_id uuid not null unique references special_lectures(id),
  maximum int not null,
  count int not null
);

create table if not exists "users" (
  id uuid primary key,
  username varchar(255) not null
);

create table if not exists "applications" (
  id uuid primary key,
  lecture_id uuid not null references special_lectures(id),
  user_id uuid not null references users(id),
  created_at timestamp not null,
  unique(lecture_id, user_id)
);
