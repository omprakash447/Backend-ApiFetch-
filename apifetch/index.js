const express = require("express");
const server = express();
const requests = require("requests");

// Serve static files (CSS, JS if needed)
server.use(express.static("public"));

// Route to display the HTML form
server.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weather App</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    text-align: center;
                    transition: background-color 0.5s;
                }
                input, button {
                    padding: 10px;
                    margin: 10px;
                    font-size: 16px;
                }
                #result {
                    margin-top: 20px;
                    font-size: 18px;
                }
            </style>
        </head>
        <body>
            <h1>Weather App</h1>
            <form id="weatherForm">
                <input type="text" id="cityInput" name="city" placeholder="Enter city name" required />
                <button type="submit">Get Weather</button>
            </form>
            <div id="result"></div>

            <script>
                document.getElementById("weatherForm").addEventListener("submit", function(event) {
                    event.preventDefault();
                    const cityName = document.getElementById("cityInput").value;

                    fetch(\`/about?name=\${cityName}\`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                document.getElementById("result").innerHTML = data.error;
                                document.body.style.backgroundColor = "";
                            } else {
                                document.getElementById("result").innerHTML = \`
                                    <h2>Weather Info for \${data.city}</h2>
                                    <p>Temperature: <strong>\${data.temp}°C</strong></p>
                                    <p>Weather description: <strong>\${data.description}</strong></p>
                                \`;

                                // Change background color dynamically based on temperature
                                const temp = data.temp;
                                let bgColor = "";
                                if (temp > 30) {
                                    bgColor = "red"; // Hot weather
                                } else if (temp >= 15 && temp <= 30) {
                                    bgColor = "lightblue"; // Moderate weather
                                } else {
                                    bgColor = "lightgray"; // Cold weather
                                }
                                document.body.style.backgroundColor = bgColor;
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching weather data:", err);
                            document.getElementById("result").innerHTML = "<p>Error fetching weather data.</p>";
                            document.body.style.backgroundColor = "";
                        });
                });
            </script>
        </body>
        </html>
    `);
});

// Route to handle the weather data request
server.get("/about", (req, res) => {
    const cityName = req.query.name;

    if (!cityName) {
        return res.json({ error: "Please provide a city name." });
    }

    const apiKey = "349477084d53cb0f63513f22dfa5dedc";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;

    requests(url)
        .on("data", (chunk) => {
            const weatherData = JSON.parse(chunk);
            const weatherArray = [weatherData];

            if (weatherArray[0].cod === 200) {
                // Extracting weather information
                const city = weatherArray[0].name;
                const temp = weatherArray[0].main.temp;
                const description = weatherArray[0].weather[0].description;

                // Sending data as JSON to the front-end
                res.json({
                    city: city,
                    temp: temp,
                    description: description
                });
            } else {
                res.json({ error: "City not found. Please try again." });
            }
        })
        .on("error", (err) => {
            console.log("API call failed:", err);
            res.json({ error: "Unable to fetch weather data at the moment. Please try again later." });
        });
});

server.listen(4000, () => {
    console.log("Server running on http://localhost:2000");
});