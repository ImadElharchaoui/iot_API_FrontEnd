export const handleStatus_endpoint = async(ledStatus, ServoStatus) => {
  console.log("status:", ledStatus, ServoStatus)
  try {
    const response = await fetch('http://localhost:5000/api/v1/status', {
      method: 'PUT', // Use GET method to retrieve data
      headers: {
        'Content-Type': 'application/json', // Ensure server knows we're expecting JSON
        'X-Token-Auth': 'b397e865-c68f-4b30-b065-126547e26abc',
        body: JSON.stringify({ 
          leds_stats: ledStatus,
          servo: ServoStatus }),
      },
    });

    // Check if the response is successful (status code 200-299)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json(); // Parse the JSON response from the server
    return data; // Return the data from the function
  } catch (error) {
    console.error("Error fetching sensor data:", error); // Handle errors
  }
};
