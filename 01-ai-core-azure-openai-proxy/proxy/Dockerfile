# Base layer (default dependencies) to use
# You should find more base layers at https://hub.docker.com
FROM python:3.10.8
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

# Custom location to place code files
RUN mkdir -p /app/src
COPY main.py /app/src/
COPY requirements.txt /app/src/requirements.txt
RUN pip3 install -r /app/src/requirements.txt

# Required to execute script
RUN chgrp -R nogroup /app && \
    chmod -R 770 /app
