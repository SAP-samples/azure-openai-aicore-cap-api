# Register general Artifacts for Deployment in AI Core

Before you can start to interact with SAP AI Core, you will first need to register different
artifacts for your AI Core instance. These artifacts include setup details and credentials
that SAP AI Core needs in order to proceed. Duplicate the json files in the `/resources` directory, enter your attributes as well as credentials and remove the `.sample` appendix to:

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
with open(aic_service_key_path) as ask:
    aic_service_key = json.load(ask)

from ai_core_sdk.ai_core_v2_client import AICoreV2Client

# Create Connection
ai_core_client = AICoreV2Client(
    base_url = aic_service_key["serviceurls"]["AI_API_URL"] + "/v2", # The present AI API version is 2
    auth_url=  aic_service_key["url"] + "/oauth/token",
    client_id = aic_service_key["clientid"],
    client_secret = aic_service_key["clientsecret"]
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

with open(git_setup_file_path) as gs:
		git_key = json.load(gs)

ai_core_client.repositories.create(
    name = "azure-openai-aicore",
    url = f"https://github.com/{git_key['username']}/azure-openai-aicore-cap-api", # Forked repo
    username = git_key["username"],
    password = git_key["password"]
)
```
## Register an application

Register an application for your onboarded repository.

```python
# WARNING: Run only once

ai_core_client.applications.create(
    repository_url = f"https://github.com/{git_key['username']}/azure-openai-aicore-cap-api",
    path = "01-ai-core-azure-openai-proxy/scenario", # Scan this folder for instruction YAML files
    revision = "HEAD"
)
```

## Docker Secret (optional)

To register your Docker secret, do the following:

```python
with open(docker_secret_file_path) as dsf:
    docker_secret = json.load(dsf)


response = ai_core_client.docker_registry_secrets.create(
    name = docker_secret["name"],
    data = docker_secret["data"]
)

print(response.__dict__)
```

## Create a resource group

Now, create a resource group. Think of it as a scope for your registered artifacts.

```python
# For Free Tier AI Core Serice:
#  you will not be able to create a new resource group.
#  resource group named `default` exists in all systems.
#  cell execution does not impact existing contents
#
# For paid AI Core service: 
#  IF you wish execute this step
#  You are NOT REQUIRED TO RE-EXECUTE or Redo previous completed steps.
#  Ensure that in the steps that follows modify with your resource group name

resource_group_id = "default" # For free tier; `default` exsits in all systems
# resource_group_id = "my-openai-proxy-ns" # For paid account you can create a namespace aka resource group
                                              # Other steps 

response = ai_core_client.resource_groups.create(resource_group_id = resource_group_id)
print(response.__dict__)
```
