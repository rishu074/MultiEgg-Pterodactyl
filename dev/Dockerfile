FROM ubuntu:20.04
# FROM debian


MAINTAINER Royadma, <royadma2314@gmail.com>

# RUN echo "deb http://security.ubuntu.com/ubuntu impish-security main" | tee /etc/apt/sources.list.d/impish-security.list
RUN apt update -y
RUN apt upgrade -y

RUN apt install curl ca-certificates openssl git tar bash fontconfig libssl1.1 -y

ENV DEBIAN_FRONTEND noninteractive

# RUN apt-get update -y
# RUN apt-get install libssl1.1 -y


RUN apt install figlet -y
RUN apt install toilet -y
RUN apt install boxes -y
RUN apt-get install lolcat -y

# RUN chmod -R 777 /home/container/

RUN apt install curl -y
RUN apt install wget -y
RUN apt-get update -y
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash -
RUN apt-get install nodejs -y

RUN apt install tar -y
RUN apt-get install xz-utils

# figlet -f larry3d "DNxRG"
# RUN apt install openjdk-11-jdk -y
# RUN clear

WORKDIR /

RUN mkdir /egg

COPY ./index.js /egg/egg.js
COPY ./src /egg/src
COPY ./package.json /egg/package.json
# COPY ./egg-binary /egg/startServer
WORKDIR /egg
RUN npm install
RUN chmod -R 777 /egg


CMD ["/usr/bin.node", "/egg/egg.js"]