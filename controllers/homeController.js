const router = require('express').Router();

router.get('/', async (req, res) => {
    const houses = await req.storage.getTopHouses()
    const ctx = {
        title: 'Home Page',
        houses
    }
    res.render('home', ctx)
})


router.get('/search', (req, res) => {
    res.render('search', {title: 'Search Page'})
})

router.post('/search', async (req, res) => {
    
    if (req.body.search == ''){
        res.render('search', {title: 'Search Page'})
    }

    const matches = await req.storage.searchHouse(req.body.search);
    res.render('search', {title: 'Search Page', matches})
})

module.exports = router;