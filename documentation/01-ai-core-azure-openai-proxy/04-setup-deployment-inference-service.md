# Setup and Deployment of Inference service in AI Core

To deploy a proxy (as an inference service), you first need to create a serving configuration. It keeps
information about which scenario to use, what the parameters and artifacts to use as well as some more metadata like the ID of the AI Scenario. Please execute the following steps from the [proxy.ipynb](../../01-ai-core-azure-openai-proxy/proxy.ipynb) to achieve the inference deployment.

## Serving Configuration

The configuration serves some metadata, like the ID of the AI Scenario and which workflow
to use for serving. Further, one has to specify what artifacts and parameters to use for serving, which
in this case is paremeters for the docker repository as well as for the Azure OpenAI service. To create the configuration, execute the following code:

```python
with open(env_file_path) as efp:
    env_val = json.load(efp)

OPENAI_API_BASE = env_val["OPENAI_API_BASE"]
OPENAI_API_KEY = env_val["OPENAI_API_KEY"]
DOCKER_NAMESPACE = env_val["DOCKER_NAMESPACE"]

# No modification required in below snippet
response = ai_core_client.configuration.create(
    name = "azure-proxy-serve",
    scenario_id = "azure-openai-proxy",
    executable_id = "azure-openai-proxy",
    input_artifact_bindings = [],
    parameter_bindings = [
        ParameterBinding(key = "OPENAI_API_BASE", value = OPENAI_API_BASE),
        ParameterBinding(key = "OPENAI_API_KEY", value = OPENAI_API_KEY), 
        ParameterBinding(key = "DOCKER_NAMESPACE", value = DOCKER_NAMESPACE)
    ],
    resource_group = resource_group_id
)


serve_config_resp = response
print(response.__dict__)
```

If the serving configuration has been created successfully, it should show up
in AI Launchpad under the ML Operations > Configurations tab:

![Serving configuration](resources/config-serve.png)

> **Note**
> To display and interact with the SAP AI Core instance on SAP AI Launchpad, you first need to [add the connection in SAP AI Launchpad to SAP AI Core](https://help.sap.com/docs/ai-launchpad/sap-ai-launchpad/add-connection-to-sap-ai-core).

## Serve the proxy as inference service

AI Core can now use the information from the serving configuration to finally deploy the service that makes the proxy available for inference requests. To do so,
run this code:

```python
# Start proxy
response = ai_core_client.deployment.create(
    configuration_id=serve_config_resp.id,
    resource_group=resource_group_id
)

deployment_resp = response
print(response.__dict__)
```

```python
# Poll deployment status.
# No modification required in below snipet
status = None
while status != Status.RUNNING and status != Status.DEAD:
    time.sleep(5)
    clear_output(wait=True)
    # Get Status
    #
    deployment = response = ai_core_client.deployment.get(
        deployment_id=deployment_resp.id,
        resource_group=resource_group_id
    )
    status = deployment.status
    print("...... deployment status ......", flush=True)
    print(deployment.status)
    pprint(deployment.status_details)

    if deployment.status == Status.RUNNING:
        print(f"Deployment with {deployment_resp.id} complete!")

# Allow some time for deployment URL to get ready.
time.sleep(10)
```

AI Core will need some time now to finish the deployment of the service. Once
the proxy has been deployed the deployment should be marked as _RUNNING_ in AI
Launchpad under the Deployments tab where you are also able to see your Deployment ID:

![Deployment running](resources/deployment-running.png)
