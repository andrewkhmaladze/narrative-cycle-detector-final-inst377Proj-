# Developer Manual

## Project Overview

Used in project:
-React
-React Router
-Chart.js
-React Chart.js 2
-Node.js
-Express
-Supabase
-Alpha Vantage
-NewsAPI
-Zenserp

## How to install your application and all dependencies

1-"git clone"
2-once inside narrative-cycle-detector (terminal), "npm install" to install backend dependencies
3-"cd client"
4-"npm install" to install frontend dependencies

In order to access all necessary APIs, you must create a .env file populated with working keys for the following 

ALPHA_KEY=your_alpha_vantage_key
NEWS_KEY=your_newsapi_key
ZENSERP_KEY=your_zenserp_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_publishable_key


## How to run your application on a server
 
Once in "narrative-cycle-detector" fodler (terminal), run the follwoing command "npm start" to start the backend server.
Output: http://localhost:3000

Continue by opening a second terminal and switch to the "client" folder (terminal), run the command "npm run dev" to start the frontend server.
Output: http://localhost:5173


## API endpoints 

GET /api/topic/:topic

It gets data for one searched topic

example: GET /api/topic/large%20language%20models

-Gets the topic from the URL
-Looks up the matching ETF in supabase
-Calls Alpha Vantage for ETf price data
-Calls NewsAPI for article data
-Calls Zenserp for search visibility data
-Sends the cleaned result back to the frontend







GET /api/mappings

This endpoint retrieves topic-to-ETF mappings from the Supabase topic_mappings table.
Result is seen when the user clicks "Show ETF Mappings".








POST /api/search-history

Endpoint that writes searched topics into the Supabase search_history table.

example {"idx":0,"id":1,"topic":"large language models","created_at":"2026-05-15 00:29:55.326676"}


## JavaScript Libraries 

-React
-React Router
-Chart.js
-React Chart.js 2

React Router is used for multiple pages, Chart.js and React Chart.js 2 are used for the ETF line chart and NewsAPI bar chart

## Road-map for future development

The most presing matter is that the app relies on a configuerd table on Supabase. For this project to see adoption, it must recieve an update
which would include a AI-assisted topic mapping system that can suggest a related ETF based on the user’s searched topic instead of relying only on a pre-configured Supabase table. The AI system would help create new topic-to-ETF matches when a topic is not already in the database.

## Known Bugs and Issues

-free API plans have request limits
-topic mapping only works for topics already stored in Supabase
-some ETF mappings are rough sector matches