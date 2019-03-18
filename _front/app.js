// APP FRONT

// Modules
const express = require('express')
const bodyParser = require('body-parser')
const twig = require('twig')
const morgan = require('morgan')('dev')
const axios = require('axios')

// Variables globales
const app = express()
const port = process.env.PORT || 3001
const fetch = axios.create({
    baseURL: 'http://localhost:3000/api/v1'
  });

// Middlewares
app.use(morgan)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// Routes
app.get('/', (req, res) => {
    res.redirect('/members')
})

// Page accueil
app.get('/members', (req, res) => {
    apiCall( req.query.max ? '/members?max='+req.query.max : '/members', 'get', {}, res, (result) => {
        res.render('members.twig', {
            members: result
        })
    })
})

// page pour un membre + id
app.get('/members/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (result) => {
        res.render('member.twig', {
            member: result
        })
    })
})


// UPDATE & DELETE ///////////////////////
// page
app.get('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (result) => {
        res.render('editMember.twig', {
            member: result
        })
    })
})
// méthode post pour edit
app.post('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'put', { name: req.body.name }, res, () => {
        res.redirect('/members')
    })
})
// méthode post pour delete
app.post('/delete', (req, res) => {
    apiCall('/members/'+req.body.id, 'delete', {}, res, () => {
        res.redirect('/members')
    })
})

// INSERT  ///////////////////////
// page
app.get('/insert', (req, res) => {
    res.render('insertMember.twig')
})

app.post('/insert', (req, res) => {
    apiCall('/members', 'post', { name: req.body.name }, res, () => {
        res.redirect('/members')
    })
})

// App started
app.listen(port, () => console.log('App running on port '+ port))

// Function
function renderError (res, errMsg) {
    return res.render('error.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, method, data, res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    }).then((response) => {
            
        if (response.data.status == 'success') {
            next(response.data.result)
        } else {
            renderError(res, response.data.message)
        }
    })
    .catch((err) => renderError(res, err.message))
}
