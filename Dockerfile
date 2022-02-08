#
#
#

# Rebuild our frontend
FROM node:16 AS frontend
COPY frontend /root
RUN ls
WORKDIR /root
RUN yarn --ignore-scripts
RUN yarn run build

# # Provision our backend
FROM alpine:latest
COPY backend /root
RUN apk add python3 python3-dev libffi-dev py3-pip build-base rust cargo openssl-dev libpq
WORKDIR /root
RUN pip3 install virtualenv
RUN virtualenv env
RUN source env/bin/activate
RUN pip install -r requirements.txt
RUN pip install gunicorn
COPY --from=frontend /root/build ./build
EXPOSE 8080
CMD ["gunicorn", "-w", "4", "-b", ":8080", "main:app"]
