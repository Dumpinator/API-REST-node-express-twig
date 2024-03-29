let db, config

module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Members
}

let Members = class {

    static getByID(id) {

        return new Promise((next) => {
            
            db.query('SELECT * FROM members WHERE id = ?', [id])
            .then((results) => {
                if (results[0] != undefined)
                    next(results[0])
                else
                    next( new Error(config.errors.wrongID) )
            })
            .catch( (err) => next(err) )
        })
    }

    static getAll(max) {

        return new Promise((next) => {

            if (max != undefined && max > 0) {

                db.query('SELECT * FROM members LIMIT 0, ?', [parseInt(max)])
                    .then((results) => next(results))
                    .catch((err) => next(err))

            } else if (max != undefined) {

                next( new Error(config.errors.wrongMaxValue))

            } else {

                db.query('SELECT * FROM members')
                    .then((results) => next(results))
                    .catch((err) => next(err))
            }
        })
    }

    static add(name) {

        return new Promise((next) => {

            if (name != undefined && name.trim() != '') {

                name = name.trim()

                db.query('SELECT * FROM members WHERE name = ?', [name])
                    .then((results) => {

                        if (results[0] != undefined) 
                            next( new Error(config.errors.nameAlreadyTaken))

                        else {
                            return db.query('INSERT INTO members(name) VALUES(?)', [name])
                        }
                    })
                    .then(() => {
                        return db.query('SELECT * FROM members WHERE name = ?', [name])
                    })
                    .then((results) => {
                        next({
                            id: results[0].id,
                            name: results[0].name
                        })
                    })
                    .catch((err) => next(err))
            } else
                next( new Error(config.errors.noNameValue))
        })
    }

    static update(id, name) {

        return new Promise ((next) => {

            if (name != undefined && name.trim() != '') {

                name = name.trim()

                db.query('SELECT * FROM members WHERE id = ?', [id])
                    .then((results) => {
                        //console.log(results)
                        if (results[0] != undefined) {
                            return db.query('SELECT * FROM members WHERE name = ? AND id != ?', [name, id])                        
                        } else {
                            next( new Error(config.errors.wrongID))
                        }
                    })
                    .then((results) => {
                        if(results[0] != undefined) {
                            next( new Error(config.errors.nameAlreadyTaken))
                        } else {
                            return db.query('UPDATE members SET name = ? WHERE id = ?', [name, id])
                        }
                    })
                    .then(() => {
                        next((true) + `: ${name} is upload`)
                        //next(true)
                    })
                    .catch((err) => next(err))
            } 
            else {
                next( new Error(config.errors.noNameValue))   
            }
        })
    }

    static delete(id) {

        return new Promise ((next) => {

            db.query('SELECT * FROM members WHERE id = ?', [id])
                .then((results) => {
                    if (results[0] != undefined){
                        return db.query('DELETE FROM members WHERE id = ?', [id])
                    } else {
                        next( new Error(config.errors.wrongID))
                    }
                })
                .then(() => {
                    next(true)
                })
                .catch((err) => next(err))
        })
    }




























}