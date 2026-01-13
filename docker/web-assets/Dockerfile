# syntax=docker/dockerfile:1
#
# RYLA Web Assets - GHCR Image
# This image contains only the public assets (images) for the web app
# It's used during deployment to extract assets into the build context
#

FROM scratch AS base

# Copy only the public folder from apps/web
# The public folder contains all static assets including images
COPY apps/web/public /public

# This is a minimal image that only contains the assets
# No runtime needed - just files to extract
