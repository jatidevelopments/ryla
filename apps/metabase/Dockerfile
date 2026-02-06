# Metabase on Fly.io (IN-041)
# Uses official image; persistence via volume at /metabase-data (see fly.toml).
# Explicit platform for Fly.io remote builders (linux/amd64).
FROM --platform=linux/amd64 metabase/metabase:latest

# Metabase listens on 3000; Jetty host must be 0.0.0.0 for Fly
ENV MB_JETTY_HOST=0.0.0.0
# Persist H2 DB on mounted volume (fly.toml mounts metabase_data -> /metabase-data)
ENV MB_DB_FILE=/metabase-data/metabase.db

EXPOSE 3000
