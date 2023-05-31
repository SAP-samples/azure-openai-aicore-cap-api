//@requires: 'authenticated-user'
service AIService {

    type GPTTextResponse {
        text : String;
    }

    action aiCompletionProxy(prompt : String)     returns GPTTextResponse;
    action aiChatCompletionProxy(prompt : String) returns GPTTextResponse;
}
