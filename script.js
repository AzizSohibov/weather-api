import countryCodesFile from './country_codes.json' assert {type: 'json'};
	
const formatAMPM = (date) => {
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0'+minutes : minutes;
	let strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}
const formatToOnlyHourAMPM = (date) => {
	let hours = date.getHours();
	let ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12;
	let strTime = hours + ' ' + ampm;
	return strTime;
}
const timeDistance = (date1, date2) => {
	let distance = Math.abs(date1 - date2);
	const hours = Math.floor(distance / 3600000);
	distance -= hours * 3600000;
	const minutes = Math.floor(distance / 60000);
	distance -= minutes * 60000;
	return `${hours}:${('0' + minutes).slice(-2)}`;
};
const windDirections = {
	0: 'N',
	22.5: 'NNE',
	45: 'NE',
	67.5: 'ENE',
	90: 'E',
	112.5: 'ESE',
	135: 'SE',
	157.5: 'SSE',
	180: 'S',
	202.5: 'SSW',
	225: 'SW',
	247.5: 'WSW',
	270: 'W',
	292.5: 'WNW',
	315: 'NW',
	337.5: 'NNW',
	360: 'N'
};

let myError404 = () => {
	let error404 = document.querySelector('#error404');
	let all_inside_blocks = document.querySelector('.all_inside_blocks');
}

const API_ID = '8e5db3a83daf26a060ed7eca6a036c97';
const siteUrl = new URL('https://api.openweathermap.org');





let gpsInput = document.querySelector('#city_county_input');

let content = document.querySelector('.content');
let current_weather = content.querySelector('.current_weather');
let current_date = content.querySelector('.current_date');

let weatherDesc = document.querySelector('#weather_desc');
let currentTemp = document.querySelector('#current_temp');
let otherDetails = document.querySelector('#other_details');

let hoursDataInfo = document.querySelector('#hours_data_info');

const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${day<10?'0'+day:day}.${month<10?'0'+month:month}.${year}`;

current_date.textContent = currentDate;

let options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
let g_pos;
function success(pos) {
	g_pos = pos;
	let crd = pos.coords;
	console.log('Ваше текущее местоположение: ');
	console.log(`Широта: ${crd.latitude}`);
	console.log(`Долгота: ${crd.longitude}`);
	console.log(`Плюс-минус ${crd.accuracy} метров.`);
	return pos;
};
function error(err) {
	myError404();
  	console.warn(`ERROR(${err.code}): ${err.message}`);
};
navigator.geolocation.getCurrentPosition(success, error)

if ("geolocation" in navigator) {
	navigator.geolocation.getCurrentPosition((position) => {

		// https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit={limit}&appid={API key}

		siteUrl.pathname = '/geo/1.0/reverse';
		siteUrl.searchParams.set('lat', position.coords.latitude);
		siteUrl.searchParams.set('lon', position.coords.longitude);
		siteUrl.searchParams.set('appid', API_ID);

		fetch(siteUrl)
		.then(response => response.json())
		.then(cityData => {
			gpsInput.placeholder = cityData[0].name;

			for (let country of countryCodesFile){
				if (country.code === cityData[0].country) {
					gpsInput.placeholder += `, ${country.name}`;
				}
			}
		})

		siteUrl.pathname = '/data/2.5/weather';
		siteUrl.searchParams.set('units', 'metric');
		// siteUrl.searchParams.set('lang', 'ru');

		fetch(siteUrl)
		.then(response => response.json())
		.then(todayWeather => {
			console.log(todayWeather);

			let imgIcon = document.createElement('img');
			
			imgIcon.alt = todayWeather.weather[0].description;
			imgIcon.src = `https://openweathermap.org/img/wn/${todayWeather.weather[0].icon}@2x.png`;

			weatherDesc.append(imgIcon);
			let span = document.createElement('span');
			weatherDesc.appendChild(span);
			span.append(todayWeather.weather[0].description);
			
			currentTemp.innerHTML = `
				<div>${Math.round(todayWeather.main.temp)}&#176;С</div>
				Real Feel ${Math.round(todayWeather.main.feels_like)}&#176;
			`;

			let today_sunrise = new Date(todayWeather.sys.sunrise * 1000);
			let today_sunset = new Date(todayWeather.sys.sunset * 1000);

			otherDetails.innerHTML = `
				<div>Sunrise: ${formatAMPM(today_sunrise)}</div>
				<div>Sunset: ${formatAMPM(today_sunset)}</div>
				<div>Duration: ${timeDistance(today_sunrise, today_sunset)}hr </div>
			`;
		});

		siteUrl.pathname = '/data/2.5/forecast';
		fetch(siteUrl)
		.then(response => response.json())
		.then(five_days_weather => {

			for (let i = 0; i < 8; i++) {

				let forecastDate = new Date(five_days_weather.list[i].dt * 1000);

				if (forecastDate.getDay() === (new Date()).getDay()) {

					let item = document.createElement('div');
					item.classList.add('item');
					hoursDataInfo.appendChild(item);
	
					let time_hour = document.createElement('div');
					time_hour.classList.add('hour');
					time_hour.textContent = formatToOnlyHourAMPM(forecastDate);
					item.appendChild(time_hour);
					
					let imgIcon = document.createElement('img');
					imgIcon.classList.add('icon');
					imgIcon.alt = five_days_weather.list[i].weather[0].description;
					imgIcon.src = `https://openweathermap.org/img/wn/${five_days_weather.list[i].weather[0].icon}@2x.png`;
					item.appendChild(imgIcon);
	
					let forecast = document.createElement('div');
					forecast.classList.add('forecast');
					forecast.textContent = five_days_weather.list[i].weather[0].description;
					item.appendChild(forecast);
	
					let temp = document.createElement('div');
					temp.classList.add('temperature');
					temp.textContent = Math.round(five_days_weather.list[i].main.temp) + '°';
					item.appendChild(temp);
	
					let realFeel = document.createElement('div');
					realFeel.classList.add('real_feel');
					realFeel.textContent = Math.round(five_days_weather.list[i].main.feels_like) + '°';
					item.appendChild(realFeel);
	
					let wind = document.createElement('div');
					wind.classList.add('wind');
					
					// Находим ближайшее меньшее значение ключа в объекте windDirections
					const closestDegrees = Object.keys(windDirections).reduce((a, b) => {
						return Math.abs(b - five_days_weather.list[i].wind.deg) < Math.abs(a - five_days_weather.list[i].wind.deg) ? b : a;
					});
					  
					// Получаем строковое обозначение направления ветра из объекта windDirections
					const windDirection = windDirections[closestDegrees];

					wind.textContent = Math.round(five_days_weather.list[i].wind.speed * 1.60934);
					wind.textContent += ` ${windDirection}`;
					item.appendChild(wind);
				}
			}
		});

	});

} else {
	myError404();
	console.log('местоположение НЕ доступно');
  /* местоположение НЕ доступно */
  // fetch(`https://api.openweathermap.org/data/2.5/forecast?q={$cityName},{$countryCode}&appid={$api_Id}`)
  
}


// fetch('https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid=8e5db3a83daf26a060ed7eca6a036c97')
//   .then(response => response.json())
//   .then(data => {
//     console.log(data);
//     console.log(data.message);
// });

// fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=${api_Id}`)
//   .then(response => response.json())
//   .then(data => {
//     console.log(data);
//     console.log(data.message);
// });