<h1 align="center">
  <img alt="architecture-overview" title="#app-architecture" src="./assets/architecture.svg" />
</h1>

## ℹ️ Prerequisites

- [Docker](https://docs.docker.com/engine/install/)

## ℹ️ Description

This repo contains a microservices API built with NestJS, RabbitMQ and Docker of a Loan Broker.

The Loan Broker interacts with the Credit Bureau and with different Banks.

After retrieving **the credit score** from Credit Bureau, the **Loan Broker** requests a loan simulation on each bank by publishing the message to the appropiate **Bank Queue**. From that point, each bank
has 1 minute to reply with a loan simulation. After receiving all the expected responses (in that case 3) or after the expire time is exceeded, the **Loan Broker** aggregates the responses from each bank using
the correlationId and replies back to the client with the best quotation received.

## 🚀 Running the app

Before running the app, make sure you create a .env file for each application (loan-quotes,credit-bureau,bank-c,bank-b,bank-a) using
the .env.example file

```bash

$ docker compose up -d

```

## ℹ️ Before requesting loan simulations, make sure you register some records on Credit Bureau. You can use the following cURL to create some records

```bash

$ curl --location --request POST 'http://localhost:3001/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "SSN": "416-81-1997",
    "fullName": "Andrei Radu",
    "creditScore" : 4.23
}'

```

## After createing some records on Credit Bureau, you can request a loan quote. You can use the following cURL

```bash

curl --location --request POST 'http://localhost:3000' \
--header 'Content-Type: application/json' \
--data-raw '{
    "SSN": "1971206035254",
    "amount": 50000
}'

```
