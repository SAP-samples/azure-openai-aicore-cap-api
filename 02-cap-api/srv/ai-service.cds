//@requires: 'authenticated-user'
service AIService {

    type GPTTextResponse {
        text : String;
    }

    action aiChatCompletionProxy(prompt : String) returns GPTTextResponse;
}
