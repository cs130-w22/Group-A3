FROM postgres:alpine
COPY schemas/*.sql /docker-entrypoint-initdb.d
RUN chmod a+r /docker-entrypoint-initdb.d/*

# Set Postgres variables
ENV POSTGRES_DB="gradebetter"
ENV POSTGRES_USER="admin"
ENV POSTGRES_PASSWORD="admin"

# Expose port to serve on.
EXPOSE 5432
