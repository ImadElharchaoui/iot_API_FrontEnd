import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

import { handleSensorData_endpoint } from './Controllers/sensorDataController';
import { handleStatus_endpoint } from './Controllers/StatusController';


const App = () => {
  const [servoPosition, setServoPosition] = useState(90); // Servo default position
  const [ledStatus, setLedStatus] = useState([false, false, false, false]); // LED statuses
  const [sensorData, setSensorData] = useState({
    _id: [],
    temperature: [],
    humidity: [],
    brightness: [],
  }); // Store sensor data
  const [isCooldown, setIsCooldown] = useState(false);

  const MAX_DATA_POINTS = 20;

  const updateSensorData = (newData) => {
    if (sensorData._id.length > 0 && newData.length > 0 && sensorData._id[sensorData._id.length - 1] === newData[newData.length - 1]._id) {
      return null; // No update needed if the last _id matches
    }
    setSensorData((prevData) => {
      const newEntries = Array.isArray(newData) ? newData : [newData]; // Ensure we're working with an array

      return {
        _id: [...prevData._id, ...newEntries.map(item => item._id)].slice(-MAX_DATA_POINTS),
        temperature: [...prevData.temperature, ...newEntries.map(item => item.temperature)].slice(-MAX_DATA_POINTS),
        humidity: [...prevData.humidity, ...newEntries.map(item => item.humidity)].slice(-MAX_DATA_POINTS),
        brightness: [...prevData.brightness, ...newEntries.map(item => item.brightness)].slice(-MAX_DATA_POINTS),
      };
    });
  };

  // Use live data if available, otherwise use example data
  const temperatureData = sensorData.temperature;
  const humidityData = sensorData.humidity;
  const brightnessData = sensorData.brightness;

  const handleServoChange = (event, newValue) => {
    setServoPosition(newValue);
  };

  const handleServoChangeCommitted = (event, newValue) => {
    if (!isCooldown) {
      setIsCooldown(true);
      handleStatus_endpoint(ledStatus,newValue);
      setTimeout(() => setIsCooldown(false), 1000); // 1000ms = 1 second
    }
  };

  const toggleLED = (index) => {
    if (!isCooldown) {
      setIsCooldown(true);
      const newStatus = [...ledStatus];
      newStatus[index] = !newStatus[index];
      setLedStatus(newStatus);
      handleStatus_endpoint(newStatus, servoPosition);
      setTimeout(() => setIsCooldown(false), 1000); // 1000ms = 1 second
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleSensorData_endpoint(sensorData._id.length ? sensorData._id[sensorData._id.length - 1] : -1)
        .then((data) => {
          
          if (data && Array.isArray(data)) {
            // If data is an array, add all items to sensorData
            updateSensorData(data);
          } else if (data) {
            // If data is a single object, wrap it in an array for consistency
            updateSensorData([data]);
          }
        })
        .catch((error) => console.error('Error fetching sensor data:', error));
    }, 5000); // 5000ms = 5 seconds
  
    return () => clearInterval(interval);
  }, [sensorData]);

  const xAxisData = Array.from({ length: temperatureData.length }, (_, index) => index + 1);

  return (
    <div className="bg-[#191919] text-white h-screen p-4">
      <h1 className="text-center text-2xl font-bold mb-4">IoT Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Temperature Graph */}
        <div className="bg-[#242424] p-4 rounded-md">
          <h2 className="text-center mb-2">Temperature</h2>
          <LineChart
            xAxis={[{ data: xAxisData }]}
            series={[{ data: temperatureData }]}
            width={400}
            height={200}
          />
        </div>

        {/* Humidity Graph */}
        <div className="bg-[#242424] p-4 rounded-md">
          <h2 className="text-center mb-2">Humidity</h2>
          <LineChart
            xAxis={[{ data: xAxisData }]}
            series={[{ data: humidityData }]}
            width={400}
            height={200}
          />
        </div>

        {/* Brightness Graph */}
        <div className="bg-[#242424] p-4 rounded-md">
          <h2 className="text-center mb-2">Brightness</h2>
          <LineChart
            xAxis={[{ data: xAxisData }]}
            series={[{ data: brightnessData }]}
            width={400}
            height={200}
          />
        </div>
      </div>

      {/* Servo Control Section */}
      <div className="bg-[#242424] p-4 rounded-md mb-8">
        <h2 className="text-center mb-2">Servo Control</h2>
        <Slider
          value={servoPosition}
          onChange={handleServoChange}
          onChangeCommitted={handleServoChangeCommitted}
          aria-labelledby="servo-slider"
          valueLabelDisplay="auto"
          min={0}
          max={180}
          sx={{ color: '#1db954', opacity: isCooldown ? 0.5 : 1 }}
          disabled={isCooldown}
        />
        <p className="text-center">Position: {servoPosition}°</p>
      </div>

      {/* LED Control Section */}
      <div className="bg-[#242424] p-4 rounded-md">
        <h2 className="text-center mb-4">LED Control</h2>
        <div className="flex justify-center gap-4">
          {ledStatus.map((status, index) => (
            <Button
              key={index}
              variant={status ? 'contained' : 'outlined'}
              color={status ? 'success' : 'error'}
              onClick={() => toggleLED(index)}
              disabled={isCooldown}
              sx={{ opacity: isCooldown ? 0.5 : 1 }}
            >
              LED {index + 1} {status ? 'On' : 'Off'}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;