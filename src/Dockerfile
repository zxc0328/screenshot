FROM node:latest

RUN apt-get update -y && apt-get -y install xvfb
RUN export DISPLAY=:99.0
RUN export LIGHTHOUSE_CHROMIUM_PATH="$(pwd)/chrome-linux/chrome"
RUN sh -e /etc/init.d/xvfb start
RUN curl -L https://raw.githubusercontent.com/GoogleChrome/lighthouse/v2.1.0/lighthouse-core/scripts/download-chrome.sh | bash