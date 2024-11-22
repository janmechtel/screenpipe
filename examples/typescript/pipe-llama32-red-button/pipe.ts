import { ContentItem, pipe } from "@screenpipe/js";

import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider";
import readline from 'readline';


async function generateLLMReply(
  screenData: ContentItem[],
  ollamaApiUrl: string,
  ollamaModel: string
): Promise<string> {
  const prompt = `based on the following screen data, elaborate on what is going wrong for the user, and why the user is stucked:

    ${JSON.stringify(screenData)}

    `;

  const provider = createOllama({
    baseURL: ollamaApiUrl,
  });

  console.log("prompt sent to LLM: ", prompt);
  const response = await generateText({
    model: provider(ollamaModel),
    messages: [{ role: "user", content: prompt }],

  });
  console.log("ai response", response);

  return response.text;
}

async function createRedButtonPipe(): Promise<void> {
  console.log("starting listening for red button events");

 // Set up input interface
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdin.on('keypress', (str, key) => {
  if (key.name === 'f1') {
    console.log('F1 key was pressed!');
    helpTheUser()
  }

});
}

async function helpTheUser(): Promise<void> {

  const config = await pipe.loadPipeConfig();
  console.log("loaded config:", JSON.stringify(config, null, 2));

  const interval = config.interval * 1000;
  const ollamaApiUrl = config.ollamaApiUrl;
  const ollamaModel = config.ollamaModel;
  const windowName = config.windowName;
  const contentType = config.contentType;

    const now = new Date();
    const intervalAgo = new Date(now.getTime() - interval);
  try {
    const screenData = await pipe.queryScreenpipe({
      startTime: intervalAgo.toISOString(),
      endTime: now.toISOString(),
      limit: config.pageSize,
      contentType: contentType,
      windowName: windowName,
      focus: true,
    });

    console.log("grabbed screen data");

    if (screenData && screenData.data.length > 0) {
      // step 1: ask llm to generate a function call to search linear tasks
      const response = await generateLLMReply(
        screenData.data,
        ollamaApiUrl,
        ollamaModel
      )}
     }
      catch (error: any) {}
}

createRedButtonPipe();
