FROM mysql:8.4

COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY users.sql /docker-entrypoint-initdb.d/02-users.sql
COPY medicines.sql /docker-entrypoint-initdb.d/03-medicines.sql
COPY pharmacies.sql /docker-entrypoint-initdb.d/04-pharmacies.sql
COPY pharmacy_stock.sql /docker-entrypoint-initdb.d/05-pharmacy_stock.sql
