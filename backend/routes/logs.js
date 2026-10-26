const express = require('express');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

async function sendGoalEmail(to, goal, total) {
  const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS} = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !to) return false;
  try {
    const transporter = nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT||587),secure:Number(SMTP_PORT)===465,auth:{user:SMTP_USER,pass:SMTP_PASS}});
    await transporter.sendMail({from:SMTP_USER,to,subject:'Daily calorie goal exceeded',text:`Your daily calorie goal is ${goal} kcal. Your logged total is ${total} kcal.`});
    return true;
  } catch(e) { console.error('Email alert failed:',e.message); return false; }
}
function bounds(ts) {
  const d = new Date(ts), start = new Date(d); start.setHours(0,0,0,0);
  const end = new Date(d); end.setHours(23,59,59,999);
  return [start.getTime(),end.getTime()];
}
router.post('/',auth,(req,res) => {
  const name = String(req.body.food_name || '').trim();
  const barcode = req.body.barcode ? String(req.body.barcode) : null;
  const calories = Number(req.body.calories), carbs = Number(req.body.carbs), protein = Number(req.body.protein);
  const fat = Number(req.body.fat || 0);
  const meal_type = String(req.body.meal_type || 'breakfast').toLowerCase();
  const ts = req.body.created_at == null ? Date.now() : Number(req.body.created_at);
  if (!name || ![calories,carbs,protein,fat,ts].every(Number.isFinite) || [calories,carbs,protein,fat].some(n=>n<0))
    return res.status(400).json({error:'Enter a food name and valid non-negative nutrition values.'});
  const [start,end] = bounds(ts), userId = req.user.id;
  db.get('SELECT id FROM users WHERE id=?',[userId],(ue,user) => {
    if(ue) return res.status(500).json({error:ue.message});
    if(!user) return res.status(401).json({error:'Account not found for this session. Log out and sign in again.'});
    db.get('SELECT COUNT(*) AS count FROM logs WHERE user_id=? AND created_at=?',[userId,ts],(de,dup) => {
      if(de) return res.status(500).json({error:de.message});
      if(dup.count) return res.status(409).json({error:'A log already exists at this exact timestamp. Try again.'});
      db.get('SELECT COUNT(*) AS count FROM logs WHERE user_id=? AND lower(food_name)=lower(?) AND created_at BETWEEN ? AND ?',[userId,name,start,end],(ce,count) => {
        if(ce) return res.status(500).json({error:ce.message});
        if(count.count>=5) return res.status(400).json({error:'You can log the same food at most 5 times per day.'});
        const id=uuidv4();
        db.run('INSERT INTO logs (id,user_id,food_name,barcode,calories,carbs,protein,fat,meal_type,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
          [id,userId,name,barcode,calories,carbs,protein,fat,meal_type,ts],function(ie) {
            if(ie) return res.status(409).json({error:ie.message.includes('UNIQUE')?'A log already exists at this exact timestamp.':ie.message});
            db.get('SELECT COALESCE(SUM(calories),0) AS total FROM logs WHERE user_id=? AND created_at BETWEEN ? AND ?',[userId,start,end],async (se,sum) => {
              if(se) return res.json({id,user_id:userId,food_name:name,barcode,calories,carbs,protein,fat,meal_type,created_at:ts});
              db.get('SELECT daily_calorie_goal,notify_email,notifications_enabled FROM users WHERE id=?',[userId],async (ue2,u) => {
                const goal=(u && u.daily_calorie_goal)||2000, total=(sum && sum.total)||0;
                const emailSent = total>goal && u && u.notifications_enabled && u.notify_email ? await sendGoalEmail(u.notify_email,goal,total) : false;
                res.json({id,user_id:userId,food_name:name,barcode,calories,carbs,protein,fat,meal_type,created_at:ts,total_calories:total,daily_calorie_goal:goal,goal_exceeded:total>goal,email_sent:emailSent});
              });
            });
          });
      });
    });
  });
});
router.get('/barcode/:code',auth,async(req,res) => {
  const code=String(req.params.code||'');
  try {
    const response=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
    if(!response.ok) return res.status(502).json({error:'Barcode lookup service is unavailable.'});
    const data=await response.json();
    if(data.status!==1 || !data.product) return res.status(404).json({error:'Product not found for this barcode.'});
    const p=data.product,n=p.nutriments||{};
    res.json({
      food_name:p.product_name||p.generic_name||`Product ${code}`,
      calories:Math.round(n['energy-kcal_100g']||n['energy-kcal_value']||0),
      carbs:Number(n.carbohydrates_100g||0),
      protein:Number(n.proteins_100g||0),
      fat:Number(n.fat_100g||0),
      fiber:Number(n.fiber_100g||0),
      brand:p.brands||'',
      image_url:p.image_front_url||p.image_url||null,
      serving_size:p.serving_size||'100g'
    });
  } catch(e) { res.status(502).json({error:'Barcode lookup failed. Check internet connection.'}); }
});
router.get('/',auth,(req,res) => {
  const now=Date.now(), yearAgo=now-365*24*60*60*1000;
  const from=req.query.from ? Number(req.query.from) : yearAgo, to=req.query.to ? Number(req.query.to) : now;
  if(!Number.isFinite(from)||!Number.isFinite(to)) return res.status(400).json({error:'Invalid date range.'});
  db.all('SELECT * FROM logs WHERE user_id=? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC',[req.user.id,from,to],(e,rows)=>e?res.status(500).json({error:e.message}):res.json(rows));
});
router.delete('/:id',auth,(req,res) => {
  db.run('DELETE FROM logs WHERE id=? AND user_id=?',[req.params.id,req.user.id],function(e) {
    if(e) return res.status(500).json({error:e.message});
    res.json({success:true,deleted:this.changes>0});
  });
});
router.get('/summary',auth,(req,res) => {
  const now=Date.now(), period=req.query.period==='week'?'week':'day';
  let from;
  if(period==='week') {
    const d=new Date(now), day=d.getDay(), diff=d.getDate()-day+(day===0?-6:1);
    d.setDate(diff); d.setHours(0,0,0,0); from=d.getTime();
  } else { const d=new Date(now); d.setHours(0,0,0,0); from=d.getTime(); }
  db.get('SELECT COALESCE(SUM(calories),0) calories, COALESCE(SUM(carbs),0) carbs, COALESCE(SUM(protein),0) protein, COALESCE(SUM(fat),0) fat FROM logs WHERE user_id=? AND created_at BETWEEN ? AND ?',[req.user.id,from,now],(e,row)=>e?res.status(500).json({error:e.message}):res.json(row||{calories:0,carbs:0,protein:0,fat:0}));
});
module.exports=router;
