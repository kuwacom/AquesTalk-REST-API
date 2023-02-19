const fs = require("fs");
const axios = require('axios');
const { exec } = require('child_process');
const express = require("express");
const iconv = require('iconv-lite');
const app = express();
const kLogger = require("./klogger");
const { randomInt } = require("crypto");
const logger = new kLogger({
    info: true,
    debug: true,
    error: true 
});

// エラーハンドリング
process.on("uncaughtException", (err) => {
    logger.error(err);
});

const server = app.listen(30596,'0.0.0.0', () => {
    logger.info("AquesTalk HTTP API bind on "+server.address().address+":"+ + server.address().port);
});

app.get("/synthesize", async (req, res, next) => {
    let text = req.query.text;
    let type = req.query.type;
    let speed = req.query.speed;
    if(!text){
        res.json({
            status:"error"
        })
        return;
    }
    if(!speed) speed = 1;

    let url = encodeURI(`https://api.kuwa.app/voicevox-old/audio_query?text=${text.replace("ヴ", "ボ")}&speaker=0`);
    let response = await axios.post(url);
    text = response.data["kana"];
    console.log("\n"+text+"\n");

    const inTEMP = "./temp/"+randomInt(100000,999999);
    const outTEMP = "./temp/"+randomInt(100000,999999);

    const writer = fs.createWriteStream(inTEMP);
    writer.write(iconv.encode(text, "Shift_JIS"));
    writer.end();
    const AquesTalkCMD = `AquesTalkCMD.exe ${type} ${speed*100} ${inTEMP} ${outTEMP}`;
    exec(AquesTalkCMD, (err, stdout, stderr) => {
        fs.unlinkSync(inTEMP);
        if (err) {
            logger.error(`audio query => ${req.query.text}\nsynthesize => ${text} : ${type} : ${speed}\n ERROR > ${err}`);
            res.status(500);
            res.send("{\"status\":\"error\"}");
            res.end();
            return;
        }
        logger.debug(`audio query => ${req.query.text}\nsynthesize => ${text} : ${type} : ${speed}`);
        res.send(fs.readFileSync(outTEMP));
        res.end();
        fs.unlinkSync(outTEMP);
    });
});