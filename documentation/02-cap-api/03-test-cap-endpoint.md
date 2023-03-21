## Deploy CAP API

To test the action on the deployed CAP API endpoint you can e.g. use the API Platform Postman.

1. Create new POST request
2. Enter the request URL `<BASEURL>/ai/aiProxy`
3. Add the authorization details of your UAA instance for the type OAuth 2.0
4. Specify a prompt as JSON payload in the Body, e.g.:

```JSON
{
    "prompt": "Please tell me a joke about SAP technology!"
}
```

5. Send the request and inspect the response with the generated text:

_What did the SAP consultant say when asked to solve a problem?_
_Answer: "Let me just SAP it up!_

```JSON
{
    "@odata.context": "$metadata#AIService.GPTTextResponse",
    "text": "\n\nQ: What did the SAP consultant say when asked to solve a problem?\nA: \"Let me just SAP it up!\""
}
```
