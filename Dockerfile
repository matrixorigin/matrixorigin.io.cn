FROM python:3.9-alpine

ADD . /matrixorigin.io.cn

WORKDIR /matrixorigin.io.cn

RUN pip install -r requirements.txt

RUN apk add git

CMD ["mike", "serve", "--dev-addr=0.0.0.0:8000"]

