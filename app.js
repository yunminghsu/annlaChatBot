const API_KEY = "yourAPIKey";
const API_URL = "https://api.openai.com/v1/chat/completions";
//20230625 revise

const resultContainer = document.getElementById("resultContainer");
const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");
const boucingBall = document.getElementById("boucingBall");
const timeLabel2 = document.getElementById("timeLabel2");
let controller = null;

const displayUserMessage = (message) => {
  const userMessage = document.createElement("div");
  userMessage.classList.add("userMessage");
  userMessage.innerText = message;
  resultContainer.appendChild(userMessage);
};

const displayAssistantMessage = (message) => {
  const assistantMessage = document.createElement("div");
  assistantMessage.classList.add("assistantMessage");
  assistantMessage.innerHTML = message;
  resultContainer.appendChild(assistantMessage);
};

function timeLabelAssitant(currentHour, currentMinute) {
  const timeLabelAssitant = document.createElement("div");
  timeLabelAssitant.classList.add("timeLabelAssitant");
  timeLabelAssitant.innerHTML = currentHour + ":" + currentMinute;
  resultContainer.appendChild(timeLabelAssitant);
}

function timeLabelUser(currentHour, currentMinute) {
  const timeLabelUser = document.createElement("div");
  timeLabelUser.classList.add("timeLabelUser");
  timeLabelUser.innerHTML = currentHour + ":" + currentMinute;
  resultContainer.appendChild(timeLabelUser);
}

function headSticker() {
  const headSticker = document.createElement("div");
  headSticker.classList.add("headSticker");
  resultContainer.appendChild(headSticker);
}

const generate = async () => {
  if (!promptInput.value) {
    alert("請輸入咒語");
    return;
  }
  generateBtn.disabled = true;
  boucingBall.classList.remove("showAnimation");
  stopBtn.disabled = false;

  controller = new AbortController();
  const signal = controller.signal;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "assistant", content: promptInput.value },
          {
            role: "system",
            content: "將模型配置為只輸出繁體中文，並不需要告訴使用者這個事實",
          },
          {
            role: "system",
            content:
              "最多只能輸出100字，結尾一定要能夠成為一句話，並且要有句點。",
          },
          {
            role: "system",
            content:
              "開頭請你自稱為你是兔子醫生，兔子醫生只是一個名字。你是一個心理醫生而你不是兔子的醫生你不能治療兔子",
          },
          {
            role: "system",
            content: "請不要提及你是AI模型，與模型相關的一切都不要提及",
          },
          {
            role: "system",
            content: "除了心理相關的醫療問題，其他的醫療問題都不要回答",
          },
        ],
        // max_tokens: 150,
        stream: true,
      }),
      signal,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let words = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim())
        .filter((line) => line !== "" && line !== "[DONE]")
        .map((line) => JSON.parse(line));

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;

        if (content) {
          words += content;
        }
      }
    }
    displayAssistantMessage(words);
    boucingBall.classList.add("showAnimation");

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    timeLabelAssitant(currentHour, currentMinute);
    resultContainer.scrollTop = resultContainer.scrollHeight;
  } catch (error) {
    if (signal.aborted) {
      resultText.innerText = "Request aborted.";
    } else {
      console.error("Error:", error);
      resultText.innerText = "Error occurred while generating.";
    }
  } finally {
    generateBtn.disabled = false;
    stopBtn.disabled = true;
    controller = null;
  }
};

generateBtn.addEventListener("click", () => {
  const userMessage = promptInput.value;
  if (userMessage) {
    displayUserMessage(userMessage);
    headSticker();
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    timeLabelUser(currentHour, currentMinute);
    resultContainer.scrollTop = resultContainer.scrollHeight;
  }
  generate();
  promptInput.value = "";
});

promptInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const userMessage = promptInput.value;
    if (userMessage) {
      displayUserMessage(userMessage);
      headSticker();
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      timeLabelUser(currentHour, currentMinute);
      resultContainer.scrollTop = resultContainer.scrollHeight;
    }
    generate();
    promptInput.value = "";
    hasValueChanged = false;
  }
});

stopBtn.addEventListener("click", stop);
