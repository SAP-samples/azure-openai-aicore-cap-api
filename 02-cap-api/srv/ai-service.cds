//@requires: 'authenticated-user'
service AIService {

    type GPTTextResponse {
        text : String;
    }

    action aiProxy(prompt : String) returns GPTTextResponse;
}