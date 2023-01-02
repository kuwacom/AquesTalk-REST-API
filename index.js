const fs = require("fs");
const axios = require('axios');
const { exec } = require('child_process');
const express = require("express");
const iconv = require('iconv-lite');
const app = express();
const kLoger = require("./kloger");
const { randomInt } = require("crypto");
const loger = new kLoger({
    info: true,
    debug: true,
    error: true 
});

// エラーハンドリング
process.on("uncaughtException", (err) => {
    loger.error(err);
});

const server = app.listen(30596,'0.0.0.0', () => {
    loger.info("AquesTalk HTTP API bind on "+server.address().address+":"+ + server.address().port);
});

app.get("/synthesize", async (req, res, next) => {
    let text = req.query.text;
    let type = req.query.type;
    let speed = req.query.speed;
    if(!text){
        res.json({
            status:"error"
        })
        return
    }
    if(!speed){speed = 1}

    let url = encodeURI(`https://api.kuwa.app/voicevox/audio_query?text=${text.replace("ヴ", "ボ")}&speaker=0`)
    let response = await axios.post(url);
    text = response.data["kana"];
    console.log("\n"+text+"\n")

    const inTEMP = "./temp/"+randomInt(100000,999999);
    const outTEMP = "./temp/"+randomInt(100000,999999);

    const writer = fs.createWriteStream(inTEMP);
    writer.write(iconv.encode(text, "Shift_JIS"));
    writer.end();
    const AquesTalkCMD = `AquesTalkCMD.exe ${type} ${speed*100} ${inTEMP} ${outTEMP}`;
    exec(AquesTalkCMD, (err, stdout, stderr) => {
        fs.unlinkSync(inTEMP);
        if (err) {
            loger.error(`audio query => ${req.query.text}\nsynthesize => ${text} : ${type} : ${speed}\n ${err}`);
            res.res.writeHead(500);
            res.send("{\"status\":\"error\"}");
            res.end();
            return;
        }
        loger.debug(`audio query => ${req.query.text}\nsynthesize => ${text} : ${type} : ${speed}`);
        res.send(fs.readFileSync(outTEMP));
        res.end();
        fs.unlinkSync(outTEMP);
    });
});