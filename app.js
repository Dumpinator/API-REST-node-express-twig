
const {success, error, checkResponse} = require('./assets/myFunction')
const express = require('express')
const morgan = require('morgan')
const config = require('./assets/config')
const bodyParser = require('body-parser')
const mysql = require('promise-mysql')


mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    socketPath: config.db.socketPath
}).then((db) => {
    
    console.log('Connected to mysql database : nodejs ')

        const app = express()
        let Members = require('./assets/classes/members-class')(db, config)
        
        app.use(morgan('dev'))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        let MembersRouter = express.Router()

        //console.log(members)
        MembersRouter.route('/:id')
            
            // Récupère un membre avec son ID
            .get( async(req, res) => {
                let member = await Members.getByID(req.params.id)
                res.json(checkResponse(member))
            })

            // Modifie un membre avec son ID
            .put( async(req, res) => {
                let updateMember = await Members.update(req.params.id, req.body.name)
                res.json(checkResponse(updateMember))
            })

            // Supprime un membre avec son ID
            .delete( async(req, res) => {
                let deleteMember = await Members.delete(req.params.id)
                res.json(checkResponse(deleteMember))
            })

        MembersRouter.route('/')

            // récupère tous les membres
            .get( async(req,res) => {
                let allMembers = await Members.getAll(req.query.max)
                res.json(checkResponse(allMembers))
            })

            // Ajoute un membre
            .post( async(req, res) => {
                let addMember = await Members.add(req.body.name)
                res.json(checkResponse(addMember))
            })

        app.use(`${config.rootAPI}members`, MembersRouter)

        app.listen(config.port, () => {
            console.log(`Server started on port ${config.port}`)
        })
    
}).catch((err) =>{
    console.log('Error during database connection')
    console.error(err.message)
})

