from business.services.loggerInteface import ILogger
from openai import OpenAI


class ChatCompeleteService:
    def __init__(self, logger: ILogger, apiKey: str):
        self._logger = logger
        self._client = OpenAI(api_key=apiKey)
    
    def helloWord(self):
        completion = self._client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
                {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming."}
            ]
        )

        self._logger.log(completion.choices[0].message)