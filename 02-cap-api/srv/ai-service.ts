import { ApplicationService } from "@sap/cds";
import { Request } from "@sap/cds/apis/services";

// PARAMETERS FOR AZURE OPENAI SERVICES
const ENGINE = "YOUR_ENGINE_OF_AZURE_OPENAI_SERVICES"
const MAX_TOKENS = 500;
const TEMPERATURE = 0.8;
const FREQUENCY_PENALTY = 0;
const PRESENCE_PENALTY = 0;
const TOP_P = 0.5;
const BEST_OF = 1;
const STOP_SEQUENCE = null;

const GPT_PARAMS = {
    engine: ENGINE,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    frequency_penalty: FREQUENCY_PENALTY,
    presence_penalty: PRESENCE_PENALTY,
    top_p: TOP_P,
    best_of: BEST_OF,
    stop: STOP_SEQUENCE,
};

// handler for ai-service.cds
export class AIService extends ApplicationService {
    
    /**
     * Define handlers for CAP actions
     */
    async init(): Promise<void> {
        await super.init();
        this.on("aiProxy", this.aiProxyAction);
    }

    /**
     * Action forwarding prompt to through AI Core provided proxy
     */
    private aiProxyAction = async (req: Request): Promise<any | undefined> => {
        const { prompt } = req.data;
        const response = await this.callAIProxy(prompt);
        return { text: response["choices"][0].text };
    };

    /**
     * Forwards prompt of the payload via a destination (mapped as AICoreAzureOpenAIDestination) through an AI Core deployed service to Azure OpenAI services
     */
    private callAIProxy = async (prompt: string): Promise<any | undefined> => {
        const openai = await cds.connect.to("AICoreAzureOpenAIDestination");
        const payload: any = {
            ...GPT_PARAMS,
            prompt: prompt,
        };

        // @ts-ignore
        const response: any = await openai.send({
            // @ts-ignore
            query: "POST /v2/completion",
            data: payload,
        });
        return response;
    };
}