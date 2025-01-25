# Sapphire Dashboard

This project is used for device management for sapphire.

## Features

- Users Management
- Groups Management
- Device Management
- Project Management
- Host Management

## Documentation

[Documentation](http://localhost:8001/docs)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`JWT_SECRET_KEY`

`JWT_ALGORITHM`

`JWT_EXPIRATION_MINUTES`

`ENCRYPTION_KEY`

`FROM_EMAIL`

`FROM_PASSWORD`

`SMTP_SERVER`

`SMTP_PORT`

## Installation

Install Sapphire Frontend with pnpm

```bash
  pnpm install
```

Install Sapphire Backend with pip

```bash
  python -m venv venv/

  source venv/bin/activate

  uvicorn app.main:app --reload --port 8001
```

## Deployment

To deploy this project run UI

```bash
  pnpm dev
```

To deploy this project run Backend

```bash
  uvicorn app.main:app --reload --port 8001
```
