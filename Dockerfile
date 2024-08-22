# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Install necessary packages and Chromium
RUN apk update && apk add --no-cache \
    wget \
    gnupg \
    chromium \
    nss \
    freetype \
    ttf-freefont \
    # Install 'su-exec' for running Chromium as a non-root user (optional)
    su-exec

# Install pnpm
RUN npm install -g pnpm

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Give permission to execute the script
RUN chmod +x /usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy your application source code into the container
COPY --chown=myuser:myuser . .

# Install dependencies using pnpm
RUN pnpm install

# Set environment variables
ENV NODE_ENV=prod
ENV SCRAPER_URL=https://www.amazon.es/s?rh=n%3A14177588031&fs=true&ref=lp_14177588031_sar
ENV SCRAPER_OFFSET_PAGE=0
ENV SCRAPER_LIMIT_PAGE=1

# Expose the application's port
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "start"]
