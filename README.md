# BHURAKSHAK: Mine Safety Sentinel

I am building a web prototype called BHURAKSHAK.

Project:

AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India

SIH Problem Statement:

SIH26025

Organization:

Ministry of Coal / Coal India Limited

Team:

INCYBIC — Team 89

IMPORTANT:

This is a prototype/demo application.

Do not invent:

- real mine data

- government approvals

- DGMS classifications

- official government logos

- real sensor readings

- scientifically validated AI predictions

- real regulatory decisions

Use synthetic DEMO DATA wherever data is required.

The system is intended to demonstrate:

Surface sensor network

→ real-time monitoring

→ sensor health validation

→ anomaly detection

→ spatial + temporal analysis

→ risk assessment

→ GIS visualization

→ evidence-based alerts

→ role-specific decision support

The primary monitoring architecture is a GROUND-SURFACE SENSOR NETWORK deployed above underground mine panels.

The system has three user roles:

1. MINE OPERATOR

2. MINE PLANNER

3. REGULATOR

The three roles must eventually have different dashboards and different information priorities.

Do NOT build the dashboards yet.

For this first step, create only the PROJECT FOUNDATION.

==================================================

TECH STACK

==================================================

Use:

React

TypeScript

Tailwind CSS

UI:

shadcn/ui

Icons:

Lucide React

Charts:

Recharts or Apache ECharts

GIS:

Prefer MapLibre GL JS.

Leaflet / React-Leaflet may be used where appropriate.

Geospatial:

GeoJSON

Turf.js

Animation:

Motion / Framer Motion

Optional premium component inspiration:

21st.dev

React Bits

Use these selectively. Do not make the application flashy.

==================================================

DESIGN DIRECTION

==================================================

The visual identity should be:

Government Command Centre

+

Mining Safety Platform

+

Geospatial Intelligence System

NOT:

generic SaaS

gaming UI

cyberpunk

crypto dashboard

excessive glassmorphism

neon interface

Use:

deep navy

coal charcoal

white

restrained saffron

restrained green

muted earth tones

Use strong typography and information hierarchy.

Cards should have modest corner radius.

Avoid excessive gradients and floating glass cards.

==================================================

APPLICATION ARCHITECTURE

==================================================

Create a clean reusable architecture.

Prepare routes for:

/

landing page

/system

role selection

/operator

operator dashboard

/planner

planner dashboard

/regulator

regulator dashboard

Create reusable components for:

Header

Sidebar

KPI Card

Status Badge

Alert Card

Data Table

Filter Bar

Map Container

Chart Container

Role Card

System Status

Create clean TypeScript interfaces for:

Mine

Panel

Sensor

SensorReading

SensorHealth

RiskZone

Alert

DeformationTrend

MonitoringCoverage

UserRole

Separate mock/demo data from UI components.

Create a clear mock-data layer so real APIs can be connected later.

Do not build fake backend functionality.

For now, make the project structure ready for future APIs.

==================================================

IMPORTANT

==================================================

At this stage:

DO NOT build the complete dashboards.

DO NOT create large amounts of mock data.

DO NOT add complex AI.

DO NOT add the final GIS implementation.

Just establish:

- project structure

- routing

- design system

- reusable components

- typography

- colours

- basic layout

- mock-data architecture

Make sure the project runs correctly before moving to the next stage.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6ac929f8-e9d2-4662-940a-d90163700ba6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
