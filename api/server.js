// tools for backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
// lets the frontend talk to the backend
app.use(cors());
// lets the backend read JSON data sent from the frontend
app.use(express.json());

// connects to supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// function the matching eTF for a topic from supabase
async function getEtf(topic) {
  const cleanTopic = topic.toLowerCase().trim();

  const { data, error } = await supabase
    .from("topic_mappings")
    .select("*");

  if (error) {
    console.log("Supabase mapping error:", error.message);
    return null;
  }

  const match = data.find((row) => {
    return row.topic.toLowerCase().trim() === cleanTopic;
  });

  if (!match) {
    return null;
  }

  return match.etf;
}

/*

GET DATABASE DATA

*/
//route sends all topic-to-ETf mappings from supabase to frontend
app.get("/api/mappings", async (req, res) => {
  const { data, error } = await supabase
    .from("topic_mappings")
    .select("*");

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);
});







/*

WRITE DATABASE DATA

*/
// route saves the topic the user searched
app.post("/api/search-history", async (req, res) => {
  const topic = req.body.topic;
  // inserts the topic into  search_history table
  const { data, error } = await supabase
    .from("search_history")
    .insert([
      {
        topic: topic
      }
    ])
    .select();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);
});

/*

MAIN API ENDPOINT

*/
// main route, gets all data for one searched topic
app.get("/api/topic/:topic", async (req, res) => {
  const topic = req.params.topic;

  const etf = await getEtf(topic);
  //stop and send empty results
  if (!etf) {
    return res.json({
      topic: topic,
      etf: "No ETF mapping found",
      newsCount: 0,
      searchResults: 0,
      prices: [],
      newsTrend: []
    });
  }

  try {
    /*

    ALPHA VANTAGE

    */

    const alphaUrl =
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${etf}&apikey=${process.env.ALPHA_KEY}`;

    /*

    NEWS API

    */

    const newsUrl =
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=5&apiKey=${process.env.NEWS_KEY}`;

    const newsTrend = [];
    // list stores article counts for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      // create next day (so API has a start/end date)
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const fromDate = day.toISOString().split("T")[0];
      const toDate = nextDay.toISOString().split("T")[0];
      // builds NewsAPI request for each day (Ran out of tockens, redesign maybe)
      const dailyNewsUrl =
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&from=${fromDate}&to=${toDate}&pageSize=1&apiKey=${process.env.NEWS_KEY}`;
      
      const dailyNewsResponse = await fetch(dailyNewsUrl);
      // to JSON
      const dailyNewsData = await dailyNewsResponse.json();
      
      // feed data to bar chart 
      newsTrend.push({
        date: fromDate,
        count: dailyNewsData.totalResults || 0
      });
    }




    /*
  
    ZENSERP

    */

    const zenserpUrl =
      `https://app.zenserp.com/api/v2/search?q=${encodeURIComponent(topic)}`;

    /*
 
    FETCH REQUESTS
  
    */

    const alphaResponse = await fetch(alphaUrl);

    const newsResponse = await fetch(newsUrl);

    const zenserpResponse = await fetch(zenserpUrl, {
      headers: {
        apikey: process.env.ZENSERP_KEY
      }
    });

    /*
 
    CONVERT TO JSON
  
    */
    // Alpha Vantage response to avascript data
    const alphaData = await alphaResponse.json();
    //debug 
    console.log("ALPHA DATA:", alphaData);

    const newsData = await newsResponse.json();
    console.log("NEWS DATA:", newsData);

    const zenserpData = await zenserpResponse.json();

    /*
  
    GET ETF PRICE DATA
   
    */
    // gets daily ETF prices from alpha vantage
    // does not send prices, use an empty object
    const timeSeries =
      alphaData["Time Series (Daily)"] || {};

    const dates =
      Object.keys(timeSeries)
        .slice(0, 90)
        .reverse();

    
    //date and closing price list
    const prices = dates.map((date) => {
      return {
        date: date,
        close: Number(
          timeSeries[date]["4. close"]
        )
      };
    });













    /*
    
    SEND DATA TO FRONTEND
    
    */

    res.json({

      
      topic: topic,

      etf: etf,

      newsCount:
        newsData.totalResults || 0,

      searchResults:
        zenserpData.number_of_results || 0,

      prices: prices,

      newsTrend: newsTrend
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "API request failed"
    });
  }
});

/*

START SERVER

*/

if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log(
      "Server running http://localhost:3000"
    );
  });
}
//attempt fix 1 (Vercel): Express app for the deployed backend 
export default app;