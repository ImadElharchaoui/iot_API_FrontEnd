export const handleStatus_endpoint = async (ledStatus, ServoStatus) => {
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Token-Auth': 'b397e865-c68f-4b30-b065-126547e26abc',
      },
      body: JSON.stringify({ 
        leds_stats: ledStatus,
        servo: ServoStatus 
      }),
    });

    // Check if the response is successful (status code 200-299)
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json(); // Parse the JSON response from the server
    return data; // Return the data from the function
  } catch (error) {
    console.error("Error updating status:", error); // Handle errors
    return null; // Optionally return null or another default value
  }
};


export const GetStatus_endpoint = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Token-Auth': 'b397e865-c68f-4b30-b065-126547e26abc',
      }});

    // Check if the response is successful (status code 200-299)
    
   // Check if the response is successful (status code 200-299)
   if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data = await response.json(); // Parse the JSON response from the server
  return data; // Return the data from the function
} catch (error) {
  console.error("Error updating status:", error); // Handle errors
  return null; // Optionally return null or another default value
}
};