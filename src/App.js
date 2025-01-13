import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import Header from "./components/Header";
import SensorBox from "./components/SensorBox";
import Graph from "./components/Graph";
import "./styles/App.css";

const App = () => {
  const [latestSensor, setLatestSensor] = useState({});
  const [graphData, setGraphData] = useState({
    labels: [],
    temperature: [],
    humidity: [],
    waterTemperature: [],
  });
  const [allData, setAllData] = useState([]);
  const [timeRange, setTimeRange] = useState("hour");
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    const userId = "odWVwmDoVLXX9DrfCq87R6x8j0u2"; // Replace with your actual user ID
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

        // Sort readings by timestamp
        sensorEntries.sort(([a], [b]) => Number(a) - Number(b));

        // Get the latest reading
        const [latestTimestamp, latestValues] = sensorEntries[sensorEntries.length - 1];
        setLatestSensor({ timestamp: latestTimestamp, ...latestValues });

        fetchLocationName(latestValues.Latitude, latestValues.Longitude);
        console.log(latestValues.Latitude, latestValues.Longitude);
        setAllData(sensorEntries);
        updateGraphData(sensorEntries, timeRange);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

    return () => unsubscribe();
  }, [timeRange]);

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      if (data.display_name) {
        const placeName = data.display_name.split(",")[0]; // Extract the first part of the address
        setLocationName(placeName);
      } else {
        setLocationName("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Error fetching location");
    }
  };

  const updateGraphData = (data, range) => {
    const now = Date.now() / 1000; // Current time in seconds
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
    const temperature = filteredData.map(
      ([, values]) => parseFloat(values.temperature || 0)
    );
    const humidity = filteredData.map(
      ([, values]) => parseFloat(values.humidity || 0)
    );
    const waterTemperature = filteredData.map(
      ([, values]) => parseFloat(values["Water Temperature"] || 0)
    );

    setGraphData({ labels, temperature, humidity, waterTemperature });
  };

  const handleTimeRangeChange = (event) => {
    const selectedRange = event.target.value;
    setTimeRange(selectedRange);
    updateGraphData(allData, selectedRange);
  };


  return (
    <div className="App">
          <Header />
          <div className="sensor-container">
            <div className="sensor-box location">
              <i className="fas fa-map-marker-alt"></i>
              <h3>Location:</h3>
              <p>{locationName || "Fetching location..."}</p>
              {latestSensor.Latitude && latestSensor.Longitude && (
                <p>
                  Lat: {latestSensor.Latitude}
                  <br />
                  Long: {latestSensor.Longitude}
                </p>
              )}
            </div>

            {Object.keys(latestSensor).map((key) => {
              if (key !== "timestamp" && key !== "Latitude" && key !== "Longitude") {
                return (
                  <SensorBox
                    key={key}
                    name={key}
                    value={latestSensor[key]}
                    unit={
                      key === "temperature" || key === "Water Temperature" ? "°C" : ""
                    }
                  />
                );
              }
              return null;
            })}
          </div>

          <div className="time-range-container">
            <label htmlFor="time-range">Select Time Range: </label>
            <select id="time-range" value={timeRange} onChange={handleTimeRangeChange}>
              <option value="hour">Last Hour</option>
              <option value="day">Last Day</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Data</option>
            </select>
          </div>

          <div className="graph-container">
            <Graph
              labels={graphData.labels}
              temperature={graphData.temperature}
              humidity={graphData.humidity}
              waterTemperature={graphData.waterTemperature}
              title={`Sensor Data (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`}
            />
          </div>
    </div>
  );
};

export default App;
