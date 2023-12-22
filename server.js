const express = require("express");
const session = require('express-session');
const bcrypt = require('bcrypt');
const { addPost, getPosts, toggleLikePost, editPost, deletePost, registerUser, findUserByUsername, getPostById, getPostsSortedByLikes } = require('./data');
const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", "./resources/views"); 
//static files
app.use('/css', express.static('resources/css'));  
app.use('/js', express.static('resources/js'));
app.use('/images', express.static('resources/images'));
app.use('/resources', express.static('resources'));
//parse urls
app.use(express.urlencoded({ extended: true })); 

app.use(session({
    secret: 'haniya_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

//registration page
app.get('/register', (req, res) => {
    res.render('register');
});
//handle registration  
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await registerUser(username, hashedPassword);
    res.redirect('/login');
});
//login page
app.get('/login', (req, res) => {
    res.render('login');
});
//handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/');
    } else {
        res.status(401).render('login', { error: 'wrong credentials' });
    }
});
//logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
//middleware so cant view posts without being logged in
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}
//main page
app.get("/", ensureAuthenticated, async (req, res) => {
    const sortOption = req.query.sort || 'date'; 
    let posts = sortOption === 'likes' ? await getPostsSortedByLikes() : await getPosts();
    res.render("mainpage", { 
        posts: posts,
        currentUser: req.session.userId,
        username: req.session.username,
        sortOption: req.query.sort || 'date'
    });
});
//new post creation
app.post("/create-post", ensureAuthenticated, async (req, res) => {
    const content = req.body.postContent;
    await addPost(content, req.session.userId);
    res.redirect("/");
});
//post editing
app.post("/edit-post/:id", ensureAuthenticated, async (req, res) => {
    const postId = req.params.id;
    const newContent = req.body.newContent;
    const post = await getPostById(postId);
    if (post.user_id !== req.session.userId) {
        res.status(403).send("You can only edit your own posts");
        return;
    }
    await editPost(postId, newContent);
    res.redirect('/');
});
//post deletion
app.post("/delete-post/:id", ensureAuthenticated, async (req, res) => {
    const postId = req.params.id;
    const post = await getPostById(postId);
    if (post.user_id !== req.session.userId) {
        res.status(403).send("You can only delete your own posts ");
        return;
    }
    await deletePost(postId);
    res.redirect('/');
});
//post liking/unliking
app.post("/like-post/:id", ensureAuthenticated, async (req, res) => {
    const userId = req.session.userId; 
    const postId = req.params.id;
    const updatedPost = await toggleLikePost(userId, postId);
    res.json({ likeCount: updatedPost.like_count });
});

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
