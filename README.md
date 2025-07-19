
# FLEETLINK

Logistic vehicles booking system



## Run Locally

Clone the project

```bash
  git clone https://github.com/sumitprajapati1/fleetlink.git
```

Go to the project directory for starting backend

```bash
  cd server
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start or node --watch src/server.js
```
Go to the project directory for starting frontend

```bash
  cd client
```

```bash
  npm install
```
```bash
  pnpm dev
```


## API Reference

#### Vehicles APIs


##### Api for creating vehicles
```http
  POST /api/vehicles/     
```
##### Api for getting vehicle according to query
```http
  GET /api/vehicles/available?capacityRequired=5000&fromPincode=100000&toPincode=999999&startTime=2025-07-30T13%3A55%3A00.000Z
```

##### Api for getting all vehicles stored in database 
```http
  GET /api/vehicles/
```

### Bookings APIs

##### Api for creating bookings
```http
  POST /api/bookings/
```

##### Api for getting all bookings
```http
  GET /api/bookings/
```

##### Api for getting bookings from id 
```http
  GET /api/bookings/:id
```

##### Api for delete bookings from id 
```http
  DELETE /api/bookings/:id
```

