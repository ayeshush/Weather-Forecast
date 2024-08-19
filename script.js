const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const currentWeatherItemsEl = document.getElementById("current-weather-items");
const timezone = document.getElementById("time-zone");
const countryEl = document.getElementById("country");
const weatherForecastEl = document.getElementById("weather-forecast");
const currentTempEl = document.getElementById("current-temp");
const searchButton = document.getElementById("search-button");
const searchBar = document.getElementById("search-bar");

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const API_key = "c7dfb673d37b9d37154521452dd87bc1";

let defaultCity = "New Delhi";
let timeUpdateInterval;

function getWeatherData(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_key}`)
        .then(res => res.json())
        .then(data1 => {
            const { coord: { lat, lon }, name, timezone: tzOffset } = data1;
            updateLocationName(name, data1.sys.country);
            fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&units=metric&appid=${API_key}`)
                .then(res => res.json())
                .then(data2 => {
                    showWeatherData(data1, data2, tzOffset);
                }).catch(error => {
                    console.error("Error fetching weather forecast data:", error);
                });
        }).catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

function updateLocationName(name, country) {
    timezone.innerHTML = name;
    countryEl.innerHTML = country;
}

function showWeatherData(data1, data2, tzOffset) {
    const countryCode = data1.sys.country; 

    updateLocationName(data1.name, countryCode)
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = setInterval(() => updateLocalTime(tzOffset), 1000);

    const localSunrise = window.moment.utc(data1.sys.sunrise * 1000).utcOffset(tzOffset / 60).format("hh:mm A");
    const localSunset = window.moment.utc(data1.sys.sunset * 1000).utcOffset(tzOffset / 60).format("hh:mm A");

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${data1.main.humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${data1.main.pressure} Pa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${data1.wind.speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${localSunrise}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${localSunset}</div>
        </div>`;

    let otherDayForecast = "";
    data2.list.slice(0, 7).forEach((dayData, idx) => {
        if (idx === 0) {
            currentTempEl.innerHTML = `
                <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
                <div class="others">
                    <div class="day">${window.moment(dayData.dt * 1000).format("ddd")}</div>
                    <div class="temp"><span class="nowrap">Day - ${dayData.temp.day} &#176;C</span></div>
                    <div class="temp"><span class="nowrap">Night - ${dayData.temp.night} &#176;C</span></div>
                </div>
            `;
        } else {
        otherDayForecast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(dayData.dt * 1000).format("ddd")}</div>
                <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp"><span class="nowrap">Day - ${dayData.temp.day} &#176;C</span></div>
                <div class="temp"><span class="nowrap">Night - ${dayData.temp.night} &#176;C</span></div>
            </div>
        `;
    }});

    weatherForecastEl.innerHTML = otherDayForecast;
}

function updateLocalTime(tzOffset) {
    const offset = tzOffset / 3600; 
    const time = new Date();
    const utc = time.getTime() + time.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + (3600000 * offset));
    const month = localTime.getMonth();
    const date = localTime.getDate();
    const day = localTime.getDay();
    const hour = localTime.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = localTime.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM";

    timeEl.innerHTML = hoursIn12HrFormat + ":" + (minutes < 10 ? "0" + minutes : minutes) + " " + `<span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = days[day] + ", " + date + " " + months[month];
}

getWeatherData(defaultCity);

searchButton.addEventListener("click", () => {
    const city = searchBar.value;
    if (city) {
        getWeatherData(city);
    }
});

updateLocalTime(5.5 * 3600);
