import cds from "@sap/cds";

// PARAMETERS FOR AZURE OPENAI SERVICES CHAT COMPLETION API
const ENGINE = "ic2023q2gpt"; // DEPLOYMENT ID FOR GPT-3.5-TURBO
const MAX_TOKENS = 500;
const TEMPERATURE = 0.8;
const FREQUENCY_PENALTY = 0;
const PRESENCE_PENALTY = 0;
const STOP_SEQUENCE = null;

const GPT_PARAMS = {
    deployment_id: ENGINE,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    frequency_penalty: FREQUENCY_PENALTY,
    presence_penalty: PRESENCE_PENALTY,
    stop: STOP_SEQUENCE
};

// handler for ai-service.cds
export class AIService extends cds.ApplicationService {
    /**
     * Define handlers for CAP actions
     */
    async init() {
        await super.init();
        this.on("aiProxy", this.aiProxyAction);
    }

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
    aiProxyAction = async (req) => {
        const { prompt } = req.data;
        const response = await this.callAIProxy(prompt);
        return { text: response["choices"][0].message.content };
    };

    /**
     * Forwards prompt of the payload via a destination (mapped as AICoreAzureOpenAIDestination) through an SAP AI Core deployed service to Azure OpenAI services
     *
     * @param {string} prompt
     * @returns raw response from Azure OpenAI services for Completions (see https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#example-response-2)
     */
    callAIProxy = async (prompt) => {
        const openai = await cds.connect.to("AICoreAzureOpenAIDestination");
        const payload = {
            ...GPT_PARAMS,
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
