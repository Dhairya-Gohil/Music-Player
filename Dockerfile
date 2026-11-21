FROM node:20-slim

# Create user with UID 1000 for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user
WORKDIR /app

# Copy all project files preserving exact directory structure
COPY --chown=user:user . .

# Install dependencies for both server & client, then build the React client
RUN npm run postinstall
RUN npm run build

# Ensure write permissions for server runtime files (users.json, uploads, songs)
RUN chmod -R 777 /app/server /app/songs 2>/dev/null || true

USER user
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

CMD ["node", "server/src/index.js"]

