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
  pool.query('SELECT * FROM social_medua', (err, results) =>{
    if (err){
      throw err;
    }
    response.status(200).json(results.rows);
  })
})


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })