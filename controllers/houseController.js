const router = require('express').Router();
const {isUser} = require('../middlewares/guards');


router.get('/create', (req, res) => {
    res.render('create', {title: 'Create Page'})
})

router.post('/create', isUser(), async (req, res) => {
    const houseData = {
        name: req.body.name,
        type: req.body.type,
        year: req.body.year,
        city: req.body.city,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        piecesAvailable: req.body.piecesAvailable,
        rentedBy: [],
        owner: req.user._id
    }
    try {
        await req.storage.createHouse(houseData)
        res.redirect('/')

    } catch (err){
        console.log(err.message)

        let errors;
        if (err.errors){
            errors = Object.values(err.errors).map(e => e.properties.message)
        } else {
            errors = [err.message]
        }
        const ctx = {
            title: 'Create page',
            errors,
            houseData: {
                name: req.body.name,
                type: req.body.type,
                year: req.body.year,
                city: req.body.city,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                piecesAvailable: req.body.piecesAvailable
            }
        }

        res.render('create', ctx)
    }
})

router.get('/edit/:id', isUser(), async (req, res) => {
    try {
        const house = await req.storage.getHouseById(req.params.id);

        if (house.owner != req.user._id){
            throw new Error('Cannot edit unless you have added the house')
        }

        const ctx = {
            title: 'Edit Page',
            house
        }

        res.render('edit', ctx)
    } catch (err) {
        console.log(err.message)
        res.redirect('/house/details/' + req.params.id)
    }
})

router.post('/edit/:id', isUser(), async (req, res) => {
    try {
        const house = await req.storage.getHouseById(req.params.id);

        if (house.owner != req.user._id){
            throw new Error('Cannot edit unless you have added the house')
        }

        await req.storage.editHouse(req.params.id, req.body)
        res.redirect('/house/details/' + req.params.id)

    } catch (err) {
        console.log(err.message)

        let errors;
        if (err.errors){
            errors = Object.values(err.errors).map(e => e.properties.message)
        } else {
            errors = [err.message]
        }
        const ctx = {
            title: 'Edit page',
            errors,
            houseData: {
                name: req.body.name,
                type: req.body.type,
                year: req.body.year,
                city: req.body.city,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                piecesAvailable: req.body.piecesAvailable
            }
        }
    }
})

router.get('/details/:id', async (req, res) => {
    try {
        const house = await req.storage.getHouseById(req.params.id);

        house.hasUser = Boolean(req.user);
        house.isOwner = req.user && req.user._id == house.owner;
        house.tenant = req.user && house.rentedBy.find((t) => t._id == req.user._id) && !house.isOwner;
        house.availability = Boolean(house.piecesAvailable > 0) && !house.tenant && !house.isOwner;
        house.unavailability = !house.availability && !house.tenant && !house.isOwner;
        house.renters = Boolean(house.rentedBy.length > 0);
        house.people = house.rentedBy.map(u => u.name).join(', ');

        const ctx = {
            title: 'Details Page',
            house
        }
        res.render('details', ctx)
    } catch (err) {
        console.log(err.message);
        res.redirect('/404')
    }
})

router.get('/delete/:id', isUser(), async (req, res) => {
    try {
        const house = await req.storage.getHouseById(req.params.id);

        if (house.owner != req.user._id){
            throw new Error('Cannot delete unless you have added the house')
        }

        await req.storage.deleteHouse(req.params.id)
        res.redirect('/')

    } catch (err) {
        console.log(err.message)
        res.redirect('/house/details/' + req.params.id)
    }
})

router.get('/for-rent', async (req, res) => {
    const apartments = await req.storage.getAllHouses()
    const ctx = {
        title: 'For Rent Page',
        apartments
    }
    res.render('for-rent', ctx)
})

router.get('/rent/:id', isUser(), async (req, res) => {

    try {
        const house = await req.storage.getHouseById(req.params.id);

        if (house.owner == req.user._id){
            throw new Error('Cannot rent your own property')
        }

        await req.storage.rentHouse(req.params.id, req.user._id)
        res.redirect('/house/details/' + req.params.id)

    } catch(err){
        console.log(err.message)
        res.redirect('/house/details/' + req.params.id)
    }
})


module.exports = router;