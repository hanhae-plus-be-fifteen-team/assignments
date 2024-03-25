create table specialLectures (
  id serial primary key,
  userId bigint unique,
  applied boolean not null
);
