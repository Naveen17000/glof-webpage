// src/components/SensorBox.js
import React from "react";
import "../styles/App.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const sensorIcons = {
  "Water Temperature": "fas fa-thermometer-half",
  "humidity": "fas fa-tint",
  "X-Axis": "fas fa-arrows-alt-h",
  "Y-Axis": "fas fa-arrows-alt-v",
  "Z-Axis": "fas fa-expand-arrows-alt",
  "temperature": "fas fa-thermometer-half",

};

const SensorBox = ({ name, value, unit }) => {
  const iconClass = sensorIcons[name] || "fas fa-info-circle";
  const boxClass = `sensor-box ${name.toLowerCase().replace(" ", "-")}`;

  return (
    <div className={boxClass}>
      <i className={iconClass}></i>
      <h3>{name}</h3>
      <p>
        {value} {unit}
      </p>
    </div>
  );
};

export default SensorBox;
