# GeoRelief API Endpoint Reference
These are the endpoints for the GeoRelief API

## Contents
1. [Areas](#areas)
  + [`POST` /areas](#post-areas)
  + [`GET` /areas](#get-areas)
  + [`GET` /areas/:area](#get-areasarea)
  + [`DELETE` /areas](#delete-areas)
2. [Contact](#contact)
  + [`POST` /contact](#post-contact)
3. [Institutions](#institutions)
  + [`POST` /institutions](#post-institutions)
  + [`GET` /institutions](#get-institutions)
  + [`GET` /institutions/:id](#get-institutionsid)
4. [Locations](#locations)
  + [`POST` /locations](#post-locations)
  + [`GET` /locations](#get-locations)
  + [`GET` /locations/type/:type](#get-locationstypetype)
5. [Logs](#logs)
  + [`POST` /log](#post-log)
  + [`GET` /log/:loc_id](#get-logloc_id)
  + [`GET` /log/cluster/:loc_id/:cluster](#get-logclusterloc_idcluster)
6. [Services](#services)
  + [`POST` /services](#post-services)
  + [`PUT` /services/:id](#put-servicesid)
  + [`GET` /services/:loc_id](#get-servicesloc_id)
  + [`GET` /services/cluster/:loc_id/:cluster](#get-servicesclusterloc_idcluster)
  + [`GET` /services/:service_id](#get-servicesservice_id)
  + [`GET` /services/cluster/:cluster](#get-servicescluster)
7. [Users](#users)
  + [`POST` /login](#post-login)
  + [`POST` /users](#post-users)
  + [`POST` /password](#post-password)
  + [`POST` /users/approve](#post-usersapprove)
  + [`GET` /logout](#get-logout)
  + [`GET` /users/:id](#get-usersid)
  + [`GET` /users/institution/:institution](#get-usersinstitutioninstitution)
  + [`GET` /users/confirm/:key](#get-usersconfirmkey)

## Areas
#### Area Properties
| Name        | Type   | Description                                                                           |
| ----------- | ------ | ------------------------------------------------------------------------------------- |
| _id         | String | Name and unique identifier of the area                                                |
| _rev        | String | Revision number of the relief area                                                    |
| date        | Date   | Date and time relief area was added                                                   |
| coordinates | String | JSON encoded string containing the Latitude, Longitude, and Zoom level of relief area |

### `POST` /areas
Add an area to the table.

#### Parameters
| Name        | Type   | Description                                                                       |
| ----------- | ----   | --------------------------------------------------------------------------------- |
| name        | String | Name of the area                                                                  |
| coordinates | String | JSON encoded string containing the Latitude, Longitude, and Zoom level of the map |

#### Example
```javascript
var area = {
    name: "New Area";
    coordinates: "{\"lat\": 40.6451056, \"lon\": -73.9962453, \"zoom\": 13}"
}
```

### `GET` /areas
Get all areas.

#### Returns
An array of all relief areas.

#### Example
```json
[
    {
        "_id": "Minneapolis",
        "_rev": "1-5cb090e13e57b1813811770ab8434a66",
        "date": "2013-06-30T20:51:09.487Z",
        "coordinates": "{\"lat\":44.97466550157047, \"lon\":-93.26611518859863, \"zoom\":14}"
    },
    {
        "_id": "New York",
        "_rev": "2-e3b12e17b5f6f470eca6ecb523ce0dd3",
        "date": "2013-06-08T23:42:51.734Z",
        "coordinates": "{\"lat\": 40.6451056, \"lon\": -73.9962453, \"zoom\": 13}"
    },
    {
        "_id": "Syria",
        "_rev": "21-62585e15c9b1fd71160a592cfa188c06",
        "date": "2013-06-08T22:42:51.214Z",
        "coordinates": "{\"lat\": 34.72919834205246, \"lon\": 36.71493530273437, \"zoom\": 13}"
    }
]
```

### `GET` /areas/:area
Get a single area.

#### Returns
The specified area

#### Parameters
| Name        | Type   | Description              |
| ----------- | ----   | ------------------------ |
| area        | String | Name of the area         |

#### Example
```json
{
    "_id": "Syria",
    "_rev": "21-62585e15c9b1fd71160a592cfa188c06",
    "date": "2013-06-08T22:42:51.214Z",
    "coordinates": "{\"lat\": 34.72919834205246, \"lon\": 36.71493530273437, \"zoom\": 13}"
}
```

### `DELETE` /areas
Delete an area.

#### Parameters
| Name        | Type   | Description              |
| ----------- | ----   | ------------------------ |
| name        | String | Name of the area         |
| rev         | String | Revision of the document |

#### Example
```javascript
var area = {
    name: "Delete This Area";
    rev: "1-5cb090e13e57b1813811770ab8434a66"
}
```

## Contact
### `POST` /contact
Send message to GeoRelief administrator

#### Parameters
| Name        | Type   | Description               |
| ----------- | ----   | ------------------------- |
| name        | String | Name of the sender        |
| email       | String | Email of the sender       |
| regarding   | String | What the message is about |
| message     | String | Body of the message       |

#### Example
```javascript
var formData = {
    name: "Real Name",
    email: "example@email.com",
    regarding: "Bug Report",
    message: "The contact form doesn't work!"
}
```

## Institutions
#### Institution Properties
| Name           | Type          | Description                                                |
| -------------- | ------------- | ---------------------------------------------------------- |
| _id            | String        | Institution's unique identifier                            |
| _rev           | String        | Document revision                                          |
| name           | String        | Name of the institution                                    |
| url            | String        | URL of the institution                                     |
| description    | String        | Description of the institution                             |
| approvedEmails | Array[String] | Array of emails approved to register under the institution |

### `POST` /institutions
Add an institution to the table.

#### Parameters
| Name        | Type   | Description                    |
| ----------- | ------ | ------------------------------ |
| name        | String | Name of the institution        |
| url         | String | URL of the institution         |
| description | String | Description of the institution |

#### Example
```javascript
var institution = {
    name: "Institution Name",
    url: "http://example.com/",
    description: "Short description of my brand new institution!"
}
```

### `GET` /institutions
Get all institutions.

#### Returns
An array of all institutions.

#### Example
```json
[
    {
        "_id": "4b61f34780a83a95e503ad835b00109f",
        "_rev": "112-37ef7d5e60f7cd84321ee3fb3a9401d4",
        "name": "Action Against Hunger (AAH)",
        "url": "http://www.aah-usa.org/",
        "description": "Develops and runs emergency programs in nutrition, health, water and food security for countries in need. Also provides disaster preparedness programs with the goal of anticipating and preventing humanitarian crises.",
        "approvedEmails": [
            "example@email.com"
        ]
    },
    {
        "_id": "4b61f34780a83a95e503ad835b001d69",
        "_rev": "2-0854e647df3f096b67e62bfc7f6892c2",
        "name": "CARE",
        "url": "http://www.careusa.org/",
        "description": "CARE is one of the world's largest private international humanitarian organizations, committed to helping families in poor communities improve their lives and achieve lasting victories over poverty. Founded in 1945 to provide relief to survivors of World War II, CARE quickly became a trusted vehicle for the compassion and generosity of millions."
    }
]
```

### `GET` /institutions/:id
Get a single institution

#### Parameters
| Name | Type   | Description                     |
| ---- | ------ | ------------------------------- |
| id   | String | Institution's unique identifier |

#### Example
```json
{
    "_id": "4b61f34780a83a95e503ad835b00109f",
    "_rev": "112-37ef7d5e60f7cd84321ee3fb3a9401d4",
    "name": "Action Against Hunger (AAH)",
    "url": "http://www.aah-usa.org/",
    "description": "Develops and runs emergency programs in nutrition, health, water and food security for countries in need. Also provides disaster preparedness programs with the goal of anticipating and preventing humanitarian crises.",
    "approvedEmails": [
        "example@email.com",
    ]
}
```

## Locations
### `POST` /locations
### `GET` /locations
### `GET` locations/type/:type

## Logs
### `POST` /log
### `GET` /log/:loc_id
### `GET` /log/cluster/:loc_id/:cluster

## Services
### `POST` /services
### `PUT` /services/:id
### `GET` /services/:loc_id
### `GET` /services/cluster/:loc_id/:cluster
### `GET` /services/:service_id
### `GET` /services/cluster/:cluster

## Users
### `POST` /login
Log the user in.

#### Parameters
+ `username`
+ `password`

#### Returns
```javascript
{
    "_id": String "User ID",
    "_rev": String "Revision",
    "name": String "Username",
    "realname": String "Real Name",
    "institution": String "Institution ID",
    "email": String "User Email",
    "type": String "User Type",
    "roles": Array "User Roles",
    "level": String "User Level",
    "phone": Int "User Phone Number",
    "cluster": String "User Cluster",
    "institutionName": String "Institution Name",
    "institutionUrl": String "Institution URL"
}
```

### `POST` /users
### `POST` /password
### `POST` /users/approve
### `GET` /logout
### `GET` /users/:id
### `GET` /users/institution/:institution
### `GET` /users/confirm/:key