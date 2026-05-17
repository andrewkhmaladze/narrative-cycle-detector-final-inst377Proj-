// dont forget to import React 
import React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";

// imports the chart parts for chart.js
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";


// Chart.js actually works!!!!!!!!!!!!
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);
// empty string for Vercel
const API_BASE = "";












// home page 
function Home() {
  // stores topic users enter 
  const [topic, setTopic] = useState("large language models");


  const [result, setResult] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [message, setMessage] = useState("");

  //when the user clicks search topic bt
  async function searchTopic() {
    setMessage("Loading ..");

    try {
      const topicResponse = await fetch(`${API_BASE}/api/topic/${topic}`);
      const topicData = await topicResponse.json();
      //save topic
      setResult(topicData);
      // saves the searched topic into supabase search history
      await fetch(`${API_BASE}/api/search-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic
        })
      });

      setMessage("Search complete");
    } catch (error) {
      //DEBUG TOMMOROW 
      setMessage("something went wrong");
    }
  }


  //when the user clicks show ETF mappings bt
  async function loadMappings() {
    try {
      const response = await fetch(`${API_BASE}/api/mappings`);
      const data = await response.json();
      setMappings(data);
    } catch (error) {
      setMessage("Could not load ETF mappings");
    }
  }
  
  
  //ETf closing price line chart info 
  const chartData = {
    // try to get the dates for the bottom of the chart (working)
    labels: result?.prices?.map((item) => item.date) || [],
    datasets: [
      {
        label: "ETF Closing Price",
        data: result?.prices?.map((item) => item.close) || [],
        tension: 0.2
      }
    ]
  };


  //bar chart (newsAPI)
  const newsChartData = {
    //tommorow try to do the same setup as for chartData
    labels: result?.newsTrend?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Daily News Results",
        data: result?.newsTrend?.map((item) => item.count) || []
      }
    ]
  };


  //narative str calc
  let weeklyNewsScore = 0;
  let etfPercentChange = 0;
  let narrativeStrength = 0;

  if (result && result.newsTrend && result.prices && result.prices.length >= 7) {
    //article counts from the last 7 days
    weeklyNewsScore = result.newsTrend.reduce((sum, item) => {
      return sum + item.count;
    }, 0);
    // price 7 trading days ago
    const firstPrice = result.prices[result.prices.length - 7].close;
    //most recent ETF price 
    const lastPrice = result.prices[result.prices.length - 1].close;

    etfPercentChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    //final calc
    narrativeStrength = Math.max(
      0,
      Math.round(
        (weeklyNewsScore / 10) +
        (result.searchResults / 100) +
        (etfPercentChange * 2)
      )
    );
  }

  
  
  
  
  
  
  
  
  
  
  
  
  return (
    <main className="page">
      <h1>Narrative Cycle Detector</h1>

      <p>
        App predicting whether an investment-related topic may be gaining
        attention by comparing ETF data, news data, and search result data.
      </p>

      <section className="searchBox">
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Enter topic"
        />

        <button onClick={searchTopic}>Search Topic</button>

        <button onClick={loadMappings}>Show ETF Mappings</button>
      </section>

      <p className="message">{message}</p>

      {result && (
        <>
          <section className="cards">
            <div className="card">
              <h3>Topic</h3>
              <p>{result.topic}</p>
            </div>

            <div className="card">
              <h3>Mapped ETF</h3>
              <p>{result.etf}</p>
            </div>

            <div className="card">
              <h3>News Results</h3>
              <p>{result.newsCount}</p>
            </div>

            <div className="card">
              <h3>Search Results</h3>
              <p>{result.searchResults}</p>
            </div>
          </section>

          <section className="chartBox">
            <h2>ETF Closing Price Trend</h2>
            <Line data={chartData} />
          </section>

          <section className="chartBox">
            <h2>NewsAPI Daily Article Trend</h2>
            <Bar data={newsChartData} />
          </section>

          <section className="scoreBox">
            <h2>Weekly Narrative Strength Score</h2>
            <p>
              <strong>Narrative Strength Score:</strong> {narrativeStrength}
            </p>

            <p>
              This score combines media attention, online visibility,
              and ETF market movement to estimate how strong the narrative
              currently appears. Scores near 50 or lower indicate weak
              narrative activity, while scores above 150 indicate stronger narrative activity.
            </p>

            <p>
              calculation:
            </p>

            <p>
              Narrative Strength Score =
              (7-Day News Article Count ÷ 10)
              + (Search Visibility Score ÷ 100)
              + (7-Day ETF Percentage Change × 2)
            </p>

            <br />

            <p>
              <strong>Search Visibility Score:</strong> {result.searchResults}
            </p>

            <p>
              This number estimates how much searchable online content currently
              exists for the topic based on Google search result visibility data.
            </p>

            <br />

            <p>
              <strong>7-Day News Article Count:</strong> {weeklyNewsScore} articles
            </p>

            <p>
              The metric that measures how many news articles mentioning the topic were
              published during the last 7 days.
            </p>

            <br />

            <p>
              <strong>7-Day ETF Percentage Change:</strong> {etfPercentChange.toFixed(2)}%
            </p>

            <p>
              Data showing how much the mapped ETF increased or decreased in price
              over the last week. Positive percentages shows ETF growth, while
              negative percentages is ETF decline.
            </p>

            
          </section>
        </>
      )}

      {mappings.length > 0 && (
        <section className="mappingBox">
          <h2>Topic to ETF Mappings</h2>

          {mappings.map((item) => (
            <p key={item.id}>
              <strong>{item.topic}</strong> → {item.etf}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}





















function About() {
  return (
    <main className="page">
      <h1>About This Project</h1>

      <p>
        The Narrative Cycle Detector is the app that looks at
        whether an investment related topic may be gaining attention. This has the power to provide early investment oppertunities. 
      </p>

      <p>
        A financial narrative is a blanket topic in discussion that can be connected to real investment oppertunities. Examples include artificial
        intelligence, clean energy, cybersecurity.
      </p>

      <p>
        The app compares three types of signals:
      </p>

      <ul>
        <li>ETF market performance from Alpha Vantage</li>
        <li>News article activity from NewsAPI</li>
        <li>Search visibility data from Zenserp</li>
      </ul>

      <p>
        My app uses Supabase to store topic to ETF mappings. Example being
        the topic of “large language models” mapping onto the ETF BOTZ.
      </p>

      <p>
        The app generates a final score (Weekly Narrative Strength Score). In addition to the explanation provided on the home page, the score gives
        more weight to recent news activity because recent article activity is a
        stronger sign that a topic is currently active.
      </p>

      
    </main>
  );
}














function Help() {
  return (
    <main className="page">
      <h1>Help</h1>

      <h2>How to Use the App</h2>

      <p>
        Type an investment topic into the search box on the Home page,
        then click the Search Topic botton.
      </p>



      <p>
        The app will then match the topic to an ETF using the
        topic-mapping table (supabase).
      </p>

      <h2>What the Result Cards Mean</h2>

      <ul>
        <li>
          Topic shows the topic searched by the user.
        </li>

        <li>
          Mapped ETF shows the ETF connected to that topic from Supabase.
        </li>

        <li>
          News Results shows how many NewsAPI article results were found for
          the topic.
        </li>

        <li>
          Search Results shows the search visibility number from Zenserp.
        </li>
      </ul>

      <h2>Charts</h2>

      <p>
        The ETF Closing Price Trend chart (line chart) shows how the mapped ETF has moved
        over recent trading days.
      </p>

      <p>
        The NewsAPI Daily Article Trend chart (bar chart) shows how many articles were found
        for the topic on each day during the recent 7-day period.
      </p>

      

      

      <h2>Side note</h2>

      <ul>
        

        <li>
          search results do not mean search volume, they are only a search
          visibility estimate.
        </li>

      </ul>
    </main>
  );
}
















function Functionality() {
  return (
    <main className="page">
      <h1>Project Functionality</h1>

    

      <h2>How the Search Works</h2>

      <p>
        When the user enters a topic and clicks Search Topic, the frontend sends
        a fetch request to the backend route:
      </p>

      <p className="exampleText">
        GET /api/topic/:topic
      </p>

      <p>
        The backend then looks up the topic inside Supabase to find the mapped
        ETF. After that, it requests data from Alpha Vantage, NewsAPI, and
        Zenserp.
      </p>

      <h2>Data Sources Used</h2>

      <ul>
        <li>
          Supabase stores topic-to-ETF mappings and search history
        </li>

        <li>
          Alpha Vantage provides ETF closing price data
        </li>

        <li>
          NewsAPI provides article counts for the searched topic
        </li>

        <li>
          Zenserp provides search-result visibility data
        </li>
      </ul>

      <h2>Frontend Features</h2>

      <ul>
        <li>
          A line chart shows ETF closing price movement.
        </li>

        <li>
          A bar chart shows NewsAPI daily article activity.
        </li>

        <li>
          Result cards show the topic, mapped ETF, news results, and search
          results.
        </li>

        <li>
          And then theres the  Weekly Narrative Strength Score 
        </li>
      </ul>

      <h2>Weekly Narrative Strength Formula</h2>

    

      <p className="exampleText">
        Narrative Strength Score = (7-Day News Article Count ÷ 10) + 
        (Search Visibility Score ÷ 100) + (7-Day ETF Percentage Change × 2)
      </p>

      <p>
        It took me some time to create a formula that correctly identifies burgening topics from redundant ones. The formula gives more weight to recent news activity and less weight
        to search visibility. This formula was settled upon after it was able to deliberate between a host of test topics (of topics associated with growing and declining industries)
      </p>

      <h2>Backend API Routes</h2>

      <ul>
        <li>
          GET /api/topic/:topic gets all data for one searched topic.
        </li>

        <li>
          GET /api/mappings retrieves ETF mappings from supabase
        </li>

        <li>
          POST /api/search-history saves searched topics into Supabase.
        </li>
      </ul>

      
    </main>
  );
}




//nav between each pg 
function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/functionality">Functionality</Link>
        <Link to="/help">Help</Link>
      </nav>









      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/functionality" element={<Functionality />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;