# Test the deployed Inference service

Now that the inference service (proxy) is running, send a request with the prompt, your engine (Azure OpenAI services deployment ID) and additional parameters for the model to the service and receive the OpenAI model response. You can use the following code snippet from the [proxy.ipynb](../../01-ai-core-azure-openai-proxy/proxy.ipynb) for that:

> **Note**
> When it comes to an inference request, make sure to change the **engine** to your deployment id of the respected OpenAI service from Azure.

```python
endpoint = f"{deployment.deployment_url}/v2/envs"
headers = {"Authorization": ai_core_client.rest_client.get_token(),
           "ai-resource-group": "default",
           "Content-Type": "application/json"}
response = requests.get(endpoint, headers=headers)

legacy_davinci = False # set True if you have a davinci model deployment on Azure OpenAI Services
if legacy_davinci:
    body = {
        "engine": "<YOUR ENGINE>", # include your davinci engine from a deployment of an Azure OpenAI services model
        "prompt": "Classify the following news article into 1 of the following categories: categories: [Business, Tech, Politics, Sport, Entertainment]\n\nnews article: Donna Steffensen Is Cooking Up a New Kind of Perfection. The Internet’s most beloved cooking guru has a buzzy new book and a fresh new perspective:\n\nClassified category:",
        "max_tokens": 60,
        "temperature": 0,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "top_p": 1,
        "best_of": 1,
        "stop": "null"
    }
    endpoint = f"{deployment.deployment_url}/v2/completion"
else:
    body = {
        "engine": "<YOUR ENGINE>", # include your engine from a deployment of an Azure OpenAI services model
        "prompt": "Classify the following news article into 1 of the following categories: categories: [Business, Tech, Politics, Sport, Entertainment]\n\nnews article: Donna Steffensen Is Cooking Up a New Kind of Perfection. The Internet’s most beloved cooking guru has a buzzy new book and a fresh new perspective:\n\nClassified category:",
        "max_tokens": 60,
        "temperature": 0,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "stop": "null"
    }
    endpoint = f"{deployment.deployment_url}/v2/chat-completion"

headers = {"Authorization": ai_core_client.rest_client.get_token(),
           "ai-resource-group": "default",
           "Content-Type": "application/json"}
response = requests.post(endpoint, headers=headers, json=body)

print("Inference result:", response.json())
pprint(vars(response))
```

Once you are done with testing and you don't need the proxy anymore, you could kill the deployment to save resources, by running this code from [proxy.ipynb](../../01-ai-core-azure-openai-proxy/proxy.ipynb):

```python
delete_resp = ai_core_client.deployment.modify(deployment_resp.id,
                                                 target_status=Status.STOPPED,
                                              resource_group="default")
status = None
while status != Status.STOPPED:
    time.sleep(5)
    clear_output(wait=True)
    deployment = ai_core_client.deployment.get(deployment_resp.id, resource_group="default")
    status = deployment.status
    print("...... killing deployment ......", flush=True)
    print(f"Deployment status: {deployment.status}")
```

AI Core will take some time to finish killing the deployment. Afterwards you decide at any point to deploy the inference service again.

# Play around with your AI Core service

Feel free to experiment some more with the inference service by making multiple requests with different sample data. See how the models' predictions differ based on different input data.
