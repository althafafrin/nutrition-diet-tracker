const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
const secret = process.env.JWT_SECRET || 'change_this_dev_secret';

function publicUser(u) {
  return { id:u.id, email:u.email, daily_calorie_goal:u.daily_calorie_goal || 2000,
    notify_email:u.notify_email || '', notifications_enabled:u.notifications_enabled ? 1 : 0 };
}
router.post('/register', (req,res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !email.includes('@') || password.length < 6)
    return res.status(400).json({error:'Enter a valid email and a password of at least 6 characters.'});
  const id = uuidv4(), hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (id,email,password_hash) VALUES (?,?,?)',[id,email,hash],function(err) {
    if (err) return res.status(409).json({error: err.message.includes('UNIQUE') ? 'An account with this email already exists.' : 'Could not create account.'});
    const token = jwt.sign({id,email},secret,{expiresIn:'7d'});
    res.json({token,user:{id,email,daily_calorie_goal:2000,notify_email:'',notifications_enabled:0}});
  });
});
router.post('/login',(req,res) => {
  const email = String(req.body.email || '').trim().toLowerCase(), password = String(req.body.password || '');
  db.get('SELECT * FROM users WHERE email = ?',[email],(err,u) => {
    if(err) return res.status(500).json({error:'Database error.'});
    if(!u || !bcrypt.compareSync(password,u.password_hash)) return res.status(401).json({error:'Invalid email or password.'});
    const token = jwt.sign({id:u.id,email:u.email},secret,{expiresIn:'7d'});
    res.json({token,user:publicUser(u)});
  });
});
router.get('/me',auth,(req,res) => db.get('SELECT * FROM users WHERE id = ?',[req.user.id],(e,u) => {
  if(e) return res.status(500).json({error:e.message});
  if(!u) return res.status(401).json({error:'Account not found. Please register again.'});
  res.json(publicUser(u));
}));
router.put('/goal',auth,(req,res) => {
  const goal = Number(req.body.daily_calorie_goal);
  if(!Number.isFinite(goal) || goal < 1 || goal > 20000) return res.status(400).json({error:'Goal must be between 1 and 20000 kcal.'});
  db.run('UPDATE users SET daily_calorie_goal=? WHERE id=?',[goal,req.user.id],function(e) {
    if(e) return res.status(500).json({error:e.message});
    res.json({success:true,daily_calorie_goal:goal});
  });
});
router.put('/profile',auth,(req,res) => {
  const email = String(req.body.notify_email || '').trim();
  const enabled = req.body.notifications_enabled ? 1 : 0;
  db.run('UPDATE users SET notify_email=?, notifications_enabled=? WHERE id=?',[email || null,enabled,req.user.id],function(e) {
    if(e) return res.status(500).json({error:e.message});
    db.get('SELECT * FROM users WHERE id=?',[req.user.id],(e2,u) => e2 ? res.status(500).json({error:e2.message}) : res.json(publicUser(u)));
  });
});
module.exports = router;
