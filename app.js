const express = require("express");
const axios = require('axios');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
//const apiKey = 6ad14aac7f072b01c11b4639b40c2428;


let monday = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
let mon = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function checkLeapYear(year) {

    //three conditions to find out the leap year
    if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
        return true
    } else {
        return false
    }
}

let month = function (num) {
    for (let i = 0; i < mon.length; i++) {
        if (num == mon[i]) {
            return [mon[i], monday[i]];
        }
    }
}

let day = function (y, m, d) {
    let year = checkLeapYear(y);
    if (year) {
        monday[1] = 29;
    }
    else {
        monday[1] = 28;
    }
    //console.log(monday);

    let a = month(m);
    var mon = a[0];
    let total = a[1];
    let dm = [];
    f = [y, m, d]
    dm.push(f);
    let final = [];
    for (let i = 0; i < 4; i++) {
        if (d == total) {
            mon = mon + 1;

            if (mon == 13) {
                mon = 1
                y += 1
            }

            d = 1
        }
        else {
            d = d + 1;
        }
        m = mon;
        f = [y, m, d]
        dm.push(f);
    }
    return dm
}


let datas = (c, list) => {
    let all = []
    var fore = []
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < list.length; j++) {
            let x = list[j].dt_txt.slice(0, 10)
            let ye = parseInt(x.slice(0, 4))
            let mo = parseInt(x.slice(5, 7))
            let da = parseInt(x.slice(8, 10))
            //console.log(ye,mo,da,c[i])
            if (ye == c[i][0] && mo == c[i][1] && da == c[i][2]) {
                all.push(list[j])
            }
        }
        fore.push(all)
        all = []
    }
    return fore
}



async function getUser(apiKey, search) {
    try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${apiKey}`);
        const response1 = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${apiKey}`)
        const lat = response1.data.city.coord.lat
        const lon = response1.data.city.coord.lon
        const response2 = await axios.get(`http://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}`)
        return [response, response1, response2];
    } catch (error) {
        return "error";
    }
}

let timeConversion = async (unixTimestamp) => {
    dateObj = new Date(unixTimestamp * 1000);
    utcString = dateObj.toUTCString();
    time = await utcString//gmt
    return time;
}


app.get('/', (req, res) => {
    res.render('search');
})

app.get('/weather/search', async (req, res) => {
    const apiKey = "23ae1d6ceea4c34543fd7c9557629a8b";
    const search = req.query.place;
    let results = await getUser(apiKey, search);
    if (results === "error") {
        res.render('error');
    }
    let result = results[0];
    let result_mul = results[1];
    const data = result.data;
    const data_mul = result_mul.data;
    const country = data.sys.country;
    const city = data.name;
    let windspeed = Math.floor(data.wind.speed * 3.6);//kph
    let temp = Math.floor(data.main.feels_like - 273.15);
    const min_temp = Math.floor(data.main.temp_min - 273.15);
    const max_temp = Math.floor(data.main.temp_max - 273.15); //k to c
    const humidity = data.main.humidity;
    const discription = data.weather[0].description;
    const icon = data.weather[0].icon;
    const icon_Url = `http://openweathermap.org/img/wn/${icon}@2x.png`
    //for 4 days fore cast
    const list = data_mul.list;
    const date = list[0].dt_txt;
    const year = parseInt(date.slice(0, 4))
    const month = parseInt(date.slice(5, 7))
    const date_ = parseInt(date.slice(8, 10))
    const c = await day(year, month, date_);
    const y = await datas(c, list)
    const forecast = []
    for (let i = 1; i < 5; i++) {
        forecast.push(y[i][3])
    }
    const temp_1 = Math.floor(forecast[0].main.feels_like - 273.15);
    const date_1 = await timeConversion(forecast[0].dt);
    const day_1 = date_1.slice(0, 3)
    const icon_d1 = forecast[0].weather[0].icon;
    const icon_1 = `http://openweathermap.org/img/wn/${icon_d1}@2x.png`
    const discription_1 = forecast[0].weather[0].description;

    const day1 = [temp_1, day_1, icon_1, discription_1]

    const temp_2 = Math.floor(forecast[1].main.feels_like - 273.15);
    const date_2 = await timeConversion(forecast[1].dt);
    const day_2 = date_2.slice(0, 3)
    const icon_d2 = forecast[1].weather[0].icon;
    const icon_2 = `http://openweathermap.org/img/wn/${icon_d2}@2x.png`
    const discription_2 = forecast[1].weather[0].description;

    const day2 = [temp_2, day_2, icon_2, discription_2]

    const temp_3 = Math.floor(forecast[2].main.feels_like - 273.15);
    const date_3 = await timeConversion(forecast[2].dt);
    const day_3 = date_3.slice(0, 3)
    const icon_d3 = forecast[2].weather[0].icon;
    const icon_3 = `http://openweathermap.org/img/wn/${icon_d3}@2x.png`
    const discription_3 = forecast[2].weather[0].description;

    const day3 = [temp_3, day_3, icon_3, discription_3]

    const temp_4 = Math.floor(forecast[3].main.feels_like - 273.15);
    const date_4 = await timeConversion(forecast[3].dt);
    const day_4 = date_4.slice(0, 3)
    const icon_d4 = forecast[3].weather[0].icon;
    const icon_4 = `http://openweathermap.org/img/wn/${icon_d4}@2x.png`
    const discription_4 = forecast[3].weather[0].description;

    const day4 = [temp_4, day_4, icon_4, discription_4]

    const result2 = results[2]
    const data_2 = result2.data
    const nearbyPlaces = data_2.list
    let near = []
    for (let i = 1; i < nearbyPlaces.length; i++) {
        let name = nearbyPlaces[i].name
        let temp = Math.floor(nearbyPlaces[i].main.feels_like - 273.15);
        let icon = nearbyPlaces[i].weather[0].icon;
        let discription = nearbyPlaces[i].weather[0].description;
        let iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`
        let all = [name, temp, discription, iconUrl]
        near.push(all);
    }

    const sunSet = await timeConversion(data.sys.sunset);
    const sunRise = await timeConversion(data.sys.sunrise);
    const currentdate = await timeConversion(data.dt);
    const sunSettime = sunSet.slice(-12);
    const sunRisetime = sunRise.slice(-12);
    const currentDate = currentdate.slice(0, 16)
    const weatherData = {
        country: country,
        city: city,
        sunSettime: sunSettime,
        sunRisetime: sunRisetime,
        date: currentDate,
        windSpeed: windspeed,
        temp: temp,
        mintemp: min_temp,
        maxtemp: max_temp,
        humidity: humidity,
        discription: discription,
        icon: icon_Url,
        day1: day1,
        day2: day2,
        day3: day3,
        day4: day4,
        nearbyPlaces: near
    }
    res.render('home', { weatherData: weatherData });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Connected to server ...")
})