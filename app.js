const express = require(`express`)
const app = express()
const path = require(`path`)
const fs = require(`fs`)

app.set(`view engine`, `ejs`)
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, `css`)))

const db = JSON.parse(fs.readFileSync(`./db.json`))

app.get(`/`, (req, res) => {
    res.render(__dirname + `/html/index.ejs`)
})

app.get(`/signup`, (req, res) => {
    res.render( __dirname + `/html/signup.ejs`)
})

app.post(`/newuser`, (req, res) => {
    let name = req.body.name
    let password = req.body.password
    let email = req.body.email
    let pages = []
    let id = Math.floor(Math.random() * 1000000)

    db.users.push({ name: name, password: password, email: email, pages: pages, id: id })
    fs.writeFileSync(`./db.json`, JSON.stringify(db, null, 4))
})

app.post(`/post`, (req, res) => {
    res.redirect(`/dashboard`)
})

app.get(`/dashboard`, (req, res) => {
    res.render(__dirname + `/html/dashboard.ejs`)
})

app.get(`/postalbum`, (req, res) => {
    res.render(__dirname + `/html/postalbum.ejs`)
})

app.get(`/postsingle`, (req, res) => {
    res.render(__dirname + `/html/postsingle.ejs`)
})

app.post(`/singleposted`, (req, res) => {
    let artist = req.body.artist
    let title = req.body.title
    let release = req.body.releasedate
    let time = req.body.releasetime
    let color = req.body.color
    let image = req.body.image

    if(db.users.find(x => x.name === artist && x.password === req.body.password)) {
        let pagetitle = title.split(` `).join(`_`)
        db.users.find(user => user.name === artist).pages.push({ title: title, release: `${release} ${time}`, type: `single`, color: color, image: image, url:  `/${artist}/${pagetitle}` });
        fs.writeFileSync(`./db.json`, JSON.stringify(db, null, 4))
        res.render(__dirname + `/html/posted.ejs`, { type: `Single`, url: `https://h.armony.xyz/${artist}/${pagetitle}` })
    } else {
        res.send(`Incorrect Artist Name or Password`)
    }
})

app.post(`/albumposted`, (req, res) => {
    let artist = req.body.artist
    let title = req.body.title
    let release = req.body.releasedate
    let time = req.body.releasetime
    let color = req.body.color
    let image = req.body.image

    let max = 1;
    for(let i = 1; i < 100; i++) {
        if(req.body[`track ${i}`]) {
            max = i
        }
    }

    let tracks = []
    for(let i = 1; i <= max; i++) {
        tracks.push(req.body[`track ${i}`])
    }

    if(db.users.find(x => x.name === artist && x.password === req.body.password)) {
        let pagetitle = title.split(` `).join(`_`)
        db.users.find(user => user.name === artist).pages.push({ title: title, release: `${release} ${time}`, type: `album`, color: color, image: image, tracks: tracks,  url: `/${artist}/${pagetitle}` });
        fs.writeFileSync(`./db.json`, JSON.stringify(db, null, 4))
        res.render(__dirname + `/html/posted.ejs`, { type: `Album`, url: `https://h.armony.xyz/${artist}/${pagetitle}` })
    } else {
        res.send(`Incorrect Artist Name or Password`)
    }

})

db.users.forEach(user => {
    user.pages.forEach(page => {
        let pagetitle = page.title.split(` `).join(`_`)
        app.get(`/${user.name}/${pagetitle}`, (req, res) => {
            if(page.type === `single`) {
                res.render(__dirname + `/html/single.ejs`, { title: page.title, artist: user.name, release: page.release, color: page.color, image: page.image  })
            } else if(page.type === `album`) {
                let string = ''
                res.render(__dirname + `/html/album.ejs`, { title: page.title, artist: user.name, release: page.release, tracklist: page.tracks, color: page.color, image: page.image })
            }
        })
    })
})

app.listen(3000)