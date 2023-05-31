import cds from "@sap/cds";

// PARAMETERS FOR AZURE OPENAI SERVICES COMPLETION API
const ENGINE = "YOUR_ENGINE_OF_AZURE_OPENAI_SERVICES"; // DEPLOYMENT ID FOR DAVINCI
const MAX_TOKENS = 500;
const TEMPERATURE = 0.8;
const FREQUENCY_PENALTY = 0;
const PRESENCE_PENALTY = 0;
const TOP_P = 0.5;
const BEST_OF = 1;
const STOP_SEQUENCE = null;

// PARAMETERS FOR AZURE OPENAI SERVICES CHAT COMPLETION API
const ENGINE_GPT_35_TURBO = "YOUR_ENGINE_OF_AZURE_OPENAI_SERVICES"; // DEPLOYMENT ID FOR GPT-3.5-TURBO

const GPT_PARAMS = {
    deployment_id: ENGINE,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    frequency_penalty: FREQUENCY_PENALTY,
    presence_penalty: PRESENCE_PENALTY,
    top_p: TOP_P,
    best_of: BEST_OF,
    stop: STOP_SEQUENCE
};

// handler for ai-service.cds
export class AIService extends cds.ApplicationService {
    /**
     * Define handlers for CAP actions
     */
    async init() {
        await super.init();
        this.on("aiCompletionProxy", this.aiCompletionProxyAction);
        this.on("aiChatCompletionProxy", this.aiChatCompletionProxyAction);
    }

    /**
     * ========================
     * COMPLETION (see https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#completions)
     * ========================
     */

    /**
     * Action forwarding prompt to Azure OpenAI services through SAP AI Core provided proxy
     *
     * @param {Request} req
     * @returns GPTTextResponse { text : string }
     */
    aiCompletionProxyAction = async (req) => {
        const { prompt } = req.data;
        const response = await this.callCompletionAIProxy(prompt);

        return { text: response["choices"][0].text };
    };

    /**
     * Forwards prompt of the payload via a destination (mapped as AICoreAzureOpenAIDestination) through an SAP AI Core deployed service to Azure OpenAI services
     *
     * @param {string} prompt
     * @returns raw response from Azure OpenAI services for Completions (see https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#example-response)
     */
    callCompletionAIProxy = async (prompt) => {
        const openai = await cds.connect.to("AICoreAzureOpenAIDestination");
        const payload = {
            ...GPT_PARAMS,
            prompt: prompt
        };
        const response = await openai.send({
            query: "POST /v2/completion",
            data: payload
        });
        return response;
    };

    /**
     * ========================
     * CHAT COMPLETION (see https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#chat-completions)
     *
     * !!! Note: The following action currently supports only non-chat use cases.
     * !!! For chat based use cases the payload of the messages needs to be adjusted (see https://platform.openai.com/docs/guides/chat)
     * !!! Also have a look at the markup lang ChatML of OpenAI https://github.com/openai/openai-python/blob/main/chatml.md
     * ========================
     */

    /**
     * Action forwarding prompt to Azure OpenAI services through SAP AI Core provided proxy
     *
     * @param {Request} req
     * @returns GPTTextResponse { text : string }
     */
    aiChatCompletionProxyAction = async (req) => {
        const { prompt } = req.data;
        const response = await this.callChatCompletionAIProxy(prompt);
        return { text: response["choices"][0].message.content };
    };

    /**
     * Forwards prompt of the payload via a destination (mapped as AICoreAzureOpenAIDestination) through an SAP AI Core deployed service to Azure OpenAI services
     *
     * @param {string} prompt
     * @returns raw response from Azure OpenAI services for Completions (see https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#example-response-2)
     */
    callChatCompletionAIProxy = async (prompt) => {
        const openai = await cds.connect.to("AICoreAzureOpenAIDestination");
        const payload = {
            // gpt-3.5-turbo params
            deployment_id: ENGINE_GPT_35_TURBO,
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE,
            frequency_penalty: FREQUENCY_PENALTY,
            presence_penalty: PRESENCE_PENALTY,
            stop: STOP_SEQUENCE,
            messages: [
                { role: "system", content: "Assistant is a large language model trained by OpenAI" },
                { role: "user", content: prompt }
            ]
        };
        const response = await openai.send({
            query: "POST /v2/chat-completion",
            data: payload
        });
        return response;
    };
}
