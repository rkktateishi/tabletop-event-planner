# Tabletop Game Events

## Technology

- React Frontend with TypesScript
    - [MUI](https://www.npmjs.com/package/@mui/material)
    - [MUI X Scheduler](https://www.npmjs.com/package/@mui/x-scheduler?activeTab=readme)
    - [ics](https://www.npmjs.com/package/ics)
    - [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- .NET WebAPI in C#
    - [Entity Framework 6](https://learn.microsoft.com/en-us/ef/ef6/)
    - [Fluent Validation](https://docs.fluentvalidation.net/en/latest/)
- Postgres database
- Docker-Compose
    - Postgres Container
    - React Container
    - .NET Container

## Features

**1. Calendar view**
The primary view will be a Calendar view that will display all currently created events, as well as a button that allows the organizer to create new ones. 

**2. Event creation**
The event organizer can create an event. The Event includes a Name, a Game (dropdown) with Template (see Feature 3), Format (dropdown), Date (date selector), Start/End Time (time selectors), Player Capacity and Description. These events are stored in the database. After selecting a Game the Formats are filtered by the selected Game. The Maximum Capacity of an Event is 30.

**3. Game types & templates**
The app will currently support 3 game types: **Magic: The Gathering**, **Flesh and Blood**, and **Lorcana**. When selecting a Game Type the organizer can also select a template for the given game type. This template includes default values for Format, Player Capacity and Duration. These templates are stored in the databse, though no UI is available to create them currently.

**4. Event Page**
The app will have a simple fixed url Event Page, that will display the Name and all relavent information including the description. The Event Page will also include a downloadable `.ics` file for the event with name, start/end time, and location. The Event Page will also contain a QR Code that can be scanned to open a link to the Event Registration Page.

**5. Event Registration Page**
A simple registration page for a specific event that allows a player to register for an event. Currently this will only require a name. If the given event has already reached capacity display "Unfortunately this event has already been filled." and enforce in the API that no new players can register to an event

### Out of Scope
- Authentication/Authorization of any kind
- Deletion/Editting of Events
- Creation of Templates
- Payments/emails/recurring events

## Models

### Event
- Id - uuid (PK)
- Name - varchar(255)
- Game - uuid (FK to Game)
- Format - uuid (FK to Format)
- StartDateTime - datetime
- EndDateTime - datetime
- Max Capacity - int
- Description - text

### Game
- Id - uuid (PK)
- Name - varchar(255)

### Format
- Id - uuid (PK)
- Name - varchar(255)
- Game - uuid (FK to Game)

### Template
- Id - uuid (PK)
- Name - varchar(255)
- DefaultCapacity - int
- Format - uuid (FK to Format)

### EventRegistration
- Id - uuid (PK)
- Event - uuid (FK to Format)
- PlayerName - varchar(255)

## Seeded Values

### Games
1. Name - **Magic: The Gathering**
2. Name - **Flesh and Blood**
3. Name - **Lorcana**

### Formats
1. Name - **EDH**, Game - **Magic: The Gathering**
2. Name - **Standard**, Game - **Magic: The Gathering**
3. Name - **Modern**, Game - **Magic: The Gathering**
4. Name - **Classic Constructed (CC)**, Game - **Flesh and Blood**
5. Name - **Blitz**, Game - **Flesh and Blood**
6. Name - **Core Constructed**, Game - **Lorcana**
7. Name - **Infinity Constructed**, Game - **Lorcana**

### Templates
1. Name - **MTG - EDH**, Format - **EDH**, Game - **Magic: The Gathering**, DefaultCapacity - **10**
2. Name - **MTG - Standard**, Format - **Standard**, Game - **Magic: The Gathering**, DefaultCapacity - **30**
3. Name - **FAB - CC**, Format - **Classic Constructed (CC)**, Game - **Flesh and Blood**, DefaultCapacity - **30**
4. Name - **Lorcana - CC**, Format - **Core Constructed**, Game - **Lorcana**, DefaultCapacity - **30**