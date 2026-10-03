-- Furgonetas matriculadas como vehículo de mercancías (N1): la ITV tiene otro calendario
alter table cars add column is_van boolean not null default false;
