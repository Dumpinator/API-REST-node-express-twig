// APP FRONT

// Modules
const express = require('express')
const bodyParser = require('body-parser')
const twig = require('twig')
const morgan = require('morgan')('dev')
const axios = require('axios')

// Variables globales
const app = express()
const port = 3001
const fetch = axios.create({
    baseURL: 'http://localhost:3000/api/v1'
  });

// Middlewares
app.use(morgan)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//console.log(__dirname);


// Routes
app.get('/', (req, res) => {
    res.render('index.twig', {
    })
})

// Page pour tous les membres
app.get('/members', (req, res) => {
    apiCall( req.query.max ? '/members?max='+req.query.max : '/members', res, (result) => {
        res.render('members.twig', {
            members: result
        })
    })
})

// page pour un membre + id
app.get('/members/:id', (req, res) => {
    apiCall('/members/'+req.params.id, res, (result) => {
        res.render('member.twig', {
            member: result
        })
    })
})

// modification pour un membre + id
app.get('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, res, (result) => {
        res.render('editMember.twig', {
            member: result
        })
    })
})



// App started
app.listen(port, () => console.log('Started on port '+ port))

// Function
function renderError (res, errMsg) {
    return res.render('error.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, res, next) {
    fetch.get(url)
        .then((response) => {
            
            if (response.data.status == 'success') {
                next(response.data.result)
            } else {
                renderError(res, response.data.message)
            }
        })
        .catch((err) => renderError(res, err.message))
}
