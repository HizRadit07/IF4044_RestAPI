const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const { Pool } = require('pg');

const pool = new Pool({ //later, secure this by adding env variable or something
  user: 'postgres',
  host: 'localhost',
  database: 'if4040',
  password: 'postgres',
  port: 5432
});

function isValidDate(dateStr) {
  const date = new Date(dateStr.replace(/-/g, "/"));
  const minDate = new Date("2000-01-01T00:00:00.000Z");
  const maxDate = new Date("2100-01-01T00:00:00.000Z");
  
  // Check if the date string is in the YYYY-MM-DD HH:mm format
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/)) {
    return false;
  }
  
  // Check if the date is within a valid range
  if (date < minDate || date > maxDate) {
    return false;
  }
  
  // If we've made it this far, the date is valid
  return true;
}

function convertToISO(dateString) {
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  const isoString = new Date(year, month - 1, day, hour, minute).toISOString();
  return isoString;
}

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/precomputed_view', (request, response) => {
  let { start_date, end_date, social_media } = request.query;

  if (!start_date || !end_date || !social_media) {
    return response.status(400).json({ message: 'Missing mandatory query parameters.' });
  }

  social_media = social_media.toLowerCase()
  const arr = ["facebook", "instagram", "youtube", "twitter"]
  if (!arr.includes(social_media)) {
    return response.status(400).json({ message: 'Social media invalid' });
  }

  if (!isValidDate(start_date) || !isValidDate(end_date)) {
    return response.status(400).json({ message: 'Date invalid' });
  }


  let start_date_formatted = convertToISO(start_date)
  let end_date_formatted = convertToISO(end_date)
  
  pool.query(`SELECT social_media.social_media, timestamp, count, unique_count FROM social_media WHERE timestamp >= '${start_date_formatted}' AND timestamp <= '${end_date_formatted}' AND social_media.social_media = '${social_media}'`, (err, results) =>{
    if (err){
      return response.status(400).json({ message: 'Something went wrong when querying database' });
    }
    return response.status(200).json(results.rows);
  })
})


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })