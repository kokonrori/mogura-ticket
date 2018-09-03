# mogura-ticket

![License](https://img.shields.io/github/license/kokonrori/mogura-ticket.svg)
![node](https://img.shields.io/node/v/passport.svg)

> Realtime & auto scaling ticket reservation using AWS

## Get started

![mogura.cf Screenshot](misc/sample-screenshot.png)

Please test at **2+ browsers** simultaneously.

mogura-ticket features **```realtime```** and **```auto scaling```**.

## Amazon Web Services

**AWS Cloud**

- EC2 (Elastic Compute Cloud)
- CloudFront (CDN)
- ElastiCache (Redis)
- RDS (Relational Database Service, MySQL)
- S3 (Simple Storage Service)
- ELB (Elastic Load Balancing)
- Auto Scaling
- AMI (Amazon Machine Image)
- Route53
- CloudWatch
- IAM (Identity and Access Management)

![network outline](misc/network-diagram.png)

**Data flow**

- socket.io
- Redis Pub/Sub

![data flow](misc/data-flow.png)

## Dependencies
Stuff you need to load:

- [node.js](https://nodejs.org/) - event-driven I/O server-side JavaScript environment based on V8
- [npm](https://www.npmjs.com/) - package manager for node.js
- [forever](https://github.com/foreverjs/forever) - a simple CLI tool for ensuring that a given script runs continuously
- [express.js](http://expressjs.com/) - a node.js web application server framework
- [socket.io](http://socket.io/) - realtime application framework (Node.JS server)
- [mysql](https://www.mysql.com/) - RDBMS
- [redis](http://redis.io/) - in-memory database (KVS)
- [sequelize](https://github.com/sequelize/sequelize) - a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server
- [ec2metadata](https://github.com/kilianc/node-ec2metadata) - a wrapper for EC2 Instance Metadata API

## Usage

### Install node.js & npm module

```Shell
$ sudo yum install -y nodejs npm --enablerepo=epel
```

```Shell
$ sudo npm install -g forever
```

```Shell
$ aws s3 sync --region=ap-northeast-1 s3://mybucket/MoguraTicketWebServer MoguraTicketWebServer
```

```Shell
$ cd MoguraTicketWebServer
$ npm install
```

### Configure auto scaling group option

**Set user data for deploying updated source code**

> from S3 Bucket

```Shell
#!/bin/bash
cd /home/ec2-user
aws s3 sync --region=ap-northeast-1 s3://mybucket/MoguraTicketWebServer MoguraTicketWebServer
cd MoguraTicketWebServer
npm install
forever start -w app.js
```

> from Git

```Shell
#!/bin/bash
cd /home/ec2-user
git clone https://id:password@github.com/mycompany/mogura-ticket.git MoguraTicketWebServer
cd MoguraTicketWebServer
npm install
forever start -w app.js
```
