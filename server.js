var express = require("express");

var app = express();

app.listen(5005, function () {
    console.log("Server Started");
})
app.get("/", function (req, resp) {

    var path = __dirname + "/public/index.html";
    resp.sendFile(path);
})
app.use(express.static("public"));
app.use(express.urlencoded(true));
var mysql = require("mysql2");
require('dotenv').config();
let url_Aiven = process.env.AI_ven_url;
let mysqlcon = mysql.createConnection(url_Aiven);
mysqlcon.connect(function (err) {
    if (err == null)
        console.log("connected successfully......");
    else
        console.log(err.message);
})


var fileuploder = require("express-fileupload");
app.use(fileuploder());
var cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_API,
    api_secret: process.env.cloud_secret,
});



app.post("/do-signup", function (req, resp) {


    let email = req.body.txtmail;
    let pass = req.body.txtpwd;
    let utype = req.body.utype;



    let emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


    if (!email || email.trim() === "") {
        return resp.send("Email is required");
    }


    if (!emailRegex.test(email)) {
        return resp.send("Invalid email address");
    }

    if (!pass || pass.trim() === "")
        return resp.send("Password is required");

    if (pass.length < 8)
        return resp.send("Password must be at least 8 characters");

    if (!/[A-Z]/.test(pass))
        return resp.send("At least one uppercase letter required");

    if (!/[a-z]/.test(pass))
        return resp.send("At least one lowercase letter required");

    if (!/\d/.test(pass))
        return resp.send("At least one number required");

    if (!/[@$!%*?&]/.test(pass))
        return resp.send("At least one special character required");



    mysqlcon.query(
        "INSERT INTO project_data(email,password_,user_type,date_of_signup,status_) VALUES(?,?,?,CURRENT_DATE(),1)",
        [email, pass, utype],
        function (err) {
            if (err) {
                return resp.send(err);
            }

            else {
                return resp.send("Signup successfully");
            }
        }
    );

});

app.get("/check-email-ajax", function (req, resp) {

    let email = req.query.email;

    mysqlcon.query(
        "SELECT * FROM project_data WHERE email=?",
        [email],
        function (err, result) {
            if (!result.length == 1) {
                return resp.send("Email is avilable");
            }
            else {
                return resp.send("Email is alredy ragistered");
            }
        }
    );
});

app.post("/do-login", function (req, resp) {

    let email = req.body.txtmail1;
    let pass = req.body.txtpwd1;

    mysqlcon.query(
        "SELECT * FROM project_data WHERE email=? AND password_=?",
        [email, pass],
        function (err, result) {

            if (err) {
                return resp.send(err.message);
            }


            if (result.length == 0) {
                return resp.send("Invalid Email or Password");
            }

            if (result[0].status_ == 0) {
                return resp.send("You are blocked");
            }

            return resp.send(result[0].user_type);
        }
    );
});

app.get("/Profile", function (req, resp) {
    var path = __dirname + "/public/Donner_profile.html";
    resp.sendFile(path);
})
app.get("/dash", function (req, resp) {
    var path = __dirname + "/public/Dash_donner.html";
    resp.sendFile(path);
})

app.post("/Donor-profile", async function (req, resp) {
    //================aadhar pic========================================//
    let msg = "File not Uploaded";
    let myUrl = "nopic.jpg";
    if (req.files != null) {
        let fileName = req.files.Aadhar_pic.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.Aadhar_pic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        });
    }
    //================Profile pic========================================//

    let msg1 = "File not Uploaded";
    let myUrl1 = "nopic.jpg";
    {
        let fileName1 = req.files.profile_pic.name;
        let fullPath1 = __dirname + "/uploads/" + fileName1;
        await req.files.profile_pic.mv(fullPath1);
        msg1 = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath1).then(function (picUrlResult) {
            myUrl1 = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl1);
        });
    }
    //=======================update===============================//
    let path_response = __dirname + "/public/" + "/response.html"

    let email1 = req.body.email;
    let name1 = req.body.name;
    let no1 = req.body.no;
    let address1 = req.body.add;
    let city1 = req.body.city;

    mysqlcon.query(
        "INSERT INTO donor_data(email,name_,Mobile_no,Address,date_of_signup,City,Aadhar_path,pic_path)VALUES(?,?,?,?,CURRENT_DATE(),?,?,?)", [email1, name1, no1, address1, city1, myUrl, myUrl1],
        function (err) {
            if (err == null)
                resp.sendFile(path_response)
            else
                resp.send(err.message);
        }
    );

});


app.post("/update-data", async function (req, resp) {
    //File Uploading
    let msg = "File not Uploaded";
    let myUrl = "nopic.jpg";
    if (req.files != null) {
        let fileName = req.files.profile_pic.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.profile_pic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        });
    }
    else {
        myUrl = req.body.hnd;
    }


    let msg1 = "File not Uploaded";
    let myUrl1 = "nopic.jpg";
    if (req.files != null) {
        let fileName1 = req.files.Aadhar_pic.name;
        let fullPath1 = __dirname + "/uploads/" + fileName1;
        await req.files.Aadhar_pic.mv(fullPath1);
        msg1 = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath1).then(function (picUrlResult) {
            myUrl1 = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl1);
        });
    }
    else {
        myUrl1 = req.body.hnd1;
    }
    let path_response = __dirname + "/public/" + "/response.html"
    let email1 = req.body.email;
    let name1 = req.body.name;
    let no1 = req.body.no;
    let address1 = req.body.add;
    let city1 = req.body.city;

    mysqlcon.query("update donor_data set name_=?,Mobile_no=?,Address=?,City=?,Aadhar_path=?,pic_path=? where email=? ", [name1, no1, address1, city1, myUrl, myUrl1, email1], function (err) {
        if (err == null)
            resp.sendFile(path_response)
        else
            resp.send(err.message);
    })

})
app.get("/Get-Data", function (req, resp) {

    let email = req.query.email;
    //? is called in Parameter
    mysqlcon.query("select * from donor_data where email=?", [email], function (err, resultJSONAry) {
        if (err == null) {
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/med", function (req, resp) {
    var path = __dirname + "/public/Avail_madicin.html";
    resp.sendFile(path);
})


app.post("/avail-medicine", async function (req, resp) {
    //================med pic========================================//

    let msg1 = "File not Uploaded";
    let myUrl1 = "nopic.jpg";
    {
        let fileName1 = req.files.medPic.name;
        let fullPath1 = __dirname + "/uploads/" + fileName1;
        await req.files.medPic.mv(fullPath1);
        msg1 = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath1).then(function (picUrlResult) {
            myUrl1 = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl1);
        });
    }
    let path_response = __dirname + "/public/" + "/response.html"
    let email1 = req.body.email;
    let medicine = req.body.medicine;
    let expiry = req.body.expiry;
    let company = req.body.company;
    let packing = req.body.packing;
    let qty = req.body.qty;
    let info = req.body.info;
    mysqlcon.query(
        "INSERT INTO med_data(email,med_name,date_of_expery,company,packing,quty,pic_path,other_info)VALUES(?,?,?,?,?,?,?,?)", [email1, medicine, expiry, company, packing, qty, myUrl1, info],
        function (err) {
            if (err == null)
                resp.sendFile(path_response)
            else
                resp.send(err.message);
        })
}
);



app.get("/equ", function (req, resp) {
    var path = __dirname + "/public/equpment_avail.html";
    resp.sendFile(path);
})

app.post("/avail-equipment", async function (req, resp) {

    let msg = "File not Uploaded";
    let myUrl = "nopic.jpg";
    if (req.files != null) {
        let fileName = req.files.pic1.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.pic1.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        });
    }

    let msg1 = "File not Uploaded";
    let myUrl1 = "nopic.jpg";
    {
        let fileName1 = req.files.pic2.name;
        let fullPath1 = __dirname + "/uploads/" + fileName1;
        await req.files.pic2.mv(fullPath1);
        msg1 = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath1).then(function (picUrlResult) {
            myUrl1 = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl1);
        });
    }
    let path_response = __dirname + "/public/" + "/response.html"
    let email1 = req.body.email;
    let type = req.body.type;
    let condition = req.body.condition;
    let status = req.body.status;
    let amount = req.body.amount;
    let info = req.body.info;
    mysqlcon.query(
        "INSERT INTO equ_data(email, type, candation, status_, Amount, pic1_path, pic2_path, other_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [email1, type, condition, status, amount, myUrl, myUrl1, info],
        function (err) {
            if (err == null)
                resp.sendFile(path_response)
            else
                resp.send(err.message);
        })
}
);



app.get("/fetch-all", function (req, resp) {

    //? is called in Parameter
    mysqlcon.query("select * from project_data ", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
app.get("/angular", function (req, resp) {
    var path = __dirname + "/public/Admin_portel.html";
    resp.sendFile(path);
})
app.get("/adminpass1234", function (req, resp) {
    var path = __dirname + "/public/admindash.html";
    resp.sendFile(path);
})
app.get("/NGOdash", function (req, resp) {
    var path = __dirname + "/public/Ngo-dash.html";
    resp.sendFile(path);
})
app.get("/do-delete", function (req, resp) {
    let email = req.query.emailKeyKuch;
    //? is called in Parameter
    mysqlcon.query("delete from project_data where email=?", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record  Deleted Successsfulllyyyy");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})


app.get("/doBlock", function (req, resp) {
    let email = req.query.email_0;
    let status = 0;
    //? is called in Parameter
    mysqlcon.query("UPDATE project_data SET status_ = ? WHERE email = ?",
        [status, email], function (err, result) {
            if (err == null) {
                resp.send("User Bolcked Successfully")
            }
            else
                resp.send(err.message);
        })
})


app.get("/doUnBlock", function (req, resp) {
    let email = req.query.email_1;
    let status1 = 1;

    mysqlcon.query(
        "UPDATE project_data SET status_ = ? WHERE email = ?",
        [status1, email],
        function (err, result) {
            if (err) {
                return resp.send(err.message);
            }
            resp.send("User Unblocked Successfully");
        }
    );
});

app.get("/fetch-all1", function (req, resp) {

    let email = req.query.emailid;

    mysqlcon.query(
        "SELECT * FROM equ_data WHERE email=?",
        [email],
        function (err, result) {

            if (err) {
                console.log(err);
                return resp.status(500).send(err);
            }

            resp.send(result);

        }
    );

});

app.get("/delete-equipment", function (req, resp) {

    let rid = req.query.rid;

    mysqlcon.query(
        "DELETE FROM equ_data WHERE rid=?",
        [rid],
        function (err, result) {

            if (err) {
                console.log(err);
                return resp.status(500).send(err);
            }

            if (result.affectedRows == 0)
                return resp.send("Record Not Found");

            resp.send("Equipment Deleted Successfully");

        }
    );

});


app.get("/fetch-medicine", function (req, resp) {

    let email = req.query.emailid;

    mysqlcon.query(
        "SELECT * FROM med_data WHERE email=?",
        [email],
        function (err, result) {

            if (err) {
                console.log(err);
                return resp.status(500).send(err);
            }

            resp.send(result);

        }
    );

});

app.get("/delete-medicine", function (req, resp) {

    let rid = req.query.rid;

    mysqlcon.query(
        "DELETE FROM med_data WHERE rid=?",
        [rid],
        function (err, result) {

            if (err) {
                console.log(err);
                return resp.status(500).send("Delete Failed");
            }

            if (result.affectedRows == 0) {
                return resp.send("Medicine Not Found");
            }

            resp.send("Medicine Deleted Successfully");

        }
    );

});

app.get("/fetch-equ", function (req, resp) {

    let email = req.query.emailid;

    console.log("Equipment fetch email:", email);

    mysqlcon.query(
        "SELECT * FROM equ_data WHERE email=?",
        [email],
        function (err, result) {

            if (err) {
                console.log("FETCH EQU ERROR:", err);
                return resp.status(500).send(err);
            }

            console.log("Equipment result:", result);

            resp.send(result);
        }
    );
});



app.get("/delete-equ", function (req, resp) {

    let rid = req.query.rid;

    mysqlcon.query(
        "DELETE FROM equ_data WHERE rid=?",
        [rid],
        function (err, result) {

            if (err) {
                console.log(err);
                return resp.status(500).send("Delete Failed");
            }

            if (result.affectedRows == 0) {
                return resp.send("Equipment Not Found");
            }

            resp.send("Equipment Deleted Successfully");

        }
    );

});

//update password donor dash profile settings modal
app.use(express.json());

app.post("/update-password", function (req, resp) {

    let email = req.body.email;
    let oldPwd = req.body.oldPwd;
    let newPwd = req.body.newPwd;

    mysqlcon.query(
        "UPDATE project_data SET password_=? WHERE email=? AND password_=?",
        [newPwd, email, oldPwd],
        function (err, result) {

            if (err)
                return resp.send(err.message);

            if (result.affectedRows == 1)
                resp.send("Password Updated Successfully...");
            else
                resp.send("Invalid Email or Existing Password");
        }
    );
});
app.get("/med1", function (req, resp) {
    var path = __dirname + "/public/adminmed.html";
    resp.sendFile(path);
})
app.get("/fetch-med", function (req, resp) {
    mysqlcon.query("select * from med_data ", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
app.get("/medfind", function (req, resp) {
    var path = __dirname + "/public/medfinder.html";
    resp.sendFile(path);
})
app.get("/equfind", function (req, resp) {
    var path = __dirname + "/public/equipmentfinder.html";
    resp.sendFile(path);
})
app.get("/Ngoprofile", function (req, resp) {
    var path = __dirname + "/public/NGO-ragister.html";
    resp.sendFile(path);
})
app.get("/Ngofind", function (req, resp) {
    var path = __dirname + "/public/NGO_finder.html";
    resp.sendFile(path);
})
app.get("/needy-profile", function (req, resp) {
    var path = __dirname + "/public/Needy_profile.html";
    resp.sendFile(path);
})
app.get("/needy-dash", function (req, resp) {
    var path = __dirname + "/public/needydash.html";
    resp.sendFile(path);
})
// Fetch distinct cities
app.get("/fetch-distinct-city", function (req, resp) {

    mysqlcon.query("SELECT DISTINCT City FROM donor_data ORDER BY City", function (err, result) {

        if (err) {
            console.log(err);
            resp.send(err);
        } else {
            resp.send(result);
        }

    });

});

// Fetch medicines according to selected city
app.get("/fetch-med", function (req, resp) {

    let city = req.query.city;

    mysqlcon.query(
        `SELECT DISTINCT m.med_name
         FROM donor_data AS d
         INNER JOIN med_data AS m
         ON d.email = m.email
         WHERE d.City = ?`,
        [city],
        function (err, result) {

            if (err) {
                console.log(err);
                resp.send(err);
            } else {
                resp.send(result);
            }

        }
    );

});

// Show complete donor + medicine details
app.get("/show_med_full", function (req, resp) {

    let city = req.query.city;
    let medname = req.query.medname;

    mysqlcon.query(
        `SELECT d.*, m.*
         FROM donor_data AS d
         INNER JOIN med_data AS m
         ON d.email = m.email
         WHERE d.City = ?
         AND m.med_name = ?`,
        [city, medname],
        function (err, result) {

            if (err) {
                console.log(err);
                resp.send(err);
            } else {
                resp.send(result);
            }

        }
    );

});




// Fetch distinct cities
app.get("/fetch-distinct-city1", function (req, resp) {

    mysqlcon.query("SELECT DISTINCT City FROM donor_data ORDER BY City", function (err, result) {

        if (err) {
            console.log(err);
            resp.send(err);
        } else {
            resp.send(result);
        }

    });

});

// Fetch medicines according to selected city
app.get("/fetch-equ", function (req, resp) {

    let city = req.query.city;

    mysqlcon.query(
        `SELECT DISTINCT e.type
         FROM donor_data AS d
         INNER JOIN equ_data AS e
         ON d.email = e.email
         WHERE d.City = ?`,
        [city],
        function (err, result) {

            if (err) {
                console.log(err);
                resp.send(err);
            } else {
                resp.send(result);
            }

        }
    );

});

// Show complete donor + medicine details
app.get("/show_equ_full", function (req, resp) {

    let city = req.query.city;
    let equname = req.query.equname;

    mysqlcon.query(
        `SELECT d.*, e.*
         FROM donor_data AS d
         INNER JOIN equ_data AS e
         ON d.email = e.email
         WHERE d.City = ?
         AND e.type = ?`,
        [city, equname],
        function (err, result) {

            if (err) {
                console.log(err);
                resp.send(err);
            } else {
                resp.send(result);
            }

        }
    );

});

app.post("/NGO-register", async function (req, resp) {

    try {
        let path_response = __dirname + "/public/" + "/response_ngo.html"

        // Form data

        let email = req.body.email;

        let ngo = req.body.NGO;

        let office = req.body.Office;

        let city = req.body.City;

        let web = req.body.web;

        let contact = req.body.no;

        let since = req.body.since;

        let chair = req.body.chair;

        let work = req.body.work;

        let registrationNumber = req.body.no1;


        // File upload

        let msg1 = "File not Uploaded";

        let myUrl1 = "nopic.jpg";


        if (req.files != null && req.files.Proof != null) {


            let fileName1 = req.files.Proof.name;


            let fullPath1 =
                __dirname + "/uploads/" + fileName1;


            await req.files.Proof.mv(fullPath1);


            msg1 = "Uploaded Successfully";


            await cloudinary.uploader.upload(fullPath1)

                .then(function (picUrlResult) {

                    myUrl1 = picUrlResult.url;


                    console.log("************");

                    console.log(myUrl1);

                });

        }


        // Insert into MySQL
        mysqlcon.query("INSERT INTO ngo_data (email, NGO, Office, City, web, no, since, chair, work, no1, reg_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [email, ngo, office, city, web, contact, since, chair, work, registrationNumber, myUrl1], function (err, result) {


            if (err) {

                console.log(err);

                return alert(
                    "NGO Registration Failed"
                );

            }


            resp.sendFile(path_response)


        }

        );


    }

    catch (err) {

        console.log(err);

        resp.send(
            "Something went wrong"
        );

    }

});

app.get("/fetch-distinct-city-ngo", function (req, resp) {

    mysqlcon.query(

        "SELECT DISTINCT City FROM ngo_data ORDER BY City",

        function (err, result) {

            if (err) {

                console.log(err);

                resp.send(err);

            } else {

                resp.send(result);

            }

        }

    );

});


app.get("/fetch-ngo", function (req, resp) {
    let city = req.query.city;
    mysqlcon.query("SELECT * FROM ngo_data WHERE City = ?", [city], function (err, result) {

        if (err) {

            console.log(err);

            resp.send(err);

        }

        else {

            resp.send(result);

        }

    }

    );

});

//============GEN AI====================//
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI("AQ.Ab8RN6KXZOBlvXdO8kYL95kZ6TONTv9IbEcV1SLLiXnVJjHGLw");
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

async function read_AI(imgurl, prompt) {
    const myprompt = prompt;
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}
app.post("/needy-profile", async function (req, resp) {
    let jsonResultFromAi;
    let msg = "File not Uploaded";
    let myUrl = "nopic.jpg";
    let myUrl1 = "nopic.jpg";
    if (req.files != null) {
        let fileName = req.files.Aadhar_pic.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.Aadhar_pic.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
            front = await read_AI(myUrl, "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string. give dob as date type");
            console.log(jsonResultFromAi);
            //resp.send(jsonResultFromAi);

        });

    }
    if (req.files != null) {
        let fileName = req.files.Aadhar_pic1.name;
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.Aadhar_pic1.mv(fullPath);
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {
            myUrl1 = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl1);
            back = await read_AI(myUrl1, "Read the text from the Aadhaar card image.Extract the following information:1. Full address 2. city 3. State Return ONLY valid JSON in exactly this format:  {Address'', City:'', state:'}. Dont give output as string. Rules: city: Extract the city, town, or village name from the address. The city may appear after 'PO: ' (Post Office) or as a locality/town name.");
            console.log(jsonResultFromAi);
            //resp.send(jsonResultFromAi);

        });


    }

    let path_response = __dirname + "/public/" + "/response_needy.html"
    let name = front.name;
    let ano = front.adhaar_number;
    let gen = front.gender;
    let dob = front.dob;
    let Address = back.Address;
    let state = back.state;
    let email = req.body.email;
    let no = req.body.no;

    mysqlcon.query("INSERT INTO needy_data (email, name_, Mobile_no,Aadhar, Address, date_of_birth, state, pic_path, pic_path1) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [email, name, no, ano, Address, dob, state, myUrl, myUrl1], function (err, result) {
        if (err == null)
             resp.sendFile(path_response)
        else
            resp.send(err.message);
        console.log(err.message);
    })

})