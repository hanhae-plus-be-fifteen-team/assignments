create table if not exists "special_lectures" (
  id serial primary key,
  title varchar(255) not null,
  opening_date timestamp not null
);

create table if not exists "special_lectures_count" (
  lecture_id int primary key references special_lectures(id),
  maximum int not null,
  count int not null
);

create table if not exists "applications" (
  lecture_id int not null references special_lectures(id),
  user_id int not null,
  created_at timestamp not null,
  primary key (lecture_id, user_id)
);
