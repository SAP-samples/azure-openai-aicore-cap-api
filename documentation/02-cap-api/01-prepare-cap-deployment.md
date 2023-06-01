# Prepare the CAP API sample for Deployment

Once the proxy via SAP AI Core is running ([see steps here](/01-ai-core-azure-openai-proxy/README.md)), you are able to prepare the CAP API sample in order to deploy it to a SAP BTP, Cloud Foundry Runtime in your Subaccount.

On the CAP application, the destination pointing to your proxy is defined in the `package.json` (including the path to your deployed proxy with the deployment id as shown in [Deploy the Inference Service on SAP AI Core as Proxy for Azure OpenAI Services](/documentation/01-ai-core-azure-openai-proxy/04-setup-deployment-inference-service.md)):

```json
{
    "name": "cap",
    "cds": {
        "requires": {
            "AICoreAzureOpenAIDestination": {
                "kind": "rest",
                "credentials": {
                    "destination": "openai-aicore-api",
                    "path": "/v2/inference/deployments/<YOUR_AICORE_DEPLOYMENT_ID>"
                }
            }
        }
    },
    ...
}
```

In the `/srv` directoy of the CAP API sample, there is an action defined in the service `ai-service.cds` which takes a string (prompt) as payload:

```typescript
@requires : 'authenticated-user'
service AIService {

    type GPTTextResponse {
        text : String;
    }

    action aiProxy(prompt : String) returns GPTTextResponse;
}
```

The Javascript (`ai-service.js`) / TypeScript handler (`ai-service.ts`) further processes the action by hooking the function `aiProxyAction`. Please specify your engine in the attribute `const ENGINE` which can be found after deploying a OpenAI model on Azure:

```typescript
import { ApplicationService } from "@sap/cds";
import { Request, ResultsHandler } from "@sap/cds/apis/services";

// PARAMETERS FOR AZURE OPENAI SERVICES CHAT COMPLETION API
const ENGINE = "YOUR_ENGINE_OF_AZURE_OPENAI_SERVICES"; // DEPLOYMENT ID FOR GPT-3.5-TURBO
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
class AIService extends ApplicationService {

    /**
     * Define handlers for CAP actions
     */
    async init(): Promise<void> {
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
    private aiProxyAction = async (req: Request): Promise<any | undefined> => {
        const { prompt } = req.data;
        const response = this.callAIProxy(prompt);
        return { text: response["choices"][0].message?.content };
    };


    /**
     * Forwards prompt of the payload via a destination (mapped as AICoreAzureOpenAIDestination) through an SAP AI Core deployed service to Azure OpenAI services
     *
     * @param {string} prompt
     * @returns raw response from Azure OpenAI services for Completions (see https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#example-response-2)
     */
    private callAIProxy = (prompt: string): Promise<any | undefined> => {
        const openai = await cds.connect.to("AICoreAzureOpenAIDestination");
        const payload = {
            ...GPT_PARAMS,
            messages: [
                { role: "system", content: "Assistant is a large language model trained by OpenAI" },
                { role: "user", content: prompt }
            ]
        };

        // @ts-ignore
        const response = await openai.send({
            // @ts-ignore
            query: "POST /v2/chat-completion",
            data: payload
        });
        return response;
    }
}
```
