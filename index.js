const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const database = require("./config/database");
const cookieParser= require("cookie-parser");
const cors = require("cors");

const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

database.connect();

app.use(express.json());
app.use(cookieParser());
// app.use(
//     cors({
//         origin:"http://localhost:3000",
//         credentials:true,
//     })
// );
app.use(
    cors({
        origin: ["https://study4-u.vercel.app","http://localhost:3000", "http://localhost:5173"],
        credentials: true,
    })
);

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
        limits: { fileSize: 500 * 1024 * 1024 },
	})
)


cloudinaryConnect();
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

app.get("/" , (req, res) =>{
    return res.json({
        sucess:true,
        message:"Your server is up and running..."
    });
});

app.listen(PORT , ()=>{
    console.log(`App is running at ${PORT}`);
})
