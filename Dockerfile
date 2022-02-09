#
# Build the backend and expose it on port 8080
#

FROM alpine:latest

COPY backend /root
RUN apk add python3 python3-dev libffi-dev py3-pip build-base rust cargo openssl-dev libpq
WORKDIR /root

RUN pip3 install virtualenv
RUN virtualenv env
RUN source env/bin/activate
RUN pip install -r requirements.txt
RUN pip install gunicorn

EXPOSE 8080
CMD ["gunicorn", "-b", ":8080", "main:app"]
