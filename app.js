function WeatherApp() {
  this.apiKey = "YOUR_API_KEY";

  this.searchInput = document.querySelector("#searchInput");
  this.searchBtn = document.querySelector("#searchBtn");
  this.weatherContainer = document.querySelector("#weatherContainer");
}

/* ================= INIT ================= */

WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
  this.showWelcome();
};

/* ================= SEARCH ================= */

WeatherApp.prototype.handleSearch = function () {
  const city = this.searchInput.value.trim();

  if (!city) return;

  this.getWeather(city);
};

/* ================= FETCH WEATHER ================= */

WeatherApp.prototype.getWeather = async function (city) {
  this.showLoading();

  try {
    const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error("City not found");
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    this.displayWeather(currentData);

    const processedForecast = this.processForecastData(forecastData);
    this.displayForecast(processedForecast);

  } catch (error) {
    this.showError("City not found. Please try again.");
  }
};

/* ================= PROCESS FORECAST ================= */

WeatherApp.prototype.processForecastData = function (data) {
  return data.list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);
};

/* ================= DISPLAY CURRENT WEATHER ================= */

WeatherApp.prototype.displayWeather = function (data) {
  const iconURL = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  this.weatherContainer.innerHTML = `
    <div class="current-weather">
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${iconURL}" alt="weather icon" />
      <p class="temperature">${Math.round(data.main.temp)}°C</p>
      <p>${data.weather[0].description}</p>
    </div>
  `;
};

/* ================= DISPLAY FORECAST ================= */

WeatherApp.prototype.displayForecast = function (forecastArray) {

  let forecastHTML = `
    <div class="forecast-section">
      <h3 class="forecast-title">5-Day Forecast</h3>
      <div class="forecast-container">
  `;

  forecastArray.forEach(item => {
    const date = new Date(item.dt_txt);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const iconURL = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    forecastHTML += `
      <div class="forecast-card">
        <h4>${day}</h4>
        <img src="${iconURL}" alt="icon" />
        <p>${Math.round(item.main.temp)}°C</p>
        <p>${item.weather[0].description}</p>
      </div>
    `;
  });

  forecastHTML += `
      </div>
    </div>
  `;

  this.weatherContainer.innerHTML += forecastHTML;
};

/* ================= STATES ================= */

WeatherApp.prototype.showLoading = function () {
  this.weatherContainer.innerHTML = "<p>Loading weather data...</p>";
};

WeatherApp.prototype.showError = function (message) {
  this.weatherContainer.innerHTML = `<p style="color:red;">${message}</p>`;
};

WeatherApp.prototype.showWelcome = function () {
  this.weatherContainer.innerHTML = `
    <p>Welcome! 🌎</p>
    <p>Search for a city to see current weather and 5-day forecast.</p>
  `;
};

/* ================= CREATE INSTANCE ================= */

const app = new WeatherApp();
app.init();