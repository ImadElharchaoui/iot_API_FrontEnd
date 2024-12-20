import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

import { handleSensorData_endpoint } from './Controllers/sensorDataController';
import { handleLeds_endpoint } from './Controllers/LedController';
import { handleServo_endpoint } from './Controllers/ServoController';

const App = () => {
  const [servoPosition, setServoPosition] = useState(90); // Servo default position
  const [ledStatus, setLedStatus] = useState([false, false, false, false]); // LED statuses
  const [sensorData, setSensorData] = useState({
    temperature: [],
    humidity: [],
    brightness: [],
  }); // Store sensor data
  const [isCooldown, setIsCooldown] = useState(false);

  const MAX_DATA_POINTS = 20;

  const updateSensorData = (newData) => {
    setSensorData((prevData) => {
      return {
        temperature: [...prevData.temperature, newData.temperature].slice(-MAX_DATA_POINTS),
        humidity: [...prevData.humidity, newData.humidity].slice(-MAX_DATA_POINTS),
        brightness: [...prevData.brightness, newData.brightness].slice(-MAX_DATA_POINTS),
      };
    });
  };

  // Example data for graphs (initial values)
  const temperatureData = sensorData.temperature.length > 0 ? sensorData.temperature : [22, 23, 24, 25, 26, 27];
  const humidityData = sensorData.humidity.length > 0 ? sensorData.humidity : [40, 42, 43, 45, 50, 55];
  const brightnessData = sensorData.brightness.length > 0 ? sensorData.brightness : [80, 82, 85, 88, 90, 92];

  // Function to handle the slider movement (real-time update)
  const handleServoChange = (event, value) => {
    setServoPosition(value);
  };

  // Function to handle when the user commits to the new position (mouse up)
  const handleServoChangeCommitted = (event, value) => {
    if (!isCooldown) {
      setIsCooldown(true);
      handleServo_endpoint(value);

      setTimeout(() => {
        setIsCooldown(false);
      }, 1000); // 1000ms = 1 second
    }
  };

  const toggleLED = (index) => {
    if (!isCooldown) {
      setIsCooldown(true);
      const newStatus = [...ledStatus];
      newStatus[index] = !newStatus[index];
      setLedStatus(newStatus);
      handleLeds_endpoint(newStatus);

      setTimeout(() => {
        setIsCooldown(false);
      }, 1000); // 1000ms = 1 second
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleSensorData_endpoint()
        .then((data) => {
          if (data) {
            updateSensorData({
              temperature: data.temperature || 0,
              humidity: data.humidity || 0,
              brightness: data.brightness || 0,
            });
          }
        })
        .catch((error) => console.error('Error fetching sensor data:', error));
    }, 5000); // 5000ms = 5 seconds

    return () => clearInterval(interval);
  }, []);

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
          onChange={handleServoChange} // Tracks position as user slides
          onChangeCommitted={handleServoChangeCommitted} // Updates when mouse is released
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