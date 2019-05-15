Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
}
const blockedTags = ["a","some"].reduce((pv,cv)=>{
    pv[cv] = true;
    return pv;
},{});
const FIRST_PARTY_DELAY = 1000;
const MemeFormatRoot = "meme-images/";
function drawImageCover(context,imageElement,fullWidth,fullHeight) {
    const ratio = imageElement.width / imageElement.height;
    if(ratio > 1) {
        const adjustedWidth = imageElement.width / (imageElement.height / fullHeight);
        const x = (fullWidth - adjustedWidth) / 2;
        if(x > 0) {
            const adjustedHeight = imageElement.height / (imageElement.width / fullWidth);
            const y = (fullHeight - adjustedHeight) / 2;
            context.drawImage(
                imageElement,0,0,imageElement.width,imageElement.height,
                0,y,fullWidth,adjustedHeight
            );
        } else {
            context.drawImage(
                imageElement,0,0,imageElement.width,imageElement.height,
                x,0,adjustedWidth,fullHeight
            );
        }
    } else {
        const adjustedHeight = imageElement.height / (imageElement.width / fullWidth);
        const y = (fullHeight - adjustedHeight) / 2;
        if(y > 0) {
            const adjustedWidth = imageElement.width / (imageElement.height / fullHeight);
            const x = (fullWidth - adjustedWidth) / 2;
            context.drawImage(
                imageElement,0,0,imageElement.width,imageElement.height,
                x,0,adjustedWidth,fullHeight
            );
        } else {
            context.drawImage(
                imageElement,0,0,imageElement.width,imageElement.height,
                0,y,fullWidth,adjustedHeight
            );
        }
    }
}
function getFlickrImage(searchName,callback) {
    const splitReuslt = searchName.split(" ");
    if(splitReuslt.length > 1) {
        searchName = splitReuslt.filter(item=>{
            return !blockedTags[item];
        });
    }
    const processData = data => {
        console.log(`Search name: ${searchName}`);
        if(!data.items.length) {
            console.warn("Flickr search had no results");
            callback({
                retryFirstParty: true,
                failed: true
            });
            return;
        }
        const image = data.items[Math.floor(Math.random() * data.items.length) % data.items.length]["media"]["m"].replace("_m", "_b");
        callback({
            imagePath: image,
            failed: false
        });
    }
    $.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",{
        tags: searchName,
        tagmode: "any",
        format: "json"
    },processData).catch(()=>{
        console.warn("Failure with jquery's getJSON and Flickr's API");
        callback({
            failed: true
        });
    });
}
function getLines(ctx,text,maxWidth) {
    //https://stackoverflow.com/a/16599668
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];
    for(let i = 1;i < words.length;i++) {
        const word = words[i];
        const width = ctx.measureText(`${currentLine} ${word}`).width;
        if(width < maxWidth) {
            currentLine += ` ${word}`;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
function getSubject() {
    return memefo.subjects.getRandom();
}
function getVerb() {
    return memefo.verbs.getRandom();
}
function getSubjectSingular() {
    return memefo.subjectsSingular.getRandom();
}
function getSubjectPlural() {
    return memefo.subjectsPlural.getRandom();
}
function subjectIsPlural(text) {
    if(text.startsWith("a ")) {
        return false;
    }
    return text.endsWith("s");
}
function formatSubformatLine(data,subformat,lastSubject=null) {
    let text = "";
    let skipSpace = false;
    subformat.forEach(token => {
        if(token.startsWith("@")) {
            const dataKey = token.substring(1);
            switch(dataKey) {
                default:
                    console.warn("Unknown subformat token",token);
                    throw Error("Unknown subformat token");
                case "verb-random":
                    text += getVerb();
                    break;
                case "subject-plural": {
                        const subject = getSubjectPlural();
                        text += subject;
                        lastSubject = subject;
                    }
                    break;
                case "subject-single": {
                        const subject = getSubjectSingular();
                        text += subject;
                        lastSubject = subject;
                    }
                    break;
                case "subject-random": {
                        const subject = getSubject();
                        text += subject;
                        lastSubject = subject;
                    }
                    break;
                case "subject":
                    if(!data.subject1) {
                        data.subject1 = getSubject();
                    }
                    text += data.subject1;
                    lastSubject = data.subject1;
                    break;
                case "second-subject":
                    if(!data.subject2) {
                        data.subject2 = getSubject();
                    }
                    text += data.subject2;
                    lastSubject = data.subject2;
                    break;
                case "verb":
                    if(!data.verb) {
                        data.verb = getVerb();
                    }
                    text += data.verb;
                    break;
            }
        } else if(token.endsWith("%")) {
            if(lastSubject) {
                text += token.substring(0,token.length-1);
                if(!subjectIsPlural(lastSubject)) {
                    text += "s";
                }
            } else {
                throw Error("Verb plural dynamicness must be used after a subject is used");
            }
        } else if(token.startsWith(">")) {
            text = text.substring(0,text.length-1);
            text += token.substring(1);
        } else if(token.endsWith(">")) {
            skipSpace = true;
            text += token.substring(0,token.length-1);
        } else {
            text += token;
        }
        if(skipSpace) {
            skipSpace = false;
        } else {
            text += " ";
        }
    });
    return text.substring(0,text.length-1);
}
const MemeFormats = {
    MEMEAKER_CLASSIC: new (function(){

        this.thirdPartyRequired = true;

        const fullWidth = 800;
        const fullHeight = 600;
        const halfWidth = fullWidth / 2;
        const halfHeight = fullHeight / 2;

        const memeTypes = [
            "VS-GO",
            "bSorV",
            "BonB"
        ];

        const getRandomMeme = subject => {
            const type = memeTypes[Math.floor(Math.random() * memeTypes.length)];
            const meme = {
                topLine: "",
                bottomLine: "",
                subject: subject || getSubject()
            }
            switch(type) {
                default:
                case "VS-GO": {
                        meme.topLine = `${getVerb()} ${meme.subject}`;
                        const s2 = getSubject();
                        meme.bottomLine = `get ${s2}`;
                    }
                    break;
                case "bSorV": {
                        meme.topLine = `be ${meme.subject}`;
                        if(Math.random() > 0.5) {
                            const s2 = getSubjectSingular();
                            meme.bottomLine = `or be ${s2}`;
                        } else {
                            meme.bottomLine = `or ${getVerb()}`;
                        }
                    }
                    break;
                case "BonB":
                    if(Math.random() > 0.5) {
                        meme.topLine = `to be ${meme.subject}`;
                        meme.bottomLine = `or not to be`;
                    } else {
                        meme.subject = getVerb();
                        meme.topLine = `to ${meme.subject}`;
                        meme.bottomLine = `or not to ${meme.subject}`;
                    }
                    break;
            }
            meme.topLine = meme.topLine.toUpperCase();
            meme.bottomLine = meme.bottomLine.toUpperCase();
            return meme;
        }

        const drawMemeText = (context,text,x,isTop) => {
            const size = 45;
            const antiMargin = 10;
            let y;
            if(isTop) {
                y = size - antiMargin;
            } else {
                y = fullHeight - size + antiMargin;
            }
            context.font = `${size}px impact`;
            context.textBaseline = "middle"; 
            context.textAlign = "center";
            context.strokeStyle = "black";
            context.lineWidth = 3;
            context.strokeText(text,x,y);
            context.fillStyle = "white";
            context.fillText(text,x,y);
        }

        this.render = (memeData,callback) => {
            const canvas = document.createElement("canvas");
            canvas.width = 800;
            canvas.height = 600;
            const context = canvas.getContext("2d");
            const meme = getRandomMeme(memeData.subject1);
            getFlickrImage(meme.subject,result => {
                if(result.failed) {
                    if(result.retryFirstParty) {
                        const newFormat = FirstPartyOnlyFormatList.getRandom();
                        newFormat.render(memeData,callback);
                    } else {
                        callback(result);
                    }
                } else {
                    const imageElement = new Image();
                    imageElement.onerror = () => {
                        console.warn("Could not load/parse an image URL received from Flickr");
                        callback({
                            failed: true
                        });
                    }
                    imageElement.onload = () => {
                        context.fillStyle = "white";
                        context.fillRect(0,0,fullWidth,fullHeight);
                        drawImageCover(context,imageElement,fullWidth,fullHeight);
                        drawMemeText(context,meme.topLine,halfWidth,true);
                        drawMemeText(context,meme.bottomLine,halfWidth,false);
                        callback({
                            element: canvas,
                            failed: false
                        });
                    }
                    imageElement.src = result.imagePath;
                }
            });
        }
    })(),
    SavagePatrick: new (function(){
        this.subformats = [
            ["when","@subject","look%","at","@second-subject"],
            ["when","@subject","don't","know how to use","@second-subject"],
            ["when","@subject","start%","to","@verb"],
            ["my face when","@subject","@verb"]
        ];
        this.res = {
            x: 532,
            y: 400
        };
        this.src = "patrick.jpg",
        this.render = (memeData,callback) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            const textMargin = 40;
            const xStart = 10;
            canvas.width = this.res.x;
            canvas.height = this.res.y;
            canvas.height += textMargin;
            context.font = "16px Arial";

            const image = new Image();
            image.onload = () => {
                setTimeout(()=>{
                    context.drawImage(image,0,textMargin);
                    context.fillStyle = "white";
                    context.fillRect(0,0,canvas.width,textMargin);
                    context.fillStyle = "black";
    
                    const text = formatSubformatLine(
                        memeData,
                        this.subformats.getRandom()
                    ).toLowerCase();
    
                    context.textBaseline = "middle";
                    context.fillText(text,xStart,textMargin/2);
    
                    callback({
                        element: canvas,
                        failed: false
                    });
                },FIRST_PARTY_DELAY);
            };
            image.onerror = () => {
                console.warn(`Failed to load ${this.src}`);
                callback({
                    failed: true
                });
            };
            image.src = this.src;
        };
    })(),
    SurprisedPikachu: new (function(){

        this.res = {
            x: 640,
            y: 710
        };

        this.src = "pikachu.jpg";

        const subformats = [
            ["@verb","@second-subject"],
            ["@verb","@subject"],
            ["gets","@subject-random"],
            ["@subject-single"],
            ["@verb-random","@subject-single"],
            ["*>","@verb-random","@subject-plural",">*"],
            ["*dies*"],
            ["*starts to","@verb-random",">*"],
            ["be","@subject-random"],
            ["wondering about","@subject-random"],
            ["thinking about","@subject-random"],
            ["hoping for","@subject-random"],
            ["wanting","@subject-random"],
            ["crying because of","@subject-random"],
        ];
        
        this.render = (memeData,callback) => {
            if(Math.random() < 0.25) {
                memeData.subject2 = "me";
            }
            if(!memeData.subject1) {
                memeData.subject1 = getSubject();
            }
            if(!memeData.subject2) {
                memeData.subject2 = getSubject();
            }
            if(Math.random() < 0.25) {
                const tmp = memeData.subject1;
                memeData.subject1 = memeData.subject2;
                memeData.subject2 = tmp;
            }
            const line1Prefix = `${memeData.subject1}: `;
            const line2Prefix = `${memeData.subject2}: `;

            const subformat1 = subformats[Math.floor(Math.random() * subformats.length)];
            const subformat2 = subformats[Math.floor(Math.random() * subformats.length)];

            const line1 = line1Prefix + formatSubformatLine(memeData,subformat1,memeData.subject1);
            const line2 = line2Prefix + formatSubformatLine(memeData,subformat2,memeData.subject2);
            const line3 = line1Prefix;

            const canvas = document.createElement("canvas");
            canvas.width = this.res.x;
            canvas.height = this.res.y;
            const context = canvas.getContext("2d");


            const image = new Image();
            image.onerror = () => {
                console.warn(`Failure to load ${this.src}`);
                callback({
                    failed: true
                });
            };
            image.onload = () => {
                setTimeout(()=>{
                    const xStart = 25;
                    context.fillStyle = "white";
                    context.fillRect(0,0,this.res.x,this.res.y);

                    context.drawImage(image,0,0);
    
                    context.font = "28px Calibri";
                    context.textBaseline = "middle";
                    context.fillStyle = "black";
    
                    context.fillText(line1,xStart,Math.floor(210 / 4 * 1));
                    context.fillText(line2,xStart,Math.floor(210 / 4 * 2));
                    context.fillText(line3,xStart,Math.floor(210 / 4 * 3));
    
                    callback({
                        element: canvas,
                        failed: false
                    });
                },FIRST_PARTY_DELAY);
            };
            image.src = this.src;
        }
    })()
}
const MemeFormatsList = Object.entries(MemeFormats);
const FirstPartyOnlyFormatList = [];
MemeFormatsList.forEach((memeFormat,idx) => {
    memeFormat[1].type = memeFormat[0];
    MemeFormatsList[idx] = memeFormat[1];
    if(memeFormat[1].src) {
        memeFormat[1].src = `${MemeFormatRoot}${memeFormat[1].src}`;
    }
    if(!memeFormat[1].thirdPartyRequired) {
        FirstPartyOnlyFormatList.push(memeFormat[1]);
    }
});
