export const handleSensorData_endpoint = async (number) => {
  try {
    const response = await fetch(`http://localhost:5000/api/v1/data/${number}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Token-Auth': 'b397e865-c68f-4b30-b065-126547e26abc'
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const jsonData = await response.json();
    
    
    // Assuming 'data' is an array within the JSON response
    if (!Array.isArray(jsonData)) {
      const restructuredData = {
      _id: jsonData.id || null,
      temperature: jsonData.temperature || 0,
      humidity: jsonData.humidity || 0,
      brightness: jsonData.brightness || 0
    }
    
    return restructuredData;

    }else{
      // Restructure each item in the array
      const restructuredData = jsonData.map(item => ({
      _id: item.id || null,
      temperature: item.temperature || 0,
      humidity: item.humidity || 0,
      brightness: item.brightness || 0
      }));
      
      return restructuredData;
    }

    
    
    
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return null; // Return null in case of an error
  }
};
