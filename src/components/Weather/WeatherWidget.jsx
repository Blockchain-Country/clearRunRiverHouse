import { useState, useEffect } from 'react'
import './WeatherWidget.css'

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Tobyhanna, PA coordinates
    const lat = 41.18
    const lon = -75.42
    // Using OpenWeatherMap free API - you'll need to add your API key
    // Get free API key at: https://openweathermap.org/api
    // Add to .env file: VITE_WEATHER_API_KEY=your_api_key_here
    const API_KEY = import.meta.env?.VITE_WEATHER_API_KEY || 'demo'
    const API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // If no API key, use demo data
                if (API_KEY === 'demo') {
                    setWeather(getDemoWeather())
                    setLoading(false)
                    return
                }

                const response = await fetch(API_URL)
                if (!response.ok) throw new Error('Weather data unavailable')
                
                const data = await response.json()
                const dailyForecast = processWeatherData(data)
                setWeather(dailyForecast)
            } catch (err) {
                setError(err.message)
                // Fallback to demo data on error
                setWeather(getDemoWeather())
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()
    }, [])

    const processWeatherData = (data) => {
        // Group forecasts by day and get one forecast per day
        const dailyData = {}
        const today = new Date()
        
        data.list.forEach((item) => {
            const date = new Date(item.dt * 1000)
            const dayKey = date.toDateString()
            
            // Skip today, start from tomorrow
            if (date.toDateString() === today.toDateString()) return
            
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = {
                    date: date,
                    dayName: getDayName(date),
                    temp: Math.round(item.main.temp),
                    icon: item.weather[0].icon,
                    description: item.weather[0].main
                }
            }
        })

        // Return next 7 days
        return Object.values(dailyData).slice(0, 7)
    }

    const getDayName = (date) => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow'
        }
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return days[date.getDay()]
    }

    const getWeatherIcon = (iconCode, description) => {
        // Map OpenWeatherMap icons to emoji/unicode
        const iconMap = {
            '01d': '☀️', // clear sky day
            '01n': '🌙', // clear sky night
            '02d': '⛅', // few clouds day
            '02n': '☁️', // few clouds night
            '03d': '☁️', // scattered clouds
            '03n': '☁️',
            '04d': '☁️', // broken clouds
            '04n': '☁️',
            '09d': '🌧️', // shower rain
            '09n': '🌧️',
            '10d': '🌦️', // rain day
            '10n': '🌧️', // rain night
            '11d': '⛈️', // thunderstorm
            '11n': '⛈️',
            '13d': '❄️', // snow
            '13n': '❄️',
            '50d': '🌫️', // mist
            '50n': '🌫️'
        }
        
        return iconMap[iconCode] || '☀️'
    }

    const getDemoWeather = () => {
        // Demo data for when API key is not available
        const today = new Date()
        const days = []
        const icons = ['☀️', '⛅', '🌦️', '☀️', '⛅', '☀️', '☁️']
        const temps = [72, 68, 65, 70, 73, 75, 69]
        
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            
            let dayName
            if (i === 1) {
                dayName = 'Tomorrow'
            } else {
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                dayName = dayNames[date.getDay()]
            }
            
            days.push({
                dayName: dayName,
                temp: temps[i - 1],
                icon: icons[i - 1],
                description: 'Partly Cloudy'
            })
        }
        
        return days
    }

    if (loading) {
        return (
            <div className="weather-widget">
                <div className="weather-loading">Loading weather...</div>
            </div>
        )
    }

    if (error && !weather) {
        return (
            <div className="weather-widget">
                <div className="weather-error">
                    Unable to load weather. Please check weather apps for Tobyhanna, PA.
                </div>
            </div>
        )
    }

    return (
        <div className="weather-widget">
            <div className="weather-location">Tobyhanna, PA</div>
            <div className="weather-forecast">
                {weather && weather.map((day, index) => (
                    <div key={index} className="weather-day">
                        <div className="weather-day-name">{day.dayName}</div>
                        <div className="weather-icon">{day.icon || getWeatherIcon(day.iconCode, day.description)}</div>
                        <div className="weather-temp">{day.temp}°</div>
                    </div>
                ))}
            </div>
            {API_KEY === 'demo' && (
                <div className="weather-note">
                    Showing sample weather data. To see live forecasts, add your free OpenWeatherMap API key to <code>.env</code> file as <code>VITE_WEATHER_API_KEY</code>
                </div>
            )}
        </div>
    )
}

export default WeatherWidget

