# Register general Artifacts for Deployment in AI Core

Before you can start to interact with SAP AI Core, you will first need to register different
artifacts for your AI Core instance. These artifacts include setup details and credentials
that AI Core needs in order to proceed. Duplicate the json files in the `/resources` directory, enter your attributes as well as credentials and remove the `.sample` appendix to:

- `aic_service_key.json`: Service key of your AI Core instance.
- `git_setup.json`: Details of this GitHub repository (or yours if you forked) like the repository URL. You are
  going to onboard this repository in a later step.
- `docker_secret.json`: Your Docker secret (optional, if you use your own docker image and the related repository is set to private). Make sure to use a Docker Hub Personal Access Token
  (PAT) instead of your normal Docker Hub password. The AI Core instance needs this secret
  to pull the docker images from your Docker Hub repository later on for training and serving.
- `env.json`: Environment variblaes for specifying the Docker namespace (of the built Docker image) and Azure OpenAI services details (BYOA; Bring your own Account). To further proceed, it is mandatory to have an Azure OpenAI Services endpoint and API Key.

Next, follow and execute the first few steps inside the [proxy.ipynb](../../01-ai-core-azure-openai-proxy/proxy.ipynb) file. In the
following steps, the AI API Python SDK is used to interact with the AI Core instance and
the AI API. The jupyter notebook can be executed from e.g., [Visual Studio Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [running on a jupyter notebook server](https://jupyter-notebook.readthedocs.io/en/stable/public_server.html).

## Connect to your AI Core instance

Read the credentials from your AI Core service key file and create an AI API
client.

```python
# Load Library
from ai_core_sdk.ai_core_v2_client import AICoreV2Client

# Create Connection
ai_core_client = AICoreV2Client(
    base_url = "<YOUR_AI_API_URL>" + "/v2", # The present SAP AI Core API version is 2
    auth_url=  "<YOUR_url>" + "/oauth/token", # Suffix to add
    client_id = "<YOUR_clientid>",
    client_secret = "<YOUR_clientsecret>"
)
```

## Test connection

```python
response = ai_core_client.repositories.query()
print(response.count) # Should return integer value else your values in above step are incorrect
```

## Onboard the Git repository

You need a git repository on GitHub that contains the workflow files that will be used for
training and serving. Onboard this repository by doing the following:

```python
# WARNING: Refrain from onboarding again if previously onboarded
#  else you will get AIAPIServerException 409

ai_core_client.repositories.create(
    name = "azure-openai-aicore",
    url = "https://github.com/<YOUR_GITHUB_USERNAME>/azure-openai-aicore-cap-api", # Forked repo
    username = "<YOUR_GITHUB_USERNAME>",
    password = "<YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>" # To Generate check: https://developers.sap.com/tutorials/ai-core-helloworld.html#7ab4912e-2277-496b-84d9-7f1c9ef2365c
)
```

## Register an application

Register an application for your onboarded repository.

```python

ai_core_client.applications.create(
    repository_url = "https://github.com/<YOUR_GITHUB_USERNAME>/azure-openai-aicore-cap-api",
    path = "01-ai-core-azure-openai-proxy/scenario", # Scan this folder for instruction YAML files
    revision = "HEAD"
)
```

```python
# List scenarios scanned by the application created above
response = ai_core_client.scenario.query(resource_group='default')

for scenario in response.resources:
    print(scenario.__dict__)
```

## Docker Secret (optional)

To register your Docker secret, do the following:

```python
docker_secret = {
  "name": "docker-credentials",
  "data": {
    ".dockerconfigjson": "{\"auths\": {\"https://index.docker.io\": {\"username\": \"<USERNAME>\", \"password\": \"<DOCKER-HUB-PAT-TOKEN>\"}}}"
  }
}


response = ai_core_client.docker_registry_secrets.create(
    name = docker_secret["name"],
    data = docker_secret["data"]
)

print(response.__dict__)
```

## Create a resource group (Optional)

Now, create a resource group. Think of it as a scope for your registered artifacts.

- **For Free Tier AI Core Serice**: you will not be able to create a new resource group. ** A resource group named `default` exists in all systems.** Below code snipet  execution does not impact existing contents.
- **For paid AI Core service**: If you wish execute this step. You are NOT REQUIRED TO RE-EXECUTE or Redo previous completed steps. Ensure that in the steps that follows modify with your resource group name.


```python
resource_group_id = "default" # For free tier; `default` exsits in all systems
# resource_group_id = "my-openai-proxy-ns" # For paid account you can create a namespace aka resource group
                                              # Other steps 

response = ai_core_client.resource_groups.create(resource_group_id = resource_group_id)
print(response.__dict__)
```
