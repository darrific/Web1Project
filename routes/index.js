let express = require('express');
let router = express.Router();
let Twitter = require('twitter'); 
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../models/users')
var mongoose = require('mongoose');
let dbToken = 'mongodb://darrific:securepassword123@ds153380.mlab.com:53380/web1project';
var opts = {
     server: {
        socketOptions: {keepAlive: 1}
     }
};

mongoose.connect(dbToken, { useNewUrlParser: true }, opts);
let db = mongoose.connection;

let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const APITokens = require('./twitterModule');
let T = new Twitter(APITokens);

var params = {
  screen_name: ""
}

router.post('/register', function(req, res, next){
  var password = req.body.password;
  var password2 = req.body.password2;
  console.log("flag");
  if (password == password2){
    var newUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      res.redirect("/");
    });
  } else{
    res.status(500).send("{errors: \"Passwords don't match\"}").end()
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/blockout',
  failureFlash: false
}));

router.get('/user', function(req, res){
  res.send(req.user);
})

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/')
});


router.get('/twitterconnect', passport.authenticate('twitter'));

router.get('/twitterconnectcb',
  passport.authenticate('twitter', {
    successRedirect: '/dashboard',
    failureRedirect: '/blockoutTwitter'
}));

router.get('/twitterconnectcb', (req,res,next)=>{
  return res.send('You have connected with twitter');
})

// REST API and Page Routes

router.get('/', (req,res,next)=>{
  if(req.user === undefined)
    return res.render('index'), {title: 'Twitter Fam'};
  return res.redirect('/dashboard')
})

router.get('/dashboard', (req,res,next)=>{
  if(req.user === undefined)
    return res.redirect("/");
  return res.render('dashboard', {username: req.user.username, isAdmin: req.user.isAdmin});
});


router.get('/adminPanel', (req,res,next)=>{
  if(req.user === undefined || !req.user.isAdmin)
    return res.send("You are not admin");
    User.find({}, function(err, users) {
      var userMap = {};
  
      users.forEach(function(user) {
        userMap[user._id] = user;
      });
      return res.render('adminPanel', {users: userMap});
    });
});

router.delete('/users/:id', (req,res,next)=>{
  if(req.user === undefined || !req.user.isAdmin)
    return res.redirect("/");
  User.deleteOne({ _id: req.params.id })
  .then(() => {
      res.json({ success: true });
  })
  .catch(err => {
      res.status.json({ err: err });
  });
});

router.put('/adminStatusChange/:id', (req,res,next)=>{
  console.log("Test 1 Passed");
  if(req.user === undefined || !req.user.isAdmin)
    return res.redirect("/");
    console.log(req.params.id)
    console.log(req.body)
    User.findByIdAndUpdate(req.params.id,req.body,{new: true},(err, updatedUser)=>{
          if (err)
            return res.status(500).send(err);
          return res.send(updatedUser);
      }
  )
});

router.get('/blockout', (req,res,next)=>{
  return res.render("loggedOut");
});

router.get('/blockoutTwitter', (req,res,next)=>{
  return res.render("loggedOutTwitter");
});


// TWITTER BASED DATA API

router.get('/data/followers', (req,res,next)=>{
  params.screen_name = req.user.username;
  T.get('/followers/ids', params, (err,users, response)=>{
    if(!err){
      return res.send(users.ids);
    }
  });
});

router.get('/data/following', (req,res,next)=>{
  params.screen_name = req.user.username;
  T.get('/friends/ids', params, (err,users, response)=>{
    if(!err){
      return res.send(users.ids);
    }
    return res.send(err);
  });
});

router.post('/data/hydrateUsers', (req,res,next)=>{
  let userString = req.body.users
  T.get('users/lookup', {user_id:userString}, (err,userArr, response)=>{
    if(err){
      throw err;
    }
    return res.json(userArr);
  });
})

router.post('/t/follow', (req,res,next)=>{
  T.post('friendships/create', {user_id: req.body.userId}, (err,response)=>{
    if(err){
      throw err;
    }
    return res.send(response);
  })
})

router.post('/t/unfollow', (req,res,next)=>{
  T.post('friendships/destroy', {user_id: req.body.userId}, (err,response)=>{
    if(err){
      throw err;
    }
    return res.send(response);
  })
})

// Test routes

router.get('/data/testFollowers', (req,res,next)=>{
  return res.send([1066822156712140800,2768969354,1099891185966030800,981741450,1180684362,157482025,880909092,715525592817401900,797527758,949797502122975200,915675770831355900,1090935425496244200,999434588463214600,898625019244404700,1480560704,434227902,2595315840,901283822842650600,1713712669,1067544142169940000,1056723206160220200,753974993382277100,95886459,1117654036893900800,2885273272,974036468560748500,883387375161929700,978440412527513600,405556227,2929760735,995241663822991400,2485294678,1084652319621431300,4146581004,717433714955804700,3311973948,894229459,636567844,308476427,1058736971902783500,237280513,1085346212650385400,3237299483,757686953022222300,1109259012443463700,101244047,1085523334383747100,545467524,1021516314173689900,779529254,1491346226,872592955,54941563,1335468834,886891866645569500,1002650127344029700,24619013,2440875918,3103401269,862769912347013100,1084835162330972200,635500597,1112519191536508900,917732637795643400,305964511,195018020,771176171815829500,716107370,1108133707976712200,1097879894606917600,1055451764525330400,1086701139658268700,1009078734895435800,551462526,1967831978,504974882,35536936,455241553,2638419726,1111479026886029300,1128552476,941436437345513500,2663324652,1107470180362453000,834016026400587800,1015084261605552100,711674522,1074417704667365400,716126653,1007581967720833000,1109143058162073600,1087517986397843500,990113492035350500,1107770306507227100,1653180445,2722984547,1091771740651434000,733202552,822923558288552000,950494390899834900,2505833220,1424007612,743424649,1041117116886384600,886412638997139500,1045870602765172700,1529674285,48098368,831694511164313600,307912069,584085646,257166552,2680464398,885586108574294000,869277854944636900,2360839683,2635912977,3142300290,3161691036,1531563926,882597936542224400,771730754623541200,1022259127,3225747025,1042554117959438300,1056700697750704100,1002530197076398100,1086995154,316066682,1095880872618872800,3308568230,760868844,1368497586,1065655846326157300,1350366470,3285781862,933175894289641500,1169956159,968218161031123000,1045344747156623400,3169397299,1082960870538440700,422235946,1282049834,592080389,1009567290885537800,1059261756294467600,237839166,2285652156,1011525291997581300,1049683799729156100,1661199541,3158071842,911568148175999000,1011421410500251600,2555994480,1094415078567350300,855827589826584600,890397246608552000,2508887996,2242768965,1097871939660591100,1428875390,1090639183251759100,1861432333,1003413296198946800,4662565213,873683104208236500,913918874680217600,733711232,2905832621,715516417,364954772,1058157711903342600,932871235637272600,987514125063540700,1091903733284384800,1056592783815905300,401093792,2505870026,1011456344526852100,534526855,3321568232,979908163918028800,4664551879,1252842619,766310136,921969038,849720725720244200,805463229619204100,1062087931039567900,2562025982,1041147147364851700,1042854018526195700,725157266324774900,544749102,1323080480,2269974429,255650992,369801985,898321768808681500,1088589267532685300,282591896,740897890923483100,586104521,829699002711019500,3138000174,207236210,864619273150484500,474346072,829166750696620000,1618892653,395968732,1032441203768401900,285838584,757538834,946132813,312318405,730604244496175100,1042447427859443700,631593613,1342014271,2255105052,746421152600457200,739816507,368065079,44476366,1088621120843145200,1084653178682032100,3363756100,2340990764,43045526,631585346,959438166758494200,851555954,2941585785,2163735512,2894739073,113146096,943211732897599500,1046987569379102700,112812646,471570551,391428006,513405864,222943618,1081659035886207000,1027658226400198700,1052367525814652900,897536119134400500,233052666,979459584401268700,915788108762894300,905592561175322600,571169019,1059859921376890900,1609675622,4534921093,303368625,483459617,1083451501731893200,325607009,454677840,2422653418,3307144359,1073060448839327700,3318685608,947263711110139900,2332663296,1028685977483657200,1055575225327370200,757976078447153200,3315462429,2986748471,845059101059100700,997592044867645400,1040761595566153700,550320585,4879301807,1079563380472598500,1078833516522152000,703462902,345085043,395072834,1080898826288934900,742903449688248300,1015482894456901600,387154148,1059741320758132700,1066461548087074800,965742041434087400,2372838834,1057676983310737400,741836697223102500,610593896,1441656727,855031548,2499956117,985577292326846500,870697426222436400,543638588,2510475123,1007076364816715800,984426087328485400,1388529096,3224527472,1049502338,363098618,30238832,746430689478770700,4502136972,878282666,1033772139063722000,396075977,1342850144,186433877,214641709,551929015,976845344,322675886,1423350529,958524701852209200,3400309612,972578139179225100,622408207,714432004524118000,1607300538,1409284735,739007402,1050806519762174000,336954850,754076633187831800,709211120758706200,1013047074865238000,1967578872,427081102,228141358,2367930210,801235050956197900,1137541832,3251987161,618453493,66816787,3098086167,1458559393,305869990,3317298614,395001117,842574618,3896587814,1541281002,538525511,1362761245,433625617,939280087,433530235,566646457,1683691128,331636214,1045135088,1132600086,574896151,2233519500,1009018421428805600,386830864,3011432452,1272261121,1021159149143568400,1006669095763415000,756298951,1117541528,883261033,301155570,938917658958983200,1325151588,1039768059567906800]);
});

router.get('/data/testFollowing', (req,res,next)=>{
  return res.send([973183515801129000,1066822156712140800,1021118157161926700,543599509,552209757,1067599530911256600,981741450,2768969354,1099891185966030800,593065235,1180684362,302945475,737081490228412400,157482025,880909092,48098368,725186723265785900,717178907242311700,2345918140,4662466993,29217291,797527758,3015266662,915675770831355900,1012162133965131800,999434588463214600,1073987924365115400,898625019244404700,781147056035463200,76766594,1480560704,834192302,527932967,2580859063,434227902,190024323,2595315840,710599716262826000,1713712669,901283822842650600,45266183,1056723206160220200,2507310555,898012439526203400,293776528,753974993382277100,95886459,3252178896,2431411078,2885273272,718642866944278500,974036468560748500,883387375161929700,907349395498311700,1032752771546734600,978440412527513600,2485294678,405556227,3311973948,894229459,1058736971902783500,237280513,1085346212650385400,1085523334383747100,757686953022222300,3237299483,717433714955804700,636567844,917732637795643400,308476427,545467524,1109259012443463700,1021516314173689900,1491346226,872592955,54941563,1335468834,995241663822991400,1002650127344029700,1007057787766132700,24619013,2440875918,1077345398983983100,3103401269,862769912347013100,1084835162330972200,635500597,1112519191536508900,195018020,771176171815829500,1097879894606917600,1108133707976712200,716107370,305964511,1086701139658268700,716126653,1009078734895435800,551462526,988470251460456400,504974882,1967831978,779529254,35536936,2638419726,941436437345513500,2663324652,1107470180362453000,118199191,867227642,1087517986397843500,1163454133,990113492035350500,1107770306507227100,1653180445,1424007612,822923558288552000,4497489616,950494390899834900,1691883714,743424649,2505833220,1041117116886384600,886412638997139500,1053997841947992000,273073807,855031548,616323895,1529674285,995152054803890200,30238832,1007076364816715800,1073060448839327700,454677840,943211732897599500,1088621120843145200,898321768808681500,1095880872618872800,882597936542224400,949797502122975200,2680464398,1062289935426879500,885586108574294000,869277854944636900,257166552,2360839683,584085646,2635912977,3142300290,3161691036,1531563926,771730754623541200,1022259127,1042554117959438300,1056700697750704100,2269974429,1086995154,1002530197076398100,831694511164313600,316066682,929862680466346000,1079388611487952900,3308568230,760868844,3285781862,1368497586,1350366470,1169956159,1045344747156623400,1091903733284384800,968218161031123000,933175894289641500,3169397299,1082960870538440700,422235946,592080389,1059261756294467600,1009567290885537800,1065655846326157300,237839166,2285652156,1011525291997581300,1661199541,890397246608552000,1049683799729156100,3158071842,855827589826584600,1011421410500251600,2555994480,1094415078567350300,1090639183251759100,1861432333,1428875390,2242768965,2508887996,913918874680217600,4662565213,2905832621,733711232,873683104208236500,1097871939660591100,715516417,911568148175999000,364954772,1056592783815905300,987514125063540700,932871235637272600,1011456344526852100,3321568232,1003413296198946800,921969038,849720725720244200,979908163918028800,4664551879,534526855,1252842619,1058157711903342600,766310136,2562025982,1041147147364851700,1042854018526195700,1282049834,513405864,725157266324774900,1323080480,544749102,1062087931039567900,369801985,255650992,2505870026,1088589267532685300,740897890923483100,586104521,282591896,3138000174,207236210,829699002711019500,474346072,864619273150484500,829166750696620000,1618892653,631593613,757538834,285838584,2255105052,946132813,312318405,1042447427859443700,1032441203768401900,395072834,2372838834,1342014271,395968732,730604244496175100,746421152600457200,947263711110139900,1046987569379102700,368065079,44476366,1084653178682032100,3363756100,631585346,43045526,2340990764,959438166758494200,851555954,2894739073,2163735512,113146096,2941585785,224986614,287210111,1246754660,112812646,471570551,1081659035886207000,222943618,391428006,1027658226400198700,894715458875797500,1052367525814652900,979459584401268700,233052666,915788108762894300,1609675622,571169019,905592561175322600,1059859921376890900,2332663296,301155570,303368625,483459617,1083451501731893200,1300678026,325607009,2970050187,2422653418,3307144359,1015482894456901600,897536119134400500,345085043,965742041434087400,1055575225327370200,1040761595566153700,1079563380472598500,4879301807,757976078447153200,845059101059100700,3315462429,550320585,1028685977483657200,2986748471,3225747025,997592044867645400,1078833516522152000,703462902,1080898826288934900,742903449688248300,387154148,1388529096,1059741320758132700,2510475123,3318685608,1057676983310737400,741836697223102500,610593896,805463229619204100,307912069,1441656727,3299151625,2499956117,985577292326846500,4534921093,870697426222436400,543638588,984426087328485400,263909256,363098618,1049502338,1039768059567906800,3098086167,3251987161,2367930210,1967578872,958524701852209200,551929015,1033772139063722000,4502136972,746430689478770700,3224527472,396075977,79095569,186433877,1342850144,214641709,878282666,254284947,1423350529,322675886,976845344,3400309612,8443072,29873662,4780651477,403614288,714432004524118000,622408207,972578139179225100,1541281002,228141358,1607300538,1409284735,1683691128,739007402,336954850,709211120758706200,801235050956197900,3317298614,842574618,395001117,1132600086,566646457,538525511,305869990,66816787,1050806519762174000,618453493,574896151,1137541832,939280087,3896587814,239672340,739816507,44196397,433530235,386830864,427081102,2233519500,433625617,3011432452,1362761245,756298951,883261033,1006669095763415000,1013047074865238000,1021159149143568400,938917658958983200,331636214,1272261121,1458559393,1117541528,1045135088,754076633187831800,401093792,1009018421428805600,1325151588]);
});

router.post('/data/testHyd', (erq,res,next)=>{
  return res.send([{ id: 403614288,
    id_str: '403614288',
    name: 'Linus Tech Tips',
    screen_name: 'LinusTech',
    location: 'Vancouver, BC',
    description:
     'The official Twitter of the Linus Tech Tips and Techquickie YouTube channels. Run by the entire Linus Media Group crew. \nhttps://t.co/pOSv8ntTJA',
    url: 'https://t.co/avXGSXi7Up',
    entities: { url: [Object], description: [Object] },
    protected: false,
    followers_count: 802266,
    friends_count: 241,
    listed_count: 2576,
    created_at: 'Wed Nov 02 19:04:43 +0000 2011',
    favourites_count: 3150,
    utc_offset: null,
    time_zone: null,
    geo_enabled: true,
    verified: true,
    statuses_count: 42630,
    lang: 'en',
    status:
     { created_at: 'Sun Apr 21 19:04:55 +0000 2019',
       id: 1120040735200251900,
       id_str: '1120040735200251905',
       text:
        "NEW VIDEO!: I'm totally taking this portable monitor on my next trip!\nhttps://t.co/kwxMJuOV8k https://t.co/83rfWUepPc",
       truncated: false,
       entities: [Object],
       extended_entities: [Object],
       source:
        '<a href="http://twitter.com/download/android" rel="nofollow">Twitter for Android</a>',
       in_reply_to_status_id: null,
       in_reply_to_status_id_str: null,
       in_reply_to_user_id: null,
       in_reply_to_user_id_str: null,
       in_reply_to_screen_name: null,
       geo: null,
       coordinates: null,
       place: null,
       contributors: null,
       is_quote_status: false,
       retweet_count: 24,
       favorite_count: 567,
       favorited: false,
       retweeted: false,
       possibly_sensitive: false,
       lang: 'en' },
    contributors_enabled: false,
    is_translator: false,
    is_translation_enabled: false,
    profile_background_color: '131516',
    profile_background_image_url: 'http://abs.twimg.com/images/themes/theme14/bg.gif',
    profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme14/bg.gif',
    profile_background_tile: true,
    profile_image_url:
     'http://pbs.twimg.com/profile_images/1034493707553140736/cDlQGimm_normal.jpg',
    profile_image_url_https:
     'https://pbs.twimg.com/profile_images/1034493707553140736/cDlQGimm_normal.jpg',
    profile_banner_url: 'https://pbs.twimg.com/profile_banners/403614288/1535477488',
    profile_link_color: 'FC5331',
    profile_sidebar_border_color: 'FFFFFF',
    profile_sidebar_fill_color: 'EFEFEF',
    profile_text_color: '333333',
    profile_use_background_image: true,
    has_extended_profile: true,
    default_profile: false,
    default_profile_image: false,
    following: true,
    follow_request_sent: false,
    notifications: false,
    translator_type: 'none' },
  { id: 239672340,
    id_str: '239672340',
    name: 'Unbox Therapy',
    screen_name: 'UnboxTherapy',
    location: 'Toronto',
    description: 'Where products get naked.',
    url: 'https://t.co/qgVbKP03Ta',
    entities: { url: [Object], description: [Object] },
    protected: false,
    followers_count: 2126086,
    friends_count: 504,
    listed_count: 3360,
    created_at: 'Tue Jan 18 04:39:42 +0000 2011',
    favourites_count: 12121,
    utc_offset: null,
    time_zone: null,
    geo_enabled: true,
    verified: true,
    statuses_count: 23610,
    lang: 'en',
    status:
     { created_at: 'Sun Apr 21 17:14:11 +0000 2019',
       id: 1120012868894830600,
       id_str: '1120012868894830593',
       text:
        "Didn't expect this...\nhttps://t.co/UjD8nXrh4q https://t.co/h1QXCkzjsw",
       truncated: false,
       entities: [Object],
       extended_entities: [Object],
       source:
        '<a href="http://twitter.com/download/android" rel="nofollow">Twitter for Android</a>',
       in_reply_to_status_id: null,
       in_reply_to_status_id_str: null,
       in_reply_to_user_id: null,
       in_reply_to_user_id_str: null,
       in_reply_to_screen_name: null,
       geo: null,
       coordinates: null,
       place: null,
       contributors: null,
       is_quote_status: false,
       retweet_count: 186,
       favorite_count: 2611,
       favorited: false,
       retweeted: false,
       possibly_sensitive: false,
       lang: 'en' },
    contributors_enabled: false,
    is_translator: false,
    is_translation_enabled: false,
    profile_background_color: '131516',
    profile_background_image_url: 'http://abs.twimg.com/images/themes/theme14/bg.gif',
    profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme14/bg.gif',
    profile_background_tile: false,
    profile_image_url:
     'http://pbs.twimg.com/profile_images/1116055826354114563/E3cZ6GmU_normal.png',
    profile_image_url_https:
     'https://pbs.twimg.com/profile_images/1116055826354114563/E3cZ6GmU_normal.png',
    profile_banner_url: 'https://pbs.twimg.com/profile_banners/239672340/1554943788',
    profile_link_color: '000000',
    profile_sidebar_border_color: 'FFFFFF',
    profile_sidebar_fill_color: 'EFEFEF',
    profile_text_color: '333333',
    profile_use_background_image: true,
    has_extended_profile: false,
    default_profile: false,
    default_profile_image: false,
    following: true,
    follow_request_sent: false,
    notifications: false,
    translator_type: 'none' },
  { id: 44196397,
    id_str: '44196397',
    name: 'Elon Musk',
    screen_name: 'elonmusk',
    location: '',
    description: 'Meme Necromancer',
    url: null,
    entities: { description: [Object] },
    protected: false,
    followers_count: 25987208,
    friends_count: 81,
    listed_count: 49694,
    created_at: 'Tue Jun 02 20:12:29 +0000 2009',
    favourites_count: 2747,
    utc_offset: null,
    time_zone: null,
    geo_enabled: false,
    verified: true,
    statuses_count: 7359,
    lang: 'en',
    status:
     { created_at: 'Mon Apr 22 08:40:31 +0000 2019',
       id: 1120245988860411900,
       id_str: '1120245988860411904',
       text: 'Full Metal Alchemy https://t.co/7UMaanRG8t',
       truncated: false,
       entities: [Object],
       source:
        '<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>',
       in_reply_to_status_id: null,
       in_reply_to_status_id_str: null,
       in_reply_to_user_id: null,
       in_reply_to_user_id_str: null,
       in_reply_to_screen_name: null,
       geo: null,
       coordinates: null,
       place: null,
       contributors: null,
       is_quote_status: true,
       quoted_status_id: 1119767408556687400,
       quoted_status_id_str: '1119767408556687361',
       retweet_count: 5012,
       favorite_count: 32061,
       favorited: false,
       retweeted: false,
       possibly_sensitive: false,
       lang: 'en' },
    contributors_enabled: false,
    is_translator: false,
    is_translation_enabled: false,
    profile_background_color: 'C0DEED',
    profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
    profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
    profile_background_tile: false,
    profile_image_url:
     'http://pbs.twimg.com/profile_images/1119305550548725760/wHVHjd4h_normal.jpg',
    profile_image_url_https:
     'https://pbs.twimg.com/profile_images/1119305550548725760/wHVHjd4h_normal.jpg',
    profile_banner_url: 'https://pbs.twimg.com/profile_banners/44196397/1555922175',
    profile_link_color: '0084B4',
    profile_sidebar_border_color: 'C0DEED',
    profile_sidebar_fill_color: 'DDEEF6',
    profile_text_color: '333333',
    profile_use_background_image: true,
    has_extended_profile: true,
    default_profile: false,
    default_profile_image: false,
    following: true,
    follow_request_sent: false,
    notifications: false,
    translator_type: 'none' }]);
});

module.exports = router;
