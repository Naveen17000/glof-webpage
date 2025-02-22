import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import Header from "./components/Header";
import SensorBox from "./components/SensorBox";
import Graph from "./components/Graph";
import "./styles/App.css";

const App = () => {
  const [latestSensor, setLatestSensor] = useState({});
  const [floatGraphData, setFloatGraphData] = useState({
    labels: [],
    temperature: [],
    humidity: [],
    waterTemperature: [],
  });
  const [shoreGraphData, setShoreGraphData] = useState({
    labels: [],
    temperature: [],
    humidity: [],
    vibration: [],
  });
  const [timeRange, setTimeRange] = useState("hour");
  const [locationName, setLocationName] = useState("");
  const [activeView, setActiveView] = useState("hardware");
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const userId = "ggVVdic7v3gqsBkbQIRYWvlxOFo2"; // Replace with actual user ID
    const dataRef = ref(database, `UsersData/${userId}/readings`);

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          console.error("No data found");
          return;
        }

        const sensorEntries = Object.entries(data);
        if (sensorEntries.length === 0) {
          console.error("No sensor readings available");
          return;
        }

        sensorEntries.sort(([a], [b]) => Number(a) - Number(b));

        const [latestTimestamp, latestValues] = sensorEntries[sensorEntries.length - 1];
        const { floatLatitude, floatLongitude, ...filteredValues } = latestValues;
        setLatestSensor({ timestamp: latestTimestamp, ...filteredValues });

        fetchLocationName(latestValues.floatLatitude, latestValues.floatLongitude);
        updateGraphData(sensorEntries, timeRange);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

    return () => unsubscribe();
  }, [timeRange]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocationName(data.display_name.split(",")[0]);
      } else {
        setLocationName("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Error fetching location");
    }
  };

  const updateGraphData = (data, range) => {
    const now = Date.now() / 1000;
    let filteredData;

    switch (range) {
      case "hour":
        filteredData = data.filter(([timestamp]) => now - Number(timestamp) <= 3600);
        break;
      case "day":
        filteredData = data.filter(([timestamp]) => now - Number(timestamp) <= 86400);
        break;
      case "week":
        filteredData = data.filter(([timestamp]) => now - Number(timestamp) <= 604800);
        break;
      case "month":
        filteredData = data.filter(([timestamp]) => now - Number(timestamp) <= 2592000);
        break;
      default:
        filteredData = data;
    }

    const labels = filteredData.map(([timestamp]) =>
      new Date(Number(timestamp) * 1000).toLocaleString()
    );

    const floatTemperature = filteredData.map(([, values]) => parseFloat(values.floatTemperature || 0));
    const floatHumidity = filteredData.map(([, values]) => parseFloat(values.floatHumidity || 0));
    const floatWaterTemperature = filteredData.map(([, values]) => parseFloat(values.floatWaterTemperature || 0));

    const shoreTemperature = filteredData.map(([, values]) => parseFloat(values.shoreTemperature || 0));
    const shoreHumidity = filteredData.map(([, values]) => parseFloat(values.shoreHumidity || 0));
    const shoreVibration = filteredData.map(([, values]) => parseFloat(values.shoreVibration || 0));

    setFloatGraphData({ labels, temperature: floatTemperature, humidity: floatHumidity, waterTemperature: floatWaterTemperature });
    setShoreGraphData({ labels, temperature: shoreTemperature, humidity: shoreHumidity, vibration: shoreVibration });
  };

  return (
    <div className={`App ${isNavOpen ? "nav-open" : ""}`}>
      <Header />
      <button className="toggle-nav-button" onClick={() => setIsNavOpen(!isNavOpen)}>
        ☰ 
      </button>

      {/* Sidebar Navigation */}
      <div className={`side-nav ${isNavOpen ? "open" : ""}`}>
        <button className="close-nav-button" onClick={() => setIsNavOpen(false)}>✖</button>
        <button className={`nav-button ${activeView === "hardware" ? "active" : ""}`} onClick={() => setActiveView("hardware")}>
          Sensor Based Prediction
        </button>
        <button className={`nav-button ${activeView === "satellite" ? "active" : ""}`} onClick={() => setActiveView("satellite")}>
          Satellite Based Prediction
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="main-content">
      <div className="prediction">
                <i className="fas fa-map-marker-alt"></i>
                <h3>Prediction:</h3>
                <p>"Predictions Based on backend values!</p>
      </div>
        {activeView === "hardware" && (
          <>
            <div className="sensor-container">
              <h2>Float Sensors</h2>
              <div className="location">
                <i className="fas fa-map-marker-alt"></i>
                <h3>Location:</h3>
                <p>{locationName || "Fetching location..."}</p>
                {latestSensor.floatLatitude && latestSensor.floatLongitude && (
                  <p>
                    Lat: {latestSensor.floatLatitude} <br />
                    Long: {latestSensor.floatLongitude}
                  </p>
                )}
              </div>
              <div className="sensor-grid1">
                {Object.keys(latestSensor).filter(key => key.startsWith("float") && key !== "floatLatitude" && key !== "floatLongitude").map((key) => (
                  <SensorBox key={key} name={key.replace("float", "")} value={latestSensor[key]} unit={key.includes("Temperature") ? "°C" : ""} />
                ))}
              </div>

              <h2>Shore Sensors</h2>
              <div className="sensor-grid2">
                {Object.keys(latestSensor).filter(key => key.startsWith("shore")).map((key) => (
                  <SensorBox key={key} name={key.replace("shore", "")} value={latestSensor[key]} unit={key.includes("Temperature") ? "°C" : ""} />
                ))}
              </div>
            </div>

            <div className="time-range-container">
              <label htmlFor="time-range">Select Time Range: </label>
              <select id="time-range" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="custom-select">
                <option value="hour">Last Hour</option>
                <option value="day">Last Day</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Data</option>
              </select>
            </div>

            <div className="graph-container">
              <div className="graph-wrapper">
                <Graph labels={floatGraphData.labels} temperature={floatGraphData.temperature} humidity={floatGraphData.humidity} waterTemperature={floatGraphData.waterTemperature} title={`Float Sensor Data (${timeRange})`} />
              </div>
              <div className="graph-wrapper">
                <Graph labels={shoreGraphData.labels} temperature={shoreGraphData.temperature} humidity={shoreGraphData.humidity} vibration={shoreGraphData.vibration} title={`Shore Sensor Data (${timeRange})`} />
              </div>
            </div>
          </>
        )}

        {activeView === "satellite" && (
          <div className="satellite-view">
            <h2>Satellite Based Prediction</h2>
            <p>This section will display satellite-based predictions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
