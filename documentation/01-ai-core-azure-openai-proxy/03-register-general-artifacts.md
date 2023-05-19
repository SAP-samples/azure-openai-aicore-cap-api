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
- `env.json`: Environment variblaes for specifying the Docker namespace and Azure OpenAI services details (BYOA)

Next, follow the first few steps inside the [proxy.ipynb](../../01-ai-core-azure-openai-proxy/proxy.ipynb) file. In the
following steps the AI API Python SDK is used to interact with the AI Core instance and
the AI API.

## Connect to your AI Core instance

Read the credentials from your AI Core service key file and create an AI API
client.

```python
with open(aic_service_key_path) as ask:
    aic_service_key = json.load(ask)

# AI API client that talks to the AI Core instance.
ai_api_client = AIAPIV2Client(
    base_url = aic_service_key["serviceurls"]["AI_API_URL"] + "/v2", # The present AI API version is 2
    auth_url=  aic_service_key["url"] + "/oauth/token",
    client_id = aic_service_key["clientid"],
    client_secret = aic_service_key["clientsecret"]
)
```

## Onboard the Git repository

You need a git repository on GitHub that contains the workflow files that will be used for
training and serving. Onboard this repository by doing the following:

```python
with open(git_setup_file_path) as gs:
		setup_json = json.load(gs)

repo_json = setup_json["repo"]

response = ai_api_client.rest_client.post(
		path="/admin/repositories",
		body={
            "name": repo_json["name"],
            "url": repo_json["url"],
            "username": repo_json["username"],
            "password": repo_json["password"]
		}
)
print(response)
```

## Register an application

Register an application for your onboarded repository.

```python
app_json = setup_json["app"]
response = ai_api_client.rest_client.post(
		path="/admin/applications",
		body={
            "applicationName": app_json["applicationName"],
            "repositoryUrl": app_json["repositoryUrl"],
            "revision": app_json["revision"],
            "path": app_json["path"]
		}
)
```

## Docker Secret (optional)

To register your Docker secret, do the following:

```python
with open(docker_secret_file_path) as dsf:
    docker_secret = json.load(dsf)

pprint(docker_secret)

response = ai_api_client.rest_client.post(
    path="/admin/dockerRegistrySecrets",
    body={
        "name": docker_secret["name"],
        "data": docker_secret["data"]
    }
)
print(response)
```

## Create a resource group

Now, create a resource group. Think of it as a scope for your registered artifacts.

```python
ai_api_client.rest_client.post(
    path="/admin/resourceGroups",
    body={
        "resourceGroupId": resource_group
    }
)
```
