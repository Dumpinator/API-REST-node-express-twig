
const {success, error} = require('./assets/myFunction')
const express = require('express')
const morgan = require('morgan')
const config = require('./assets/config')
const bodyParser = require('body-parser')
const mysql = require('mysql')


const db = mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    socketPath: config.db.socketPath
})

db.connect( (err) => {
    if (err) console.error(err.message)
    else {
        console.log('Connected to mysql database : nodejs ')

        const app = express()
        let Members =require('./assets/classes/members-class')(db, config)
        console.log(Members)
        

        app.use(morgan('dev'))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        let MembersRouter = express.Router()

        //console.log(members)
        MembersRouter.route('/:id')
            
            // Récupère un membre avec son ID
            .get((req,res) => {

                db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, results) => {
                    if (err) res.json( error(err.message) )
                    else {

                        if (results[0] != undefined){
                            res.json( success(results[0]) )
                        } else {
                            res.json( error(`Wrong ID`) )
                        }
                    }
                })
            })

            // Modifie un membre avec son ID
            .put((req, res) => {
                
                if (req.body.name){

                    db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, results) => {
                        if (err) res.json( error(err.message) )
                        else {
                            if (results[0] != undefined){

                                db.query('SELECT * FROM members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, results) => {
                                    if (err) res.json( error(err.message) )
                                    else {

                                        if (results[0] != undefined) {
                                            res.json( error(`Name already taken`) )
                                        } else {

                                            db.query('UPDATE members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, results) => {
                                                if (err) res.json( error(err.message) )
                                                else {
                                                    res.json( success(true) )
                                                }
                                            })
                                        }
                                    }
                                })
                                
                            } else {
                                res.json( error(`Wrong ID`) )
                            }
                        }
                    })

                } else {
                    res.json( error(`No name value`) )
                }
            })

            // Supprime un membre avec son ID
            .delete((req, res) => {

                db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, results) => {
                    if (err) res.json( error(err.message) )
                    else {

                        if (results[0] != undefined){
                            
                            db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err, results) => {
                                if (err) res.json( error(err.message) )
                                else {
                                    res.json( success(true) )
                                }
                            })

                        } else {
                            res.json( error(`Wrong ID`) )
                        }
                    }
                })
            })

        MembersRouter.route('/')

            // récupère tous les membres
            .get((req,res) => {
                
                if (req.query.max != undefined && req.query.max > 0){
                    
                    db.query('SELECT * FROM members LIMIT 0, ?', [req.query.max], (err, results) => {
                        if (err) res.json( error(err.message) )
                        else {
                            res.json( success(results) )
                        }
                    })

                } else if (req.query.max != undefined) {
                    res.json( error(`Wrong max value`) )
                } else {
                    db.query('SELECT * FROM members', (err, results) => {
                        if (err) res.json( error(err.message) )
                        else {
                            res.json( success(results) )
                        }
                    })
                }
            })

            // Ajoute un membre
            .post((req, res) => {

                if (req.body.name) {

                    db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, results) => {
                        if (err){
                            res.json( error(err.message) )
                        } else {

                            if (results[0] != undefined) {
                                res.json( error(`Name already taken`) )
                            } else {
                                db.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, results) => {
                                    if (err) { 
                                        res.json( error(err.message) )
                                     } else {
                                        db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, results) => {
                                            if (err) {
                                                res.json( error(err.message) )
                                            } else {
                                                res.json( success({
                                                    id: results[0].id,
                                                    name: results[0].name
                                                }))
                                            }  
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    res.json( error(`No name value`) )
                }
            })

        app.use(`${config.rootAPI}members`, MembersRouter)

        app.listen(config.port, () => {
            console.log(`Server started on port ${config.port}`)
        })
    }
})
