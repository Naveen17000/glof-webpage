import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Graph = ({ labels, temperature, humidity, waterTemperature, title }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperature,
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)", // Red for temperature
        tension: 0.1,
      },
      {
        label: "Humidity (%)",
        data: humidity,
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)", // Blue for humidity
        tension: 0.1,
      },
      {
        label: "Water Temperature (°C)",
        data: waterTemperature,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)", // Green for water temperature
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default Graph;
