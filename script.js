const loadingGifs = document.getElementById("loading-gifs");
const loadingGifsContainer = document.getElementById("gifs-container");
const readyButton = document.getElementById("ready-button");
const memeSettings = document.getElementById("meme-settings");
const subtitle = document.getElementById("subtitle");
const renderResults = document.getElementById("render-results");
const subjectInput = document.getElementById("subject-input");
const memeTypeSelector = document.getElementById("meme-type-selector");
const MAX_SUBJECT_LENGTH = "raven and hose".length;

const GODS_FAILED_FORMAT_TEXT = "The gods cannot make a meme with this subject and this type. Try another format?";
const GODS_FAILED_TEXT = "The gods were unable to generate a meme at this time. Try again?";
const GODS_SPOKEN_TEXT = "The gods have spoken";
const MAX_PREVIOUS_RESULTS = 6;

let loadingGifIndex = 0;
const thinkingMessageRefresh = 2500;
const thinkingTexts = [
    "The gods are thinking...",
    "The gods are not sure what to do",
    "Wait. I think they got it.",
    "Wait... Nope",
    "Still thinking...",
    "More thinking...",
    "thinking...",
    "t h i n k i n g",
    "The abstract concept but not the actuality of thinking",
    "I think the gods are almost done thinking",
    "Someday the gods will finish thinking",
    "This might be a really good meme",
    "I hope you are ready for this",
    "I am not even ready for this",
    "The gods aren't ready for it either",
    "Are you seriously still waiting?",
    "Wow. Slow day for the gods",
    "Okay tell you what - the gods might have given up",
    "Wait I take that back",
    "I've just heard from them",
    "They have a message for me to tell you...",
    "They said: The gods are thinking",
    "Seriously..."
];
let thinkingIndex = 0;
let thinkingThread = null;

const updateThinkingText = () => {
    thinkingIndex = (thinkingIndex + 1) % thinkingTexts.length;
    subtitle.textContent = thinkingTexts[thinkingIndex];
}
const startThinkingText = () => {
    thinkingIndex = -1;
    updateThinkingText();
    thinkingThread = setInterval(updateThinkingText,thinkingMessageRefresh);
}
const endThinkingText = () => {
    clearInterval(thinkingThread);
}
const ShowLoadingGif = () => {
    startThinkingText();
    memeSettings.setAttribute("hidden",true);
    renderResults.setAttribute("hidden",true);
    loadingGifs.removeAttribute("hidden");
    loadingGifsContainer.children[loadingGifIndex].setAttribute("hidden",true);
    loadingGifIndex = (loadingGifIndex + 1) % loadingGifsContainer.children.length;
    loadingGifsContainer.children[loadingGifIndex].removeAttribute("hidden");
}
const HideLoadingGif = () => {
    endThinkingText();
    renderResults.removeAttribute("hidden");
    memeSettings.removeAttribute("hidden");
    loadingGifs.setAttribute("hidden",true);
}
const rewriteCanvasElement = (canvasElement,callback) => {
    const dataURL = canvasElement.toDataURL();
    const imageElement = new Image();
    imageElement.src = dataURL;
    imageElement.className = "materialboxed";
    callback({
        element: imageElement,
        failed: false
    });
}
let usingFixedFormat = false;
const getCurrentMemeFormat = () => {
    usingFixedFormat = true;
    switch(Number(memeTypeSelector.value)) {
        default:
        case 0:
            usingFixedFormat = false;
            return MemeFormatsList.getRandom();
        case 1:
            return MemeFormats.MEMEAKER_CLASSIC;
        case 2:
            return MemeFormats.SurprisedPikachu;
        case 3:
            return MemeFormats.SavagePatrick;
        case 4:
            return MemeFormats.BlackJacket;
        case 5:
            return MemeFormats.ConfusedAnimeGuy;
    }
}

const readyButtonClicked = () => {
    ShowLoadingGif();
    const memeFormat = getCurrentMemeFormat();
    const callback = result => {
        if(result.failed) {
            if(result.forcedFormatFailure) {
                subtitle.textContent = GODS_FAILED_FORMAT_TEXT;
            } else {
                subtitle.textContent = GODS_FAILED_TEXT;
            }
            HideLoadingGif();
            return;
        } else {
            rewriteCanvasElement(result.element,result=>{
                HideLoadingGif();
                if(result.failed) {
                    subtitle.textContent = GODS_FAILED_TEXT;
                    return;
                } else {
                    subtitle.textContent = GODS_SPOKEN_TEXT;
                    renderResults.insertBefore(
                        result.element,
                        renderResults.children[0]
                    );
                    if(renderResults.children.length > MAX_PREVIOUS_RESULTS) {
                        renderResults.removeChild(renderResults.lastChild);
                    }
                    const renderResultImages = renderResults.querySelectorAll(".materialboxed");
                    M.Materialbox.init(renderResultImages,null);
                }
            });
        }
    }
    const memeData = {};
    if(subjectInput.value) {
        subjectInput.value = subjectInput.value.substring(0,MAX_SUBJECT_LENGTH);
        memeData.subject1 = subjectInput.value;
    }
    try {
        memeFormat.render(memeData,callback);
    } catch(error) {
        HideLoadingGif();
        subtitle.textContent = GODS_FAILED_TEXT;
        console.error(error);
    }
    return false;
}
readyButton.addEventListener("click",readyButtonClicked);
M.AutoInit();
