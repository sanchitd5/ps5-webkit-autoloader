ARG BUILD_FROM
FROM ${BUILD_FROM:-homeassistant/aarch64-base:latest}

RUN apk add --no-cache python3 py3-pip

WORKDIR /app

COPY run.sh server.py /app/
RUN chmod +x /app/run.sh

# Copy the exploit frontend files
COPY frontend/ /app/www/

CMD ["/app/run.sh"]
